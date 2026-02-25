using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using HotelCSS.Hubs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Net;
using System.Security.Claims;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReceptionServiceController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHubContext<NotificationHub> _hubContext;
        public ReceptionServiceController(IUnitOfWork unitOfWork, IHubContext<NotificationHub> hubContext)
        {
            _unitOfWork = unitOfWork;
            _hubContext = hubContext;
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
        public async Task<IActionResult> WakeUpServiceAsync([FromForm] ReceptionServiceDTO obj)
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

            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == roomNumber);
            if (room == null)
            {
                return BadRequest(new { success = false, message = "Room not found!" });
            }
            if (room.Status == SD.Status_Room_Available)
            {
                return BadRequest(new { success = false, message = "This room is currently empty.Request cannot be proceed." });
            }

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

                    Status = SD.Status_Reception_Pending,
                    CreatedAt = DateTime.Now
                };

                // Save the new request to the database
                _unitOfWork.ReceptionService.Add(newRequest);
                _unitOfWork.Save();
                await _hubContext.Clients.Group("StaffGroup").SendAsync("ReceiveMessage", $"New {newRequest.RequestType} request from Room {roomNumber}!");
                return Ok(new { success = true, message = $"Wake-up service added successfully. We will call your room at {"" + obj.ScheduledTime}" });

            }
            return BadRequest(ModelState);
        }

        [HttpPut("wakeup/{id}")]
        public IActionResult UpdateWakeUpService(int id, DateTime obj, string status)
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
                objFromDb.Status = status; 
                _unitOfWork.ReceptionService.Update(objFromDb);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Wake-up service time updated successfully" });
            }
            return BadRequest(ModelState);
        }
        [HttpDelete("Delete_WakeUp/{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public IActionResult DeleteWakeUpService(int id)
        {
            var objFromDb = _unitOfWork.ReceptionService.GetFirstOrDefault(u => u.Id == id);
            if (objFromDb == null)
            {
                return BadRequest(new { success = false, message = "Wake-up service request not found" });
            }
            _unitOfWork.ReceptionService.Remove(objFromDb);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Wake-up service request deleted successfully" });
        }

        [HttpPost("SetPickUpTime")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public async Task<IActionResult> SetPickUpTimeAsync(int roomNumber, [FromForm] ReceptionServiceDTO obj)
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
                    Status = SD.Status_Reception_Pending,
                    CreatedAt = DateTime.Now
                };

                _unitOfWork.ReceptionService.Add(newInfo);
                _unitOfWork.Save();
                await _hubContext.Clients.Group("StaffGroup").SendAsync("ReceiveMessage", $"New {newInfo.RequestType} request from Room {roomNumber}!");
                return Ok(new { success = true, message = "Pick-up time information added successfully" });

            }
            return BadRequest(new { success = false, message = "Failed to add pick-up time information" });
        }
        [HttpPut("pickup/{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public IActionResult UpdatePickUpTime(int id, DateTime obj,string status)
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
                objFromDb.Status = status;
                _unitOfWork.ReceptionService.Update(objFromDb);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Pick-up time updated successfully" });
            }
            return BadRequest(ModelState);
        }
        [HttpDelete("Delete_PickUp/{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public IActionResult DeletePickUpTime(int id)
        {
            var objFromDb = _unitOfWork.ReceptionService.GetFirstOrDefault(u => u.Id == id);
            if (objFromDb == null)
            {
                return BadRequest(new { success = false, message = "Pick-up information not found" });
            }
            _unitOfWork.ReceptionService.Remove(objFromDb);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Pick-up information deleted successfully" });
        }

    }
}
