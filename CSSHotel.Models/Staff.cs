using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class Staff
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string Password { get; set; } // In a real app, hash this!

        // Which department do they belong to? (Reception = Admin)
        public int DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        [ValidateNever]
        public Department Department { get; set; }

    }
}
