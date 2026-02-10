using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Area("Admin")]
    [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
    public class RoomController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public RoomController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        [HttpGet]
        public IActionResult GetAll()
        {
            var rooms = _unitOfWork.Room.GetAll();
            return Ok(new { data = rooms });
        }
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        [HttpPost("CreateRoom")]
        public IActionResult Create([FromBody] Room obj)
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
                _unitOfWork.Room.Add(obj);
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
        public IActionResult Update(int id, string newStatus)
        {
            var roomFromDb = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == id);
            if (roomFromDb == null)
            {
                return BadRequest(new { success = false, message = "That room does not exists!" });
            }
            var allowedStatus = new List<string>
            {
                SD.Status_Room_Available,
                SD.Status_Room_Occupied
            };
            if (!allowedStatus.Contains(newStatus))
            {
                return BadRequest(new { success = false, message = "Invalid room status. Allowed values are 'Available' or 'Occupied'." });
            }
            
            roomFromDb.Status = newStatus;
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

    }


}
