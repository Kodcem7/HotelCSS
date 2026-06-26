using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using HotelCSS.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Security.Claims;
using System.Linq;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RequestController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly IHubContext<NotificationHub> _hubContext;
        public RequestController(IUnitOfWork unitOfWork, IWebHostEnvironment hostEnvironment, IHubContext<NotificationHub> hubContext)
        {
            _unitOfWork = unitOfWork;
            _hostEnvironment = hostEnvironment;
            _hubContext = hubContext;
        }

        [HttpPost("ReportIssue")]
        [Authorize(Roles = SD.Role_Room)]
        public async Task<IActionResult> ReportIssueAsync([FromForm] IssueCreateDTO obj)
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                return BadRequest(new { success = false, message = "User identity not found." });
            }

            string userId = claim.Value;
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Issue object is null" });
            }

            var roomUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
            if (roomUser == null)
            {
                return BadRequest(new { success = false, message = "User not found" });
            }

            string roomNumString = roomUser.UserName.Replace("Room", "");
            if (!int.TryParse(roomNumString, out int roomNumber))
            {
                return BadRequest(new { success = false, message = "Invalid Room User Format" });
            }

            if (ModelState.IsValid)
            {
                // Store issue details in Note field, ServiceItemId intentionally left fixed (e.g., generic technic service)
                string combinedNote = $"{obj.Title}: {obj.Description}";

                Request newRequest = new Request
                {
                    RoomNumber = roomNumber,
                    ServiceItemId = 6,
                    Quantity = 1,
                    Note = combinedNote,
                    RequestDate = DateTime.Now,
                    Status = SD.StatusPending,
                    // ReportIssue is always a technic request
                    Type = SD.Type_Request_Technic
                };

                // Save photo if provided
                if (obj.Photo != null && obj.Photo.Length > 0)
                {
                    string wwwRootPath = _hostEnvironment.WebRootPath;
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(obj.Photo.FileName);
                    string photoPath = Path.Combine(wwwRootPath, @"images\requests");
                    if (!Directory.Exists(photoPath))
                    {
                        Directory.CreateDirectory(photoPath);
                    }
                    using (var fileStream = new FileStream(Path.Combine(photoPath, fileName), FileMode.Create))
                    {
                        obj.Photo.CopyTo(fileStream);
                    }
                    // URL path should always use forward slashes
                    newRequest.PhotoPath = "/images/requests/" + fileName;
                }

                _unitOfWork.Request.Add(newRequest);
                _unitOfWork.Save();
                await _hubContext.Clients.Group("StaffGroup").SendAsync("ReceiveMessage", $"New {newRequest.Type} request from Room {roomNumber}!");
                return Ok(new { success = true, message = "Issue reported successfully!" });
            }

            return BadRequest(ModelState);
        }

        [HttpGet]
        public IActionResult Index()
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                return Unauthorized(new { success = false, message = "User identity not found." });
            }

            string userId = claim.Value;
            IEnumerable<Request> requests;

            // 1. ADMIN / MANAGER / RECEPTION (See Everything)
            if (User.IsInRole(SD.Role_Admin) || User.IsInRole(SD.Role_Manager) || User.IsInRole(SD.Role_Reception))
            {
                requests = _unitOfWork.Request.GetAll(includeProperties: "ServiceItem,Room");
                return Ok(requests);
            }
            // 2. NEW: ROOM USER (See only THEIR own requests)
            else if (User.IsInRole(SD.Role_Room))
            {
                var roomUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
                if (roomUser == null) return BadRequest("User not found");

                // Extract Room Number from Username (e.g., "Room101" -> 101)
                // This assumes your username format is always "Room" + Number
                string roomNumString = roomUser.UserName.Replace("Room", "");

                if (int.TryParse(roomNumString, out int roomNumber))
                {
                    requests = _unitOfWork.Request.GetAll(
                       u => u.RoomNumber == roomNumber,
                       includeProperties: "ServiceItem,Room"
                   );
                    return Ok(requests);
                }
                return BadRequest("Invalid Room User Format");
            }
            // 3. STAFF (See requests for their Department)
            // REMOVED 'SD.Role_Room' from this list!
            else if (User.IsInRole(SD.Role_HouseKeeping) || User.IsInRole(SD.Role_Restaurant) || User.IsInRole(SD.Role_Kitchen) || User.IsInRole(SD.Role_Technic))
            {
                var staffUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);

                if (staffUser == null)
                {
                    return BadRequest("Staff user not found");
                }

                requests = _unitOfWork.Request.GetAll(
                    u => u.ServiceItem.DepartmentId == staffUser.DepartmentId,
                    includeProperties: "ServiceItem,Room"
                );
                return Ok(requests);
            }

            return BadRequest(new { success = false, message = "Unauthorized access." });
        }
        [HttpGet("GetDepartments")]
        public IActionResult GetDepartments()
        {
            // For normal room service requests we only want
            // HouseKeeping and Kitchen departments to appear.
            // Technic issues are handled via ReportIssue,
            // and Reception / Restaurant requests have their own flows.
            IEnumerable<Department> departments = _unitOfWork.Department.GetAll(
                u => u.DepartmentName == "HouseKeeping" || u.DepartmentName == "Kitchen"
            );
            return Ok(departments);
        }

        [HttpGet("GetServicesByDepartment/{departmentId}")]
        public IActionResult GetServicesByDepartment(int departmentId)
        {
            if (departmentId == 0)
            {
                return BadRequest("Invalid Department ID");
            }

            var serviceItems = _unitOfWork.ServiceItem.GetAll(u => u.DepartmentId == departmentId);

            if (serviceItems == null || !serviceItems.Any())
            {
                return NotFound(new { success = false, message = "No services found for this department." });
            }

            return Ok(serviceItems);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromForm] RequestCreateDTO obj)
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                return BadRequest(new { success = false, message = "User identity not found." });
            }

            string userId = claim.Value;
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Requested object is null" });
            }

            var roomUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
            if (roomUser == null)
            {
                return BadRequest(new { success = false, message = "User not found" });
            }

            string roomNumString = roomUser.UserName.Replace("Room", "");
            int.TryParse(roomNumString, out int roomNumber);

            //Adding logic that helps us if room is Available we cannot place any request.
            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == roomNumber);
            if (room == null)
            {
                return BadRequest(new { success = false, message = "Room not found" });
            }
            if (room.Status == SD.Status_Room_Available)
            {
                return BadRequest(new { success = false, message = "This room is currently empty.Request cannot be proceed." });
            }

            var serviceItem = _unitOfWork.ServiceItem.GetFirstOrDefault(u => u.Id == obj.ServiceItemId);
            if (serviceItem == null)
            {
                return BadRequest(new { success = false, message = "Service item is not available" });
            }

            if (ModelState.IsValid)
            {
                // Determine request type based on service item's department
                var department = _unitOfWork.Department.GetFirstOrDefault(u => u.Id == serviceItem.DepartmentId);
                if (department == null)
                {
                    return BadRequest(new { success = false, message = "Department not found for this service item" });
                }

                string requestType;
                var deptName = department.DepartmentName;

                if (deptName == "Technic")
                {
                    requestType = SD.Type_Request_Technic;
                }
                else if (deptName == "Reception")
                {
                    requestType = SD.Type_Request_Reception;
                }
                else if (deptName == "Housekeeping" || deptName == "Restaurant" || deptName == "Kitchen")
                {
                    requestType = SD.Type_Request_Room;
                }
                else
                {
                    // Default group as Room if not explicitly mapped
                    requestType = SD.Type_Request_Room;
                }

                Request newRequest = new Request
                {
                    RoomNumber = roomNumber,
                    ServiceItemId = obj.ServiceItemId,
                    Quantity = obj.Quantity,
                    Note = obj.Note,
                    RequestDate = DateTime.Now,
                    Status = SD.StatusPending,
                    Type = requestType

                };

                bool isTechnicService = deptName == "Technic";

                if (isTechnicService && obj.Photo != null && obj.Photo.Length > 0)
                {
                    string wwwRootPath = _hostEnvironment.WebRootPath;
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(obj.Photo.FileName);
                    string photoPath = Path.Combine(wwwRootPath, @"images\requests");
                    if (!Directory.Exists(photoPath))
                    {
                        Directory.CreateDirectory(photoPath);
                    }
                    using (var fileStream = new FileStream(Path.Combine(photoPath, fileName), FileMode.Create))
                    {
                        obj.Photo.CopyTo(fileStream);
                    }
                    newRequest.PhotoPath = @"\images\requests\" + fileName;
                }
                _unitOfWork.Request.Add(newRequest);
                _unitOfWork.Save();
                await _hubContext.Clients.Group("StaffGroup").SendAsync("ReceiveMessage", $"New {newRequest.Type} request from Room {roomNumber}!");
                return Ok(new { success = true, message = "Order placed successfully!" });
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception + "," +
                           SD.Role_HouseKeeping + "," + SD.Role_Restaurant + "," + SD.Role_Kitchen + "," + SD.Role_Technic)]
        public async Task<IActionResult> Update(int id, string newStatus, string? reason = null)
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid Request ID" });
            }
            if (string.IsNullOrEmpty(newStatus))
            {
                return BadRequest(new { success = false, message = "Status cannot be empty" });
            }
            var allowedStatus = new List<string>
            {
                SD.StatusPending,
                SD.StatusInProgress,
                SD.StatusCompleted,
                SD.StatusCancelled
            };
            if (!allowedStatus.Contains(newStatus))
            {
                return BadRequest(new { success = false, message = $"Invalid Status. Allowed values are: {string.Join(", ", allowedStatus)}" });
            }

            var order = _unitOfWork.Request.GetFirstOrDefault(u => u.Id == id, includeProperties: "ServiceItem");

            if (order == null)
            {
                return NotFound(new { success = false, message = "Order not found!" });
            }

            // Admin/Manager/Reception manage every request. Department staff may only
            // act on requests belonging to their own department.
            bool isManagerial = User.IsInRole(SD.Role_Admin) || User.IsInRole(SD.Role_Manager) || User.IsInRole(SD.Role_Reception);
            if (!isManagerial)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var staffUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
                if (staffUser == null || order.ServiceItem == null || order.ServiceItem.DepartmentId != staffUser.DepartmentId)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new
                    {
                        success = false,
                        message = "You can only update requests for your own department."
                    });
                }
            }

            if (order.Status == SD.StatusPending)
            {
                if (newStatus != SD.StatusInProgress && newStatus != SD.StatusCompleted && newStatus != SD.StatusCancelled)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Pending requests can only be moved to InProcess, Completed or Cancelled."
                    });
                }
            }
            else if (order.Status == SD.StatusInProgress)
            {
                if (newStatus != SD.StatusCompleted && newStatus != SD.StatusCancelled)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "InProcess requests can only be moved to Completed or Cancelled."
                    });
                }
            }
            else if (order.Status == SD.StatusCompleted || order.Status == SD.StatusCancelled)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Completed or Cancelled requests cannot be changed."
                });
            }

            //Prevent double points
            bool justCompleted = (newStatus == SD.StatusCompleted && order.Status != SD.StatusCompleted);
            bool justCancelled = (newStatus == SD.StatusCancelled && order.Status != SD.StatusCancelled);

            order.Status = newStatus;
            // Persist the staff-entered cancellation reason so the guest can see why.
            if (newStatus == SD.StatusCancelled)
            {
                order.CancellationReason = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim();
            }
            _unitOfWork.Request.Update(order);
            string responseMessage = "Order status updated successfully!";
            if (justCompleted)
            {
                var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == order.RoomNumber);

                // We already have order.ServiceItem because of the IncludeProperties at the top!
                if (room != null && order.ServiceItem != null)
                {
                    // 1. Get the quantity (default to 1 if your system allows 0 by mistake)
                    int qty = order.Quantity > 0 ? order.Quantity : 1;

                    // 2. Multiply base points by quantity
                    int basePoints = order.ServiceItem.PointsEarned * qty;
                    var today = DateTime.Now;

                    var activeBonus = _unitOfWork.BonusCampaign.GetFirstOrDefault(u =>
                        u.IsActive == true &&
                        u.StartDate <= today &&
                        u.EndDate >= today &&
                        (u.CampaignType == "AllItems" || u.ServiceItemId == order.ServiceItemId)
                    );

                    // 3. Multiply bonus points by quantity
                    int bonusPoints = 0;
                    if (activeBonus != null)
                    {
                        bonusPoints = activeBonus.ExtraPoints * qty;
                    }

                    int totalPoints = basePoints + bonusPoints;

                    // 4. Update the Room's Points
                    room.CurrentPoints += totalPoints;
                    room.PointsEarned += totalPoints;

                    // 5. Multiply the Price by quantity to get the total money spent
                    room.MoneySpent += (order.ServiceItem.Price * qty);

                    _unitOfWork.Room.Update(room);

                    if (bonusPoints > 0)
                    {
                        responseMessage = $"Order updated! Room {room.RoomNumber} earned {basePoints} base pts + {bonusPoints} BONUS pts! Total: {room.CurrentPoints}";
                    }
                    else
                    {
                        responseMessage = $"Order updated! Room {room.RoomNumber} earned {basePoints} points. Total: {room.CurrentPoints}";
                    }
                }
            }

            _unitOfWork.Save();

            if (justCompleted && order.ServiceItem != null)
            {
                await _hubContext.Clients.Group($"Room{order.RoomNumber}").SendAsync("OrderCompleted", new
                {
                    itemName = order.ServiceItem.Name,
                    quantity = order.Quantity,
                    roomNumber = order.RoomNumber
                });
            }

            // Notify the guest when their request is cancelled, with the reason.
            if (justCancelled)
            {
                await _hubContext.Clients.Group($"Room{order.RoomNumber}").SendAsync("OrderCancelled", new
                {
                    itemName = order.ServiceItem?.Name ?? "Your request",
                    quantity = order.Quantity,
                    roomNumber = order.RoomNumber,
                    reason = order.CancellationReason
                });
            }

            // Notify staff dashboards so live stat cards refresh in real time
            await _hubContext.Clients.Group("StaffGroup").SendAsync("RequestsUpdated");

            // Notify the guest's room so their request list updates live on ANY status change
            // (Pending -> InProcess -> Completed/Cancelled), not just on completion.
            await _hubContext.Clients.Group($"Room{order.RoomNumber}").SendAsync("RequestStatusChanged", new
            {
                requestId = order.Id,
                status = order.Status
            });

            return Ok(new
            {
                success = true,
                message = responseMessage
            });
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public IActionResult Delete(int id)
        {
            if (id == 0)
            {
                return BadRequest(new { success = false, message = "Invalid Request ID" });
            }

            var obj = _unitOfWork.Request.GetFirstOrDefault(u => u.Id == id);
            if (obj == null)
            {
                return NotFound(new { success = false, message = "Request not found" });
            }
            _unitOfWork.Request.Remove(obj);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Request deleted successfully!" });
        }

        [HttpDelete("DeleteBulkRequests")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public async Task<IActionResult> DeleteBulkRequests([FromBody] List<int> requestIds)
        {
            if (requestIds == null || !requestIds.Any())
            {
                return BadRequest(new { success = false, message = "No request IDs provided for deletion." });
            }
            var requestsToDelete = _unitOfWork.Request.GetAll(u => requestIds.Contains(u.Id)).ToList();
            if (!requestsToDelete.Any())
            {
                return NotFound(new { success = false, message = "No matching requests found for the provided IDs." });
            }
            
            _unitOfWork.Request.RemoveRange(requestsToDelete);
            _unitOfWork.Save();
            await _hubContext.Clients.Group("StaffGroup").SendAsync("RequestsUpdated");
            return Ok(new { success = true, message = $"{requestsToDelete.Count} requests deleted successfully!" });
        }

    }
}
