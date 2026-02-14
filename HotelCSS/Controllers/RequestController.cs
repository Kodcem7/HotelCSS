using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.Security.Claims;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RequestController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostEnvironment;
        public RequestController(IUnitOfWork unitOfWork, IWebHostEnvironment hostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _hostEnvironment = hostEnvironment;
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
            IEnumerable<Department> departments = _unitOfWork.Department.GetAll(
                u => u.DepartmentName != "Admin" && u.DepartmentName != "Room"
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
        public IActionResult Create([FromForm] RequestCreateDTO obj)
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

            var serviceItem = _unitOfWork.ServiceItem.GetFirstOrDefault(u => u.Id == obj.ServiceItemId);
            if (serviceItem == null)
            {
                return BadRequest(new { success = false, message = "Service item is not available" });
            }

            if (ModelState.IsValid)
            {
                Request newRequest = new Request
                {   
                    RoomNumber = roomNumber,
                    ServiceItemId = obj.ServiceItemId,
                    Quantity = obj.Quantity,
                    Note = obj.Note,

                    
                    RequestDate = DateTime.Now,
                    Status = SD.StatusPending
                };
                bool isTechnicService = serviceItem.DepartmentId == _unitOfWork.Department.GetFirstOrDefault(u => u.DepartmentName == "Technic").Id;

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
                return Ok(new { success = true, message = "Order placed successfully!" });
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, string newStatus)
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
            var order = _unitOfWork.Request.GetFirstOrDefault(u => u.Id == id);

            if (order == null)
            {
                return NotFound(new { success = false, message = "ID cannot be empty" });
            }

            order.Status = newStatus;
            _unitOfWork.Request.Update(order);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Order status updated successfully!" });
        }

        [HttpDelete("{id}")]
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
    }
}
