using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RequestController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public RequestController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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

        [HttpPost]
        public IActionResult Create([FromBody] RequestCreateDTO obj)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Requested object is null" });
            }

            if (ModelState.IsValid)
            {
                Request newRequest = new Request
                {
                    RoomNumber = obj.RoomNumber,      
                    ServiceItemId = obj.ServiceItemId,
                    Quantity = obj.Quantity,
                    Note = obj.Note,

                    
                    RequestDate = DateTime.Now,
                    Status = SD.StatusPending
                };

                _unitOfWork.Request.Add(newRequest);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Order placed successfully!" });
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}")]
        //we dont want Request obj from user because order is not changed by user
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
