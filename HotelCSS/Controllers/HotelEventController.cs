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
                    Title = b.Title,
                    Description = b.Description,
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
            var events = _unitOfWork.HotelEvent.GetAll(u => u.IsActive && u.EventType == "General");
            return Ok(new { data = events });
        }

        [AllowAnonymous]
        [HttpGet("GetMealList")]
        public IActionResult GetMealList()
        {
            var meals = _unitOfWork.HotelEvent.GetAll(u => u.IsActive && u.EventType == "Meal");
            return Ok(new { data = meals });
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
        public IActionResult Create([FromForm] HotelEventDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (dto.EventType == "BonusPoint")
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

                var bonusDTO = new BonusCampaignDTO
                {
                    Title = dto.Title,
                    // The dashboard reads bonus offers from BonusCampaign, not HotelEvent,
                    // so the description must be copied here or it never reaches the guest.
                    Description = dto.Description,
                    ServiceItemId = dto.CampaignType == "AllItems" ? null : dto.ServiceItemId,
                    ExtraPoints = dto.BonusPoints.Value,
                    CampaignType = dto.CampaignType,
                    StartDate = dto.StartDate.Value,
                    EndDate = dto.EndDate.Value,
                    IsActive = dto.IsActive,
                    HotelEventId = newEvent.Id
                };

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

            // Guests see bonus offers via the linked BonusCampaign, not the HotelEvent,
            // so an edit must be mirrored onto the campaign or it won't reach them.
            // (IsActive is intentionally left to the separate toggle-status flow.)
            if (existing.EventType == "BonusPoint")
            {
                var campaign = _unitOfWork.BonusCampaign.GetFirstOrDefault(c => c.HotelEventId == id);
                if (campaign != null)
                {
                    campaign.Title = dto.Title;
                    campaign.Description = dto.Description;
                    if (dto.StartDate.HasValue) campaign.StartDate = dto.StartDate.Value;
                    if (dto.EndDate.HasValue) campaign.EndDate = dto.EndDate.Value;
                    if (dto.BonusPoints.HasValue) campaign.ExtraPoints = dto.BonusPoints.Value;
                    if (!string.IsNullOrEmpty(dto.CampaignType))
                    {
                        campaign.CampaignType = dto.CampaignType;
                        campaign.ServiceItemId = dto.CampaignType == "AllItems" ? null : dto.ServiceItemId;
                    }
                    _unitOfWork.BonusCampaign.Update(campaign);
                }
            }

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

            if (existing.EventType == "BonusPoint")
            {
                var bonusCampaign = _unitOfWork.BonusCampaign.GetFirstOrDefault(u => u.HotelEventId == id);
                if (bonusCampaign != null)
                {
                    _unitOfWork.BonusCampaign.Remove(bonusCampaign);
                }
            }

            _unitOfWork.HotelEvent.Remove(existing);
            _unitOfWork.Save();

            return Ok(new { success = true, message = "Hotel event deleted successfully" });
        }
    }
}

