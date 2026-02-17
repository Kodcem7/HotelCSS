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
    public class ReceptionServiceController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostEnvironment;
        public ReceptionServiceController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [AllowAnonymous]
        [HttpGet("GetReceptionServices")]
        public IActionResult GetReceptionServices()
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                return Unauthorized(new { success = false, message = "User identity not found." });
            }

            string userId = claim.Value;
            IEnumerable<ReceptionService> receptionServices;

            if (User.IsInRole(SD.Role_Admin) || User.IsInRole(SD.Role_Manager) || User.IsInRole(SD.Role_Reception))
            {
                receptionServices = _unitOfWork.ReceptionService.GetAll(includeProperties: "Room");
                return Ok(receptionServices);
            }
            else if (User.IsInRole(SD.Role_Room))
            {
                var roomUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
                if (roomUser == null) return BadRequest(new { success = false, message = "User not found" });
                string roomNumString = roomUser.UserName.Replace("Room", "");
                if (int.TryParse(roomNumString, out int roomNumber))
                {
                    receptionServices = _unitOfWork.ReceptionService.GetAll(u => u.RoomNumber == roomNumber && u.RequestType == "Wake-Up Service", includeProperties: "Room");
                    return Ok(receptionServices);
                }
                return BadRequest(new { success = false, message = "Invalid Room User Format" });
            }
            return BadRequest(new { success = false, message = "Unauthorized access." });
        }

        [HttpGet("Learn Pick-Up Time")]
        public IActionResult GetPickUpTime()
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);
            string userId = claim.Value;
            IEnumerable<ReceptionService> pickUpTime;
            if (claim == null)
            {
                return Unauthorized(new { success = false, message = "User identity not found." });
            }

            if (User.IsInRole(SD.Role_Room))
            {
                var roomUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
                if (roomUser == null) return BadRequest(new { success = false, message = "User not found" });
                string roomNumString = roomUser.UserName.Replace("Room", "");
                if (int.TryParse(roomNumString, out int roomNumber))
                {
                    pickUpTime = _unitOfWork.ReceptionService.GetAll(u => u.RoomNumber == roomNumber && u.RequestType == "Pick-Up", includeProperties: "Room");
                    return Ok(pickUpTime);
                }
                return BadRequest(new { success = false, message = "Invalid Room User Format" });
            }
            return BadRequest(new { success = false, message = "Unauthorized access." });
        }

        [HttpPost("Wake-Up Service")]
        public IActionResult WakeUpService([FromForm] ReceptionServiceDTO obj)
        {
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                return BadRequest(new { success = false, message = "User identity not found." });
            }

            string userId = claim.Value;
            var roomUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);

            if (roomUser == null)
            {
                return BadRequest(new { success = false, message = "Room user is not available" });
            }

            string roomNumString = roomUser.UserName.Replace("Room", "");
            int.TryParse(roomNumString, out int roomNumber);

            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Requested object is null" });
            }

            if (ModelState.IsValid)
            {
                ReceptionService newRequest = new ReceptionService
                {
                    RoomNumber = roomNumber,
                    RequestType = "Wake-Up Service",
                    ScheduledTime = obj.ScheduledTime,
                    Notes = obj.Notes,

                    Status = "Pending",
                    CreatedAt = DateTime.Now
                };

                //Adding TR timezone conversion to display the scheduled time in Turkey local time in the response message
                string timeZoneId = "Turkey Standard Time";
                TimeZoneInfo trTimeZone;
                try
                {
                    trTimeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                }
                catch (TimeZoneNotFoundException)
                {
                    // Fallback for Linux servers
                    trTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul");
                }
                DateTime turkeyTime = TimeZoneInfo.ConvertTime(obj.ScheduledTime, trTimeZone);
                string timeString = turkeyTime.ToString("HH:mm");

                // Save the new request to the database
                _unitOfWork.ReceptionService.Add(newRequest);
                _unitOfWork.Save();
                return Ok(new { success = true, message = $"Wake-up service added successfully. We will call your room at {"" + timeString}" });

            }
            return BadRequest(ModelState);
        }

        [HttpPut("wakeup/{id}")]
        public IActionResult UpdateWakeUpService(int id, DateTime obj)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Please enter a time" });
            }
            if (ModelState.IsValid)
            {
                var objFromDb = _unitOfWork.ReceptionService.GetFirstOrDefault(u => u.Id == id);
                if (objFromDb == null)
                {
                    return BadRequest(new { success = false, message = "Wake-up service request not found" });
                }
                objFromDb.ScheduledTime = obj;
                _unitOfWork.ReceptionService.Update(objFromDb);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Wake-up service time updated successfully" });
            }
            return BadRequest(ModelState);
        }

        [HttpPost("SetPickUpTime")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public IActionResult SetPickUpTime(int roomNumber, [FromForm] ReceptionServiceDTO obj)
        {
            if (roomNumber == null)
            {
                return BadRequest(new { success = false, message = "Please pick a room!" });
            }
            var existingInfo = _unitOfWork.ReceptionService.GetFirstOrDefault(u => u.RoomNumber == roomNumber && u.RequestType == "Pick-Up");
            if (existingInfo != null)
            {
                existingInfo.PickUpTime = obj.ScheduledTime;
                existingInfo.Notes = obj.Notes;
                _unitOfWork.ReceptionService.Update(existingInfo);
            }
            else
            {
                ReceptionService newInfo = new ReceptionService
                {
                    RoomNumber = roomNumber,
                    RequestType = "Pick-Up",
                    PickUpTime = obj.ScheduledTime,
                    Notes = obj.Notes,
                    Status = "Pending",
                    CreatedAt = DateTime.Now
                };

                _unitOfWork.ReceptionService.Add(newInfo);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Pick-up time information added successfully" });

            }
            return BadRequest(new { success = false, message = "Failed to add pick-up time information" });
        }
        [HttpPut("pickup/{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public IActionResult UpdatePickUpTime(int id, DateTime obj)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Please enter a time" });
            }
            if (ModelState.IsValid)
            {
                var objFromDb = _unitOfWork.ReceptionService.GetFirstOrDefault(u => u.Id == id);
                if (objFromDb == null)
                {
                    return BadRequest(new { success = false, message = "Pick-up information not found" });
                }
                objFromDb.PickUpTime = obj;
                _unitOfWork.ReceptionService.Update(objFromDb);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Pick-up time updated successfully" });
            }
            return BadRequest(ModelState);
        }

    }
}
