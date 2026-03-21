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
        [HttpGet("GetActiveBonusEventsForDashboard")]
        public IActionResult GetBonusEvents()
        {
            var activeCampaigns = _unitOfWork.BonusCampaign
        .GetAll(b => b.IsActive)
        .Select(b => new
        {
            Id = b.Id,
            Title = b.CampaignType == "AllItems" ? "Store-Wide Bonus Points!" : "Special Item Bonus Points!",
            BonusPoints = b.ExtraPoints,
            StartDate = b.StartDate, // Let's pass the start date to React just in case!
            EndDate = b.EndDate
        });
            return Ok(new { data = activeCampaigns });
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
            var events = _unitOfWork.HotelEvent.GetAll(u => u.IsActive);
            return Ok(new { data = events });
        }

        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        [HttpPost]
        public IActionResult Create([FromForm] HotelEventDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (dto.EventType == "BonusPoint")
            {
                var bonusDTO = new BonusCampaignDTO
                {
                    ServiceItemId = dto.CampaignType == "AllItems" ? null : dto.ServiceItemId,
                    ExtraPoints = dto.BonusPoints.Value,
                    CampaignType = dto.CampaignType,
                    StartDate = dto.StartDate.Value,
                    EndDate = dto.EndDate.Value,
                    IsActive = dto.IsActive
                };

                var newEvent = new HotelEvent
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    EventType = dto.EventType,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    IsActive = dto.IsActive
                };

                _unitOfWork.HotelEvent.Add(newEvent);
                _unitOfWork.Save();
                var bonusController = new BonusCampaignController(_unitOfWork);
                return bonusController.CreateBonusCampaign(bonusDTO);
            }
            else if (dto.EventType == "General")
            {
                var newEvent = new HotelEvent
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    EventType = dto.EventType,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    IsActive = dto.IsActive
                };
                _unitOfWork.HotelEvent.Add(newEvent);
                _unitOfWork.Save();
                return Ok(new { success = true, message = $"{newEvent.Title} event has created successfully", data = newEvent });
            }
            else if (dto.EventType == "Meal")
            {
                var newEvent = new HotelEvent
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    EventType = dto.EventType,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    IsActive = dto.IsActive,
                    MealInfo = dto.MealInfo
                };
                _unitOfWork.HotelEvent.Add(newEvent);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "New Meal info has created successfully", data = newEvent });
            }

            return BadRequest(new { success = false, message = "Invalid event type. Allowed values are 'BonusPoint' or 'RegularEvent'." });
        }

        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromForm] HotelEventDTO dto)
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

