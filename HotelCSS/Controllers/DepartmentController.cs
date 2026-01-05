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
        private readonly IWebHostEnvironment _hostEnvironment;
        public DepartmentController(IUnitOfWork unitOfWork , IWebHostEnvironment hostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _hostEnvironment = hostEnvironment;
        }

        [HttpGet("GetDepartments")]
        public IActionResult Index()
        {
            var departments = _unitOfWork.Department.GetAll().ToList();
            return Ok(departments);
        }

        [HttpPost]
        public IActionResult Create([FromForm] Department obj, IFormFile? file)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Department cannot be null" });
            }

            if (ModelState.IsValid)
            {
                string wwwRootPath = _hostEnvironment.WebRootPath;
                if (file != null)
                {
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string productPath = Path.Combine(wwwRootPath, @"images\departments");

                    if (!Directory.Exists(productPath))
                    {
                        Directory.CreateDirectory(productPath);
                    }

                    using (var fileStream = new FileStream(Path.Combine(productPath,fileName),FileMode.Create))
                    {
                        file.CopyTo(fileStream);
                    }

                    obj.ImageUrl = @"\images\departments\" + fileName;
                }
                _unitOfWork.Department.Add(obj);
                _unitOfWork.Save();

                return CreatedAtAction(nameof(Index), new { id = obj.Id }, obj);
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromForm] Department obj, IFormFile? file)
        {
            if (obj == null || id != obj.Id)
            {
                return BadRequest(new { success = false, message = "Object is not available." });
            }

            if (ModelState.IsValid)
            {
                var objFromDb = _unitOfWork.Department.GetFirstOrDefault(u => u.Id == id);

                if (objFromDb == null)
                {
                    return NotFound(new { success = false, message = "Object is null" });
                }
                string wwwRootPath = _hostEnvironment.WebRootPath;
                if (file != null)
                {
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string productPath = Path.Combine(wwwRootPath, @"images\departments");

                    if (!string.IsNullOrEmpty(objFromDb.ImageUrl))
                    {
                        var oldImagePath = Path.Combine(wwwRootPath, objFromDb.ImageUrl.TrimStart('\\'));
                        if (System.IO.File.Exists(oldImagePath))
                        {
                            System.IO.File.Delete(oldImagePath);
                        }
                    }
                    using (var fileStream = new FileStream(Path.Combine(productPath, fileName), FileMode.Create))
                    {
                        file.CopyTo(fileStream);
                    }

                    obj.ImageUrl = @"\images\departments\" + fileName;

                }
               
                objFromDb.DepartmentName = obj.DepartmentName;
                _unitOfWork.Department.Update(objFromDb);
                _unitOfWork.Save();
                return Ok(objFromDb);
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

            var obj = _unitOfWork.Department.GetFirstOrDefault(d => d.Id == id);
            if (obj == null)
            {
                return NotFound(new { success = false, message = "Department is not found" });
            }

            if (!string.IsNullOrEmpty(obj.ImageUrl))
            {
                string wwwRootPath = _hostEnvironment.WebRootPath;
                var imagePath = Path.Combine(wwwRootPath, obj.ImageUrl.TrimStart('\\'));

                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            _unitOfWork.Department.Remove(obj);
            _unitOfWork.Save();

            return Ok(new { success = false, message = "Department deleted successfully!" });

        }
    }
}
