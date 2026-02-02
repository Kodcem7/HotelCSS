using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using CSSHotel.Utility.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens; // You can remove this now if you want
using System.IdentityModel.Tokens.Jwt; // You can remove this now if you want
using System.Linq;
using System.Security.Claims; // You can remove this now if you want
using System.Text; // You can remove this now if you want
using System.Threading.Tasks;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;

        public UserController(IUnitOfWork unitOfWork, IConfiguration configuration, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, SignInManager<ApplicationUser> signInManager)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }

        [HttpGet("GetStaffList")]
        public IActionResult GetAll()
        {
            var staffList = _unitOfWork.ApplicationUser.GetAll(u => u.Department.Id != 100, includeProperties: "Department");
            return Ok(new { data = staffList });
        }

        [HttpPost("CreatingNewUser")]
        public async Task<IActionResult> Create([FromBody] UserRegisterDTO obj)
        {
            var existingUser = await _userManager.FindByNameAsync(obj.UserName);
            if (existingUser != null)
            {
                return BadRequest(new { success = false, message = "Username already exists!" });
            }

            if (ModelState.IsValid)
            {
                ApplicationUser user = new ApplicationUser
                {
                    UserName = obj.UserName,
                    Name = obj.Name,
                    DepartmentId = obj.DepartmentId
                };

                var result = await _userManager.CreateAsync(user, obj.Password);

                if (result.Succeeded)
                {
                    string roleName = "Admin";
                    if (obj.DepartmentId != 0)
                    {
                        var dept = _unitOfWork.Department.GetFirstOrDefault(u => u.Id == obj.DepartmentId);
                        if (dept != null)
                        {
                            roleName = dept.DepartmentName;
                        }
                    }

                    if (!await _roleManager.RoleExistsAsync(roleName))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(roleName));
                    }
                    await _userManager.AddToRoleAsync(user, roleName);
                    return Ok(new { success = true, message = "Staff created and Role assigned!" });
                }
                else
                {
                    var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                    return BadRequest(new { success = false, message = errors });
                }
            }
            var modelErrors = string.Join(" ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)));
            return BadRequest(new { success = false, message = string.IsNullOrEmpty(modelErrors) ? "Invalid data." : modelErrors });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UserRegisterDTO obj)
        {
            if (obj == null || id != obj.Id)
            {
                return BadRequest(new { success = false, message = "Invalid data mismatch" });
            }

            var objFromDb = await _userManager.FindByIdAsync(id);
            if (objFromDb == null)
            {
                return NotFound(new { success = false, message = "Error: Staff ID not found." });
            }

            var oldRoles = await _userManager.GetRolesAsync(objFromDb);
            string oldRoleName = oldRoles.FirstOrDefault();
            objFromDb.Name = obj.Name;
            objFromDb.DepartmentId = obj.DepartmentId;
            objFromDb.UserName = obj.UserName;

            var result = await _userManager.UpdateAsync(objFromDb);

            if (result.Succeeded)
            {
                if (obj.DepartmentId != 0)
                {
                    var newDept = _unitOfWork.Department.GetFirstOrDefault(u => u.Id == obj.DepartmentId);
                    string newRoleName = "Admin";
                    if (newDept != null)
                    {
                        newRoleName = newDept.DepartmentName;
                    }

                    if (oldRoleName != newRoleName)
                    {
                        if (!string.IsNullOrEmpty(oldRoleName))
                        {
                            await _userManager.RemoveFromRoleAsync(objFromDb, oldRoleName);
                        }

                        if (!await _roleManager.RoleExistsAsync(newRoleName))
                        {
                            await _roleManager.CreateAsync(new IdentityRole(newRoleName));
                        }
                        await _userManager.AddToRoleAsync(objFromDb, newRoleName);
                    }
                }
                return Ok(new { success = true, message = "Staff updated successfully" });
            }
            var updateErrors = string.Join(" ", result.Errors.Select(e => e.Description));
            return BadRequest(new { success = false, message = updateErrors });
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
        public async Task<IActionResult> Login([FromBody] LoginDTO loginData)
        {
            if (loginData == null)
            {
                return BadRequest(new { success = false, message = "Invalid login data!" });
            }

            var user = _unitOfWork.ApplicationUser.GetFirstOrDefault(
                u => u.UserName == loginData.UserName,
                includeProperties: "Department"
            );

            if (user == null || !await _userManager.CheckPasswordAsync(user, loginData.Password))
            {
                return Unauthorized(new { success = false, message = "Invalid username or password!" });
            }

            var roles = await _userManager.GetRolesAsync(user);
            string roleName = roles.FirstOrDefault() ?? "Admin";

            // --- Token Generation ---
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration.GetValue<string>("JwtSettings:SecretKey"));

            string deptId = user.DepartmentId != 0 ? user.DepartmentId.ToString() : "0";

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

        [HttpGet("Room Login")]
        public async Task<IActionResult> RoomLogin(int roomId, string token)
        {
            if (roomId == 0 || string.IsNullOrEmpty(token))
            {
                return BadRequest(new { success = false, message = "Invalid QR Code" });
            }

            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == roomId);

            if (room == null)
            {
                return NotFound(new { success = false, message = "Room not found!" });
            }

            if (room.QrCodeString != token)
            {
                return Unauthorized(new { success = false, message = "Invalid Security Token!" });
            }

            string username = "Room" + roomId;
            var user = await _userManager.FindByNameAsync(username);

            if (user == null)
            {
                return NotFound(new { success = false, message = "User for this room doesn't exists" });
            }

            await _signInManager.SignInAsync(user, isPersistent: true);

        }
    }
}