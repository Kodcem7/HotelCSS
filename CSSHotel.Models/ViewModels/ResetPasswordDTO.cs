using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class ResetPasswordDTO
    {
        [Required(ErrorMessage = "Password is required")]
        public string? Password { get; set; }

        [Compare("Password",ErrorMessage ="The password and confirmation password doesn't match")]
        public string? ConfirmPassword { get; set; }

        public string? Email { get; set; }
        public string? Token { get; set; }
    }
}
