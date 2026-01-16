using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequestController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public RequestController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IActionResult Index()
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);
            string userId = claim.Value;

            IEnumerable<Request> requests;

            if (User.IsInRole(SD.Role_Admin) || User.IsInRole(SD.Role_Manager) || User.IsInRole(SD.Role_Reception))
            {
                // Reception/Manager see ALL requests
                requests = _unitOfWork.Request.GetAll(includeProperties: "ServiceItem,RoomUser");
            }
            else if (User.IsInRole(SD.Role_Staff))
            {
                // Staff only see requests for their Department
                // First, get the current staff user to find their DepartmentId
                var staffUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);

                requests = _unitOfWork.Request.GetAll(
                    u => u.ServiceItem.DepartmentId == staffUser.DepartmentId,
                    includeProperties: "ServiceItem,RoomUser"
                );
            }
            else // It is a Room/Guest
            {
                // Rooms only see their own requests
                requests = _unitOfWork.Request.GetFirstOrDefault(u => u.RoomNumber == userId);
            }

            return Ok(requests);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Request obj)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Requested object is null" });
            }

            if (ModelState.IsValid)
            {
                obj.RequestDate = DateTime.Now;
                obj.Status = SD.StatusPending;

                _unitOfWork.Request.Add(obj);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Order placed successfully!" });
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}")]
        //we dont want Request obj from user because order is not changed by user
        public IActionResult Update(int id, string newStatus)
        {
            if (id == 0)
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
