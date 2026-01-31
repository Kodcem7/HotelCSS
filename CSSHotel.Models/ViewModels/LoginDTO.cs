using System.ComponentModel.DataAnnotations;

namespace CSSHotel.Utility
{
    /// <summary>
    /// DTO for login - only UserName and Password are required.
    /// </summary>
    public class LoginDTO
    {
        [Required(ErrorMessage = "Username is required")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = string.Empty;
    }
}
