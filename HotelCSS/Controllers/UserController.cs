using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Build.Tasks;
using System.Net;
using System.Security.Claims;
using IEmailService = CSSHotel.Utility.Service.IEmailService;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class UserController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailSender;

        public UserController(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, SignInManager<ApplicationUser> signInManager, ITokenService tokenService, IEmailService emailSender)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _emailSender = emailSender;
        }

        [HttpGet("GetStaffList")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult GetAll()
        {
            var staffList = _unitOfWork.ApplicationUser
                .GetAll(u => u.Department.Id != 100 && !u.UserName.StartsWith("Room"), includeProperties: "Department");
            return Ok(new { data = staffList });
        }

        [HttpPost("CreatingNewUser")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
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
                    DepartmentId = obj.DepartmentId,
                    Email = obj.Email
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
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
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
        [HttpPut("UpdateMyProfile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO obj)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Invalid data mismatch" });
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var objFromDb = await _userManager.FindByIdAsync(userId);
            if (objFromDb == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }
            objFromDb.Name = obj.Name;
            objFromDb.UserName = obj.UserName;
            var result = await _userManager.UpdateAsync(objFromDb);
            if (!result.Succeeded)
            {
                var updateErrors = string.Join(" ", result.Errors.Select(e => e.Description));
                return BadRequest(new { success = false, message = updateErrors });
            }
            else
            {
                return Ok(new { success = true, message = "Profile updated successfully" });
            }
        }
        [Authorize]
        [HttpPost("Change Password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO obj)
        {
            if (obj == null)
            {
                return BadRequest(new { success = false, message = "Invalid data mismatch" });
            }
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userFromDb = await _userManager.FindByIdAsync(userId);
            if (userFromDb == null)
            {
                return NotFound(new { success = false, message = "User not found." });
            }
            var result = await _userManager.ChangePasswordAsync(userFromDb, obj.OldPassword, obj.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                return BadRequest(new { success = false, message = errors });
            }
            else
            {
                return Ok(new { success = true, message = "Password is successfully changed!" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
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

            // 1. Get the roles (Only once!)
            var roles = await _userManager.GetRolesAsync(user);

            // 2. Generate the token using your new Service
            var tokenString = _tokenService.CreateToken(user, roles);

            // 3. Return it
            return Ok(new { success = true, token = tokenString });
        }

        [HttpGet("Room Login")]

        public async Task<IActionResult> RoomLogin([FromForm] RoomLoginDTO obj)
        {
            if (obj.RoomId == 0 || string.IsNullOrEmpty(obj.Token) || string.IsNullOrEmpty(obj.Email))
            {
                return BadRequest(new { success = false, message = "Invalid QR Code" });
            }

            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == obj.RoomId);

            if (room == null)
            {
                return NotFound(new { success = false, message = "Room not found!" });
            }

            if (room.QrCodeString != obj.Token)
            {
                return Unauthorized(new { success = false, message = "Invalid Security Token!" });
            }

            if (room.Status == "Available")
            {
                room.Status = "Occupied";
                room.CurrentGuestMail = obj.Email;
                room.CurrentCheckInDate = DateTime.Now;

                _unitOfWork.Room.Update(room);
                _unitOfWork.Save();
            }
            else if (room.Status == "Occupied")
            {

                if (!string.Equals(room.CurrentGuestMail, obj.Email, StringComparison.OrdinalIgnoreCase))
                {
                    return Unauthorized(new { success = false, message = "This room is occupied by another guest." });
                }
            }

            string username = "Room" + obj.RoomId;
            var user = await _userManager.FindByNameAsync(username);

            if (user == null)
            {
                return NotFound(new { success = false, message = "User for this room doesn't exists" });
            }

            // --- Generate Token for Room User too ---
            var roles = await _userManager.GetRolesAsync(user);
            var jwtToken = _tokenService.CreateToken(user, roles);

            await _signInManager.SignInAsync(user, isPersistent: true);

            return Ok(new
            {
                success = true,
                token = jwtToken, // Return the token here!
                message = "Login Successful! You are now authenticated as " + user.UserName
            });
        }

        [HttpPost("Check-Out")]
        public IActionResult CheckOut(int roomNumber)
        {
            var room = _unitOfWork.Room.GetFirstOrDefault(u => u.RoomNumber == roomNumber);
            if (room == null || room.Status == SD.Status_Room_Available)
            {
                return BadRequest(new { success = false, message = "Room not found or already empty." });
            }

            HistoryLog history = new HistoryLog
            {
                RoomNumber = room.RoomNumber,
                GuestMail = room.CurrentGuestMail ?? "unknown",
                CheckInDate = room.CurrentCheckInDate ?? DateTime.Now,
                CheckOutDate = DateTime.Now
            };
            _unitOfWork.HistoryLog.Add(history);
            //Delete the requests after check-out
            var oldServiceRequests = _unitOfWork.Request.GetAll(u => u.RoomNumber == roomNumber);
            _unitOfWork.Request.RemoveRange(oldServiceRequests);
            //Delete ReceptionService Requests from it's table after c/o
            var oldReceptionRequests = _unitOfWork.ReceptionService.GetAll(u => u.RoomNumber == roomNumber);
            _unitOfWork.ReceptionService.RemoveRange(oldReceptionRequests);
            //Reset room to available
            room.Status = SD.Status_Room_Available;
            room.CurrentGuestMail = null;
            room.CurrentCheckInDate = null;
            _unitOfWork.Room.Update(room);
            _unitOfWork.Save();

            return Ok(new { success = true, message = $"Room {roomNumber} has been checked out and wiped clean." });
        }

        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPassword)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var user = await _userManager.FindByEmailAsync(forgotPassword.Email);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found with this email." });
            }
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var param = new Dictionary<string, string>
            {
                {"token", token },
                {"email", forgotPassword.Email }
            };
            var callback = QueryHelpers.AddQueryString(forgotPassword.ClientUri, param);
            await _emailSender.SendEmailAsync(user.Email, "Reset password token", callback);
            return Ok(new { success = true, message = "Password reset token has been sent to your email." });
        }

        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO resetPassword)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var user = await _userManager.FindByEmailAsync(resetPassword.Email!);
            if (user == null)
            {
                return BadRequest("Invalid Request");
            }
            string decodedToken = WebUtility.UrlDecode(resetPassword.Token!);
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, resetPassword.Password!);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description);
                return BadRequest(new { Errors = errors });
            }
            return Ok(new { success = true, message = "Password has been reset successfully." });
        }
    }
}