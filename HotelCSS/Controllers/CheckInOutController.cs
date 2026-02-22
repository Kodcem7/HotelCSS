using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CheckInOutController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public CheckInOutController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpPost("Check-In")]
        public IActionResult CheckIn([FromForm] CheckInRequestDTO request)
        {
            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == request.RoomNumber);
            if (room == null)
            {
                return BadRequest(new { success = false, message = "Room not found." });
            }
            if (room.Status == SD.Status_Room_Occupied)
            {
                return BadRequest(new { success = false, message = "Room is already occupied." });
            }

            room.Status = SD.Status_Room_Occupied;
            room.CurrentGuestMail = request.Email;
            room.CurrentCheckInDate = DateTime.Now;

            _unitOfWork.Room.Update(room);
            _unitOfWork.Save();
            return Ok(new { success = true, message = $"Check-in successful into Room {room.RoomNumber}" });
        }

        [HttpPost("Check-Out")]
        public IActionResult CheckOut(int roomNumber)
        {
            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == roomNumber);
            if (room == null || room.Status == SD.Status_Room_Available)
            {
                return BadRequest(new { success = false, message = "Room not found or already empty." });
            }

            HistoryLog history = new HistoryLog
            {
                RoomNumber = room.RoomNumber,
                GuestMail = room.CurrentGuestMail ?? "unknown",
                CheckInDate = room.CurrentCheckInDate ?? DateTime.Now,
                CheckOutDate = DateTime.Now
            };
            _unitOfWork.HistoryLog.Add(history);
            //Delete the requests after check-out
            var oldServiceRequests = _unitOfWork.Request.GetAll(u => u.RoomNumber == roomNumber);
            _unitOfWork.Request.RemoveRange(oldServiceRequests);
            //Delete ReceptionService Requests from it's table after c/o
            var oldReceptionRequests = _unitOfWork.ReceptionService.GetAll(u => u.RoomNumber == roomNumber);
            _unitOfWork.ReceptionService.RemoveRange(oldReceptionRequests);
            //Reset room to available
            room.Status = SD.Status_Room_Available;
            room.CurrentGuestMail = null;
            room.CurrentCheckInDate = null;
            _unitOfWork.Room.Update(room);
            _unitOfWork.Save();

            return Ok(new { success = true, message = $"Room {roomNumber} has been checked out and wiped clean." });
        }
    }
    public class CheckInRequestDTO
    {
        public int RoomNumber { get; set; }
        public string Email { get; set; }
    }
}
