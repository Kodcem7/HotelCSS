using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class EmailSettings
    {
        [Required]
        public required string Host { get; set; }
        [Required]
        public required int Port { get; set; }
        [Required]
        public  required string Username { get; set; } 
        [Required]
        public required string Password { get; set; } 
        [Required]
        public required string SenderName { get; set; } 
        [Required]
        public required string SenderEmail { get; set; } 
    }
}
