using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelCSS.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class HotelEventController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public HotelEventController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [AllowAnonymous]
        [HttpGet("GetActiveEvents")]
        public IActionResult GetActiveEvents()
        {
            var events = _unitOfWork.HotelEvent.GetAll(u => u.IsActive);

            return Ok(new { data = events });
        }

        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        [HttpGet]
        public IActionResult GetAll()
        {
            var events = _unitOfWork.HotelEvent.GetAll();
            return Ok(new { data = events });
        }

        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        [HttpPost]
        public IActionResult Create([FromBody] HotelEventDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var entity = new HotelEvent
            {
                Title = dto.Title,
                Description = dto.Description,
                EventType = dto.EventType,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                BonusPoints = dto.BonusPoints,
                MealInfo = dto.MealInfo,
                IsActive = dto.IsActive
            };

            _unitOfWork.HotelEvent.Add(entity);
            _unitOfWork.Save();

            return Ok(new { success = true, message = "Hotel event created successfully", data = entity });
        }

        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] HotelEventDTO dto)
        {
            var existing = _unitOfWork.HotelEvent.GetFirstOrDefault(u => u.Id == id);
            if (existing == null)
            {
                return NotFound(new { success = false, message = "Hotel event not found" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            existing.Title = dto.Title;
            existing.Description = dto.Description;
            existing.EventType = dto.EventType;
            existing.StartDate = dto.StartDate;
            existing.EndDate = dto.EndDate;
            existing.BonusPoints = dto.BonusPoints;
            existing.MealInfo = dto.MealInfo;
            existing.IsActive = dto.IsActive;

            _unitOfWork.HotelEvent.Update(existing);
            _unitOfWork.Save();

            return Ok(new { success = true, message = "Hotel event updated successfully", data = existing });
        }

        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var existing = _unitOfWork.HotelEvent.GetFirstOrDefault(e => e.Id == id);
            if (existing == null)
            {
                return NotFound(new { success = false, message = "Hotel event not found" });
            }

            _unitOfWork.HotelEvent.Remove(existing);
            _unitOfWork.Save();

            return Ok(new { success = true, message = "Hotel event deleted successfully" });
        }
    }
}

