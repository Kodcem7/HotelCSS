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
    [Area("Admin")]
    public class RoomController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public RoomController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public IActionResult GetAll()
        {
            var rooms = _unitOfWork.Room.GetAll();
            return Ok(new { data = rooms });
        }
        [HttpGet("{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception + "," + SD.Role_Room)]
        public IActionResult GetRoom(int id)
        {
            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == id);
            if (room == null) return NotFound(new { success = false, message = "Room not found" });
            return Ok(new { success = true, data = room });
        }
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        [HttpPost("CreateRoom")]
        public IActionResult Create([FromBody] CreateRoomDTO obj)
        {
            if (obj == null)
            {
                return BadRequest();
            }
            var existingRoom = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == obj.RoomNumber);
            if (existingRoom != null)
            {
                return BadRequest(new { success = false, message = "Same room number already exists" });
            }

            if (ModelState.IsValid)
            {
                Room room = new Room
                {
                    RoomNumber = obj.RoomNumber,
                    Status = "Available",
                    isSkipped = true,
                };
                _unitOfWork.Room.Add(room);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Room created successfully" });
            }
            return BadRequest(ModelState);
        }

        [HttpPost("CreateAllRooms")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult CreateRooms([FromBody] RoomConfigVM config)
        {
            if (config.TotalFloors > 20 || config.RoomsPerFloor > 50)
            {
                return BadRequest(new { success = false, message = "Floors cannot be higher than 20 or rooms per floor cannot be more than 50." });
            }

            List<Room> roomsToAdd = new List<Room>();
            List<string> skippedRooms = new List<string>();

            for (int floor = 1; floor <= config.TotalFloors; floor++)
            {
                for (int room = 1; room <= config.RoomsPerFloor; room++)
                {
                    var currentRoomNum = floor * config.StartingRoomNumber + room;

                    //Duplicate check
                    var existingRoom = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == currentRoomNum);

                    if (existingRoom == null)
                    {
                        roomsToAdd.Add(new Room
                        {
                            RoomNumber = currentRoomNum,
                            Status = "Available",
                            isSkipped = true,
                            //QrCodeString is already generated otomatically.
                        });
                    }
                    else
                    {
                        skippedRooms.Add(currentRoomNum.ToString());
                    }
                }
            }
            if (roomsToAdd.Count > 0)
            {
                _unitOfWork.Room.AddRange(roomsToAdd);
                _unitOfWork.Save();
                return Ok(new
                {
                    success = true,
                    message = $"Rooms created successfully!",
                    skipped = skippedRooms
                });
            }
            return BadRequest(new { success = false, message = "No new rooms were created (all already existed)." });


        }
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] RoomUpdateDTO obj)
        {
            var roomFromDb = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == id);
            if (roomFromDb == null)
            {
                return BadRequest(new { success = false, message = "That room does not exists!" });
            }

            if (obj == null || string.IsNullOrEmpty(obj.Status))
            {
                return BadRequest(new { success = false, message = "Room status is required." });
            }

            var newStatus = obj.Status;
            var allowedStatus = new List<string>
            {
                SD.Status_Room_Available,
                SD.Status_Room_Occupied,
            };
            if (!allowedStatus.Contains(newStatus))
            {
                return BadRequest(new { success = false, message = "Invalid room status. Allowed values are 'Available' or 'Occupied'." });
            }

            int currentPoints = roomFromDb.CurrentPoints + obj.PointsAdded;
            roomFromDb.Status = newStatus;
            roomFromDb.CurrentPoints = currentPoints;
            _unitOfWork.Room.Update(roomFromDb);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Room updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult Delete(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid Department ID" });
            }

            var objFromDb = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == id);
            if (objFromDb == null)
            {
                return NotFound(new { success = false, message = "Object not found" });
            }
            _unitOfWork.Room.Remove(objFromDb);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Room deleted successfully!" });
        }

        [HttpDelete("DeleteAll")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult DeleteAllRooms()
        {

            var allRooms = _unitOfWork.Room.GetAll();

            if (allRooms == null || !allRooms.Any())
            {
                return BadRequest(new { success = false, message = "There are noo rooms to delete! " });
            }

            _unitOfWork.Room.RemoveRange(allRooms);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "All rooms deleted successfully!" });
        }
        [HttpGet("GetMyPoints")]
        [Authorize(Roles = SD.Role_Room)]
        public IActionResult GetMyPoints()
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
                return BadRequest(new { success = false, message = "User not found" });
            }

            string roomNumString = roomUser.UserName.Replace("Room", "");
            if (!int.TryParse(roomNumString, out int roomNumber))
            {
                return BadRequest(new { success = false, message = "Invalid Room User Format" });
            }

            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == roomNumber);
            if (room == null)
            {
                return BadRequest(new { success = false, message = "Room not found!" });
            }

            var points = room.CurrentPoints;
            return Ok(new { success = true, data = points });

        }

        [HttpPost("AddPoints/{roomNumber}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult AddPoints(int roomNumber, [FromBody] AddPointsDTO data)
        {
            if (data == null || data.PointsToAdd <= 0)
            {
                return BadRequest(new { success = false, message = $"Failed! C# received: {(data == null ? "null" : data.PointsToAdd.ToString())} points." });
            }

            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == roomNumber);
            if (room == null)
            {
                return NotFound(new { success = false, message = "Room not found!" });
            }

            room.CurrentPoints += data.PointsToAdd;
            _unitOfWork.Room.Update(room);
            _unitOfWork.Save();

            return Ok(new { success = true, message = "Points added successfully!" });
        }

        [HttpPost("SubtractPoints/{roomNumber}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult SubtractPoints(int roomNumber, [FromBody] SubtractPointDTO data)
        {
            if (data == null || data.pointsToSubtract <= 0)
            {
                return BadRequest(new { success = false, message = $"Invalid amount: {(data == null ? "null" : data.pointsToSubtract.ToString())}" });
            }

            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == roomNumber);
            if (room == null)
            {
                return NotFound(new { success = false, message = "Room not found!" });
            }

            if (room.CurrentPoints < data.pointsToSubtract)
            {
                return BadRequest(new { success = false, message = $"Cannot subtract {data.pointsToSubtract}. The room only has {room.CurrentPoints} points!" });
            }

            room.CurrentPoints -= data.pointsToSubtract;

            _unitOfWork.Room.Update(room);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Points subtracted successfully!" });
        }
    }
}
