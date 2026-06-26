using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Utility;
using GenerativeAI;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HistoryLogController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public HistoryLogController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("GetHistoryLogs")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult GetHistoryLogs()
        {
            var historyLogs = _unitOfWork.HistoryLog.GetAll();
            return Ok(historyLogs);
        }

        [HttpDelete("DeleteLogs")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult DeleteLogs(int id)
        {
            var logs = _unitOfWork.HistoryLog.GetFirstOrDefault(u => u.Id == id);
            if (logs == null)
            {
                return NotFound();
            }

            _unitOfWork.HistoryLog.Remove(logs);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "History log deleted successfully!" });
        }

        [HttpDelete("DeleteLast6Months")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult DeleteLast6Months()
        {
            var logsToDelete = _unitOfWork.HistoryLog.GetAll().Where(u => u.Timestamp < DateTime.UtcNow.AddMonths(-6)).ToList();
            if (logsToDelete.Count == 0)
            {
                return Ok(new { success = true, message = "No logs older than 6 months to delete." });
            }
            foreach (var log in logsToDelete)
            {
                _unitOfWork.HistoryLog.Remove(log);
            }
            _unitOfWork.Save();
            return Ok(new { success = true, message = $"{logsToDelete.Count} logs older than 6 months have been deleted." });
        }
        [HttpDelete("LogsBulkDelete")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public async Task<IActionResult> LogsBulkDelete([FromBody] List<int> logdIds)
        {
            if (logdIds == null || !logdIds.Any())
            {
                return BadRequest(new { success = false, message = "No log IDs provided for deletion." });
            }
            var logsToDelete = _unitOfWork.HistoryLog.GetAll().Where(u => logdIds.Contains(u.Id)).ToList();
            if (!logsToDelete.Any())
            {
                return NotFound(new { success = false, message = "No matching logs found for the provided IDs." });
            }

            _unitOfWork.HistoryLog.RemoveRange(logsToDelete);
            _unitOfWork.Save();
            return Ok(new { success = true, message = $"{logsToDelete.Count} logs have been deleted successfully." });
        }
    }
}
