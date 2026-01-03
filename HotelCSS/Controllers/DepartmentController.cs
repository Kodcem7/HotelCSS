using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public DepartmentController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("GetDepartments")]
        public IActionResult Index()
        {
            var departments = _unitOfWork.Department.GetAll().ToList();
            return Ok(departments);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Department obj)
        {
            if (obj == null)
            {
                return BadRequest("Departments data is null.");
            }
            if (ModelState.IsValid)
            {
                _unitOfWork.Department.Add(obj);
                _unitOfWork.Save();

                return CreatedAtAction(nameof(Index), new { id = obj.Id }, obj);
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Department obj)
        {
            if (obj == null || id != obj.Id)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                _unitOfWork.Department.Update(obj);
                _unitOfWork.Save();
                return Ok(obj);
            }
            return BadRequest(ModelState);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid department ID.");
            }

            var obj = _unitOfWork.Department.GetFirstOrDefault(d => d.Id == id);
            if (obj == null)
            {
                return NotFound("Department not found.");
            }
            _unitOfWork.Department.Remove(obj);
            _unitOfWork.Save();

            return Ok("Department deleted successfully!");

        }
    }
}
