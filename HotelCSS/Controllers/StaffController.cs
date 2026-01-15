using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration; 
        public StaffController(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
        }

        [HttpGet("GetStaffList")]
        public IActionResult GetAll()
        {
            var staffList = _unitOfWork.Staff.GetAll(includeProperties: "Department");
            return Ok(new { data = staffList });
        }

        [HttpPost("CreatingNewUser")]
        public IActionResult Create([FromBody] Staff obj)
        {
            var existingUser = _unitOfWork.Staff.GetFirstOrDefault(u => u.Username == obj.Username);
            if (existingUser != null)
            {
                return BadRequest(new { success = false, message = "Username already exists!" });
            }
            if (ModelState.IsValid)
            {
                //Hashing the password
                obj.Password = BCrypt.Net.BCrypt.HashPassword(obj.Password);

                _unitOfWork.Staff.Add(obj);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Staff member created successfully" });
            }
            return BadRequest(ModelState);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Staff obj)
        {
            if (obj == null || id != obj.Id)
            {
                return BadRequest(new { success = false, message = "Invalid data mismatch" });
            }
            var objFromDb = _unitOfWork.Staff.GetFirstOrDefault(u => u.Id == id);
            if (objFromDb == null)
            {
                return NotFound(new { success = false, message = "Error: Staff ID not found." });
            }
            if (ModelState.IsValid)
            {
                _unitOfWork.Staff.Update(obj);
                _unitOfWork.Save();
                return Ok(new { success = true, message = "Staff updated successfully" });
            }
            return BadRequest(ModelState);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var objFromDb = _unitOfWork.Staff.GetFirstOrDefault(u => u.Id == id);
            if (objFromDb == null)
            {
                return NotFound(new { success = false, message = "Staff not found" });
            }

            _unitOfWork.Staff.Remove(objFromDb);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Staff deleted successfully" });
        }

        [HttpPost("Login")]
        public IActionResult Login([FromBody] LoginVM loginData)
        {
            if (loginData == null)
            {
                return BadRequest(new { success = false, message = "Invalid login data!" });
            }

            var user = _unitOfWork.Staff.GetFirstOrDefault
                (u => u.Username == loginData.Username,
                 includeProperties: "Department");
            //if user is null or password hash doesn't match
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginData.Password, user.Password))
            {
                return Unauthorized(new { success = false, message = "Invalid username or password!" });
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration.GetValue<string>("JwtSettings:SecretKey"));

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            // This is the VIP Check (Admin, Kitchen, Reception, etc.)
            new Claim(ClaimTypes.Role, user.Department.DepartmentName), 
            // This is for filtering (So Kitchen only sees Kitchen stuff)
            new Claim("DepartmentId", user.DepartmentId.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7), // Token valid for 7 days
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            return Ok(new { success = true, token = tokenString });

        }
    }

}

