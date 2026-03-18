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

            var newCampaign = new BonusCampaign
            {
                CampaignType = obj.CampaignType,
                ServiceItemId = obj.CampaignType == "AllItems" ? null : obj.ServiceItemId,
                ExtraPoints = obj.ExtraPoints,
                StartDate = obj.StartDate,
                EndDate = obj.EndDate,
                IsActive = obj.IsActive ?? false
            };

            if (obj.CampaignType == "SpecificItem")
            {
                var itemExists = _unitOfWork.ServiceItem.GetFirstOrDefault(u => u.Id == obj.ServiceItemId);
                if (itemExists == null)
                {
                    return NotFound(new { success = false, message = "Item not found!" });
                }
                newCampaign.ServiceItemId = obj.ServiceItemId;
            }
            else if (obj.CampaignType == "AllItems")
            {
                newCampaign.ServiceItemId = null; // Applies to all items
            }
            else
            {
                return BadRequest(new { success = false, message = "Invalid campaign type. Allowed values are 'SpecificItem' or 'AllItems'." });
            }

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

        [HttpDelete("{id}")]
        public IActionResult DeleteCampaign(int id)
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "Id can't be lower than 0" });
            }

            if (ModelState.IsValid)
            {
                var campaign = _unitOfWork.BonusCampaign.GetFirstOrDefault(u => u.Id == id);
                if (campaign == null)
                {
                    return NotFound(new { success = false, message = "Bonus campaign not found." });
                }
                _unitOfWork.BonusCampaign.Remove(campaign);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Bonus campaign has been deleted successfully!" });
            }
            return BadRequest(new { success = false, message = "Invalid data!" });
        }

    }
}
