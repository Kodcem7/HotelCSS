using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceItemController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IWebHostEnvironment _hostEnvironment;
        public ServiceItemController(IUnitOfWork unitOfWork, IWebHostEnvironment hostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _hostEnvironment = hostEnvironment;
        }

        [HttpGet("GetServiceItems")]
        public IActionResult GetAll()
        {
            var serviceItems = _unitOfWork.ServiceItem.GetAll(includeProperties: "Department");
            return Ok(new { data = serviceItems });
        }

        [HttpPost]
        public IActionResult Create([FromForm] ServiceItem obj, IFormFile file)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "ServiceItem object is null" });
            }

            if (ModelState.IsValid)
            {
                string wwwRootPath = _hostEnvironment.WebRootPath;

                if (file != null)
                {
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string productPath = Path.Combine(wwwRootPath, @"images\serviceitems");

                    if (!Directory.Exists(productPath))
                    {
                        Directory.CreateDirectory(productPath);
                    }

                    using (var fileStream = new FileStream(Path.Combine(productPath, fileName), FileMode.Create))
                    {
                        file.CopyTo(fileStream);
                    }
                    obj.ImageUrl = @"\images\serviceitems\" + fileName;
                }
                obj.Department = null;
                _unitOfWork.ServiceItem.Add(obj);
                _unitOfWork.Save();
                return CreatedAtAction(nameof(Index), new { id = obj.Id }, obj);
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromForm] ServiceItem obj, IFormFile file)
        {
            if (id == 0 || id != obj.Id)
            {
                return BadRequest(new { success = false, message = "ID cannot be 0" });
            }
            if (ModelState.IsValid)
            {
                var objFromDb = _unitOfWork.ServiceItem.GetFirstOrDefault(u => u.Id == id);

                if (objFromDb == null)
                {
                    return NotFound(new { success = false, message = "Object is not found" });
                }

                string wwwRootPath = _hostEnvironment.WebRootPath;

                if (file != null)
                {
                    string fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    string productPath = Path.Combine(wwwRootPath, @"images\serviceitems");

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


                }
                objFromDb.Name = obj.Name;
                objFromDb.DepartmentId = obj.DepartmentId;
                objFromDb.Description = obj.Description;
                objFromDb.Price = obj.Price;
                objFromDb.IsAvailable = obj.IsAvailable;
                _unitOfWork.ServiceItem.Update(objFromDb);
                _unitOfWork.Save();
                return Ok(objFromDb);
            }
            return BadRequest(ModelState);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (id <= 0 || id == null)
            {
                return BadRequest(new { success = false, message = "Invalid ServiceItem ID" });
            }

            var obj = _unitOfWork.ServiceItem.GetFirstOrDefault(u => u.Id == id);
            if (obj == null)
            {
                return NotFound(new { success = false, message = "ServiceItem is not found" });
            }

            if (!string.IsNullOrEmpty(obj.ImageUrl))
            {
                string wwwRootPath = _hostEnvironment.WebRootPath;
                var oldImagePath = Path.Combine(wwwRootPath, obj.ImageUrl.TrimStart('\\'));

                if (System.IO.File.Exists(oldImagePath))
                {
                    System.IO.File.Delete(oldImagePath);
                }
            }

            _unitOfWork.ServiceItem.Remove(obj);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Delete Successful" });
        }

    }
}
