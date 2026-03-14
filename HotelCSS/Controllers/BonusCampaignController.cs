using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BonusCampaignController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public BonusCampaignController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("GetCurrentCampaigns")]
        public IActionResult GetBonusCampaigns()
        {
            var serviceItems = _unitOfWork.BonusCampaign.GetAll(includeProperties: "ServiceItem");
            return Ok(serviceItems);
        }

        [HttpGet("GetServiceItems")]
        public IActionResult GetServiceItems()
        {
            var bonusCampaigns = _unitOfWork.ServiceItem.GetAll();
            return Ok(bonusCampaigns);
        }

        [HttpPost]
        public IActionResult CreateBonusCampaign([FromForm] BonusCampaignDTO obj)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Invalid data!" });
            }

            if (obj.StartDate > obj.EndDate)
            {
                return BadRequest(new { success = false, message = "Start date must be before End date." });
            }
            var serviceItem = _unitOfWork.ServiceItem.GetFirstOrDefault(u => u.Id == obj.ServiceItemId);
            if (serviceItem == null)
            {
                return NotFound(new { success = false, message = "Service item not found." });
            }
            var newCampaign = new BonusCampaign
            {
                ServiceItemId = obj.ServiceItemId,
                ExtraPoints = obj.ExtraPoints,
                StartDate = obj.StartDate,
                EndDate = obj.EndDate,
                IsActive = true
            };
            _unitOfWork.BonusCampaign.Add(newCampaign);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Bonus campaign has created successfully!" });
        }

        [HttpPost("toggle-status/{id}")]
        public IActionResult ToggleStatus(int id)
        {
            var campaign = _unitOfWork.BonusCampaign.GetFirstOrDefault(u => u.Id == id);
            if (campaign == null)
            {
                return NotFound(new { success = false, message = "Bonus campaign not found." });
            }
            campaign.IsActive = !campaign.IsActive;
            _unitOfWork.BonusCampaign.Update(campaign);
            _unitOfWork.Save();
            return Ok(new { success = true, message = $"Bonus campaign has been {(campaign.IsActive ? "activated" : "deactivated")} successfully!" });
        }

    }
}
