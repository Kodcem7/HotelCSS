using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RewardController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public RewardController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("GetRewardsCatalog")]
        public IActionResult GetRewardsCatalog()
        {
            var rewards = _unitOfWork.ServiceItem.GetAll(u => u.PointsCost != null).ToList();
            return Ok(rewards);
        }
        [HttpGet("GetVouchersForReception")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager + "," + SD.Role_Reception)]
        public IActionResult GetVouchersForReception()
        {
            var vouchers = _unitOfWork.RewardVoucher.GetAll().ToList();
            return Ok(vouchers);
        }
        [HttpGet("GetVouchersForRoom")]
        [Authorize(Roles = SD.Role_Room)]
        public IActionResult GetVouchersForRoom()
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
            int.TryParse(roomNumString, out int roomNumber);
            var vouchers = _unitOfWork.RewardVoucher.GetAll(u => u.RoomNumber == roomNumber).ToList();
            return Ok(vouchers);
        }


        [HttpPost("ClaimReward")]
        [Authorize]
        public IActionResult ClaimReward(int serviceItemId)
        {
            //Fetch user identity from claims and room number
            var claimsIdentity = (ClaimsIdentity)User.Identity;
            var claim = claimsIdentity.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                return BadRequest(new { success = false, message = "User identity not found." });
            }

            string userId = claim.Value;
            if (serviceItemId <= 0)
            {
                return BadRequest(new { success = false, message = "Requested object is null" });
            }

            var roomUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
            if (roomUser == null)
            {
                return BadRequest(new { success = false, message = "User not found" });
            }

            string roomNumString = roomUser.UserName.Replace("Room", "");
            int.TryParse(roomNumString, out int roomNumber);

            //Fetch room and reward item, 
            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == roomNumber);
            var rewardItem = _unitOfWork.ServiceItem.GetFirstOrDefault(u => u.Id == serviceItemId);

            if (rewardItem == null)
            {
                return NotFound(new { success = false, message = "Room or Item not found." });
            }
            if (rewardItem.PointsCost == null || rewardItem.PointsCost <= 0)
            {
                return BadRequest(new { success = false, message = "This item cannot be purchased with points." });
            }
            if (room.CurrentPoints < rewardItem.PointsCost)
            {
                return BadRequest(new { success = false, message = $"Not enough points to claim this reward.You need {rewardItem.PointsCost} points" });
            }

            //The transaction
            room.CurrentPoints -= rewardItem.PointsCost.Value;
            _unitOfWork.Room.Update(room);
            string generatedCode = Guid.NewGuid().ToString().Substring(0, 6).ToUpper();

            var newVoucher = new RewardVoucher
            {
                RoomNumber = room.RoomNumber,
                ItemName = rewardItem.Name,
                CreatedAt = DateTime.Now,
                PointsPaid = rewardItem.PointsCost.Value,
                Status = SD.StatusPending,
                VoucherCode = generatedCode
            };

            _unitOfWork.RewardVoucher.Add(newVoucher);
            _unitOfWork.Save();
            return Ok(new
            {
                success = true,
                voucherCode = generatedCode,
                message = $"Success! Your voucher code is {generatedCode}. Show this at the reception."
            });
        }
        [HttpPut("{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult UpdateRewardVoucherStatus(int id, [FromBody] string newStatus)
        {
            var voucher = _unitOfWork.RewardVoucher.GetFirstOrDefault(u => u.Id == id);
            if (voucher == null)
            {
                return NotFound(new { success = false, message = "Reward voucher not found." });
            }
            if (newStatus != SD.StatusInProgress && newStatus != SD.StatusCancelled && newStatus != SD.StatusCompleted && newStatus != SD.StatusPending)
            {
                return BadRequest(new { success = false, message = "Invalid status value." });
            }
            voucher.Status = newStatus;
            _unitOfWork.RewardVoucher.Update(voucher);
            _unitOfWork.Save();
            return Ok(new { success = true, message = $"Voucher status updated to {newStatus}." });
        }
    }
}
