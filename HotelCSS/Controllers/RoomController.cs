using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
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

        [HttpPost]
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

        [HttpDelete("{id}")]
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
    }
}
