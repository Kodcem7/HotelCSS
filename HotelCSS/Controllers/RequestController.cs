using CSSHotel.Models;
using CSSHotel.DataAccess.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CSSHotel.Utility;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RequestController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public RequestController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var requests = _unitOfWork.Request.GetAll(includeProperties: "ServiceItem");
            return Ok(new { data = requests });
        }

        [HttpPost]
        public IActionResult Create([FromBody] Request obj)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Requested object is null" });
            }

            if (ModelState.IsValid)
            {
                obj.RequestDate = DateTime.Now;
                obj.Status = SD.StatusPending;

                _unitOfWork.Request.Add(obj);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Order placed successfully!" });
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}")]
        //we dont want Request obj from user because order is not changed by user
        public IActionResult Update(int id, string newStatus)
        {
            if (id == 0)
            {
                return BadRequest(new { success = false, message = "Invalid Request ID" });
            }
            if (string.IsNullOrEmpty(newStatus))
            {
                return BadRequest(new { success = false, message = "Status cannot be empty" });
            }
            var order = _unitOfWork.Request.GetFirstOrDefault(u => u.Id == id);

            if (order == null)
            {
                return NotFound(new { success = false, message = "ID cannot be empty" });
            }

            order.Status = newStatus;
            _unitOfWork.Request.Update(order);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Order status updated successfully!" });
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (id == 0)
            {
                return BadRequest(new { success = false, message = "Invalid Request ID" });
            }

            var obj = _unitOfWork.Request.GetFirstOrDefault(u => u.Id == id);
            if (obj == null)
            {
                return NotFound(new { success = false, message = "Request not found" });
            }
            _unitOfWork.Request.Remove(obj);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Request deleted successfully!" });
        }
    }
}
