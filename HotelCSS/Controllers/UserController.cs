using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Identity; // Needed for UserManager
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager; // 1. Inject UserManager

        public UserController(IUnitOfWork unitOfWork, IConfiguration configuration, UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _userManager = userManager;
        }

        [HttpGet("GetStaffList")]
        public IActionResult GetAll()
        {
            var staffList = _unitOfWork.ApplicationUser.GetAll(includeProperties: "Department");
            return Ok(new { data = staffList });
        }

        // 2. Use a DTO (Data Transfer Object) to receive the password
        [HttpPost("CreatingNewUser")]
        public async Task<IActionResult> Create([FromBody] UserRegisterDTO obj)
        {
            // Check if user exists using UserManager
            var existingUser = await _userManager.FindByNameAsync(obj.UserName);
            if (existingUser != null)
            {
                return BadRequest(new { success = false, message = "Username already exists!" });
            }

            if (ModelState.IsValid)
            {
                // Map the DTO to the ApplicationUser
                ApplicationUser user = new ApplicationUser
                {
                    UserName = obj.UserName,
                    Name = obj.Name,
                    DepartmentId = obj.DepartmentId
                };

                // 3. Create user + Hash Password automatically
                var result = await _userManager.CreateAsync(user, obj.Password);

                if (result.Succeeded)
                {
                    // Optional: Assign a Role here if you used Roles
                    // await _userManager.AddToRoleAsync(user, "Staff");

                    return Ok(new { success = true, message = "Staff member created successfully" });
                }
                else
                {
                    // Returns errors like "Password too short" etc.
                    return BadRequest(result.Errors);
                }
            }
            return BadRequest(ModelState);
        }

        // 4. Changed 'int id' to 'string id'
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ApplicationUser obj)
        {
            // Note: 'obj.Id' in ApplicationUser is a string now.
            if (obj == null || id != obj.Id)
            {
                return BadRequest(new { success = false, message = "Invalid data mismatch" });
            }

            var userFromDb = await _userManager.FindByIdAsync(id);
            if (userFromDb == null)
            {
                return NotFound(new { success = false, message = "Error: Staff ID not found." });
            }

            // Only update fields that are allowed to change
            // DO NOT update Password here. Password changes require a specific "ChangePassword" endpoint.
            userFromDb.Name = obj.Name;
            userFromDb.DepartmentId = obj.DepartmentId;

            var result = await _userManager.UpdateAsync(userFromDb);

            if (result.Succeeded)
            {
                return Ok(new { success = true, message = "Staff updated successfully" });
            }
            return BadRequest(result.Errors);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var userFromDb = await _userManager.FindByIdAsync(id);
            if (userFromDb == null)
            {
                return NotFound(new { success = false, message = "Staff not found" });
            }

            var result = await _userManager.DeleteAsync(userFromDb);
            if (result.Succeeded)
            {
                return Ok(new { success = true, message = "Staff deleted successfully" });
            }
            return BadRequest(new { success = false, message = "Error deleting user" });
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] UserRegisterDTO loginData)
        {
            if (loginData == null)
            {
                return BadRequest(new { success = false, message = "Invalid login data!" });
            }

            // We use _unitOfWork here because we need the Department included
            var user = _unitOfWork.ApplicationUser.GetFirstOrDefault(
                u => u.UserName == loginData.UserName,
                includeProperties: "Department"
            );

            // 5. Use CheckPasswordAsync (User object, Plain Password)
            if (user == null || !await _userManager.CheckPasswordAsync(user, loginData.Password))
            {
                return Unauthorized(new { success = false, message = "Invalid username or password!" });
            }

            // --- Token Generation ---
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration.GetValue<string>("JwtSettings:SecretKey"));

            // Safety check: If Department is null (e.g. Admin), provide a fallback role
            string roleName = user.Department != null ? user.Department.DepartmentName : "Admin";
            string deptId = user.DepartmentId != null ? user.DepartmentId.ToString() : "0";

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id), // ID is string
                    new Claim(ClaimTypes.Name, user.UserName),
                    new Claim(ClaimTypes.Role, roleName),
                    new Claim("DepartmentId", deptId)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);
            return Ok(new { success = true, token = tokenString });
        }
    }
}