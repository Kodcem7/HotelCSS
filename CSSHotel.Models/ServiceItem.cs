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
    public class ServiceItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } // e.g., "Extra Blanket", "Hamburger"

        // Foreign Key relation to Department
        [Required]
        public int DepartmentId { get; set; }

        [ForeignKey("DepartmentId")]
        [ValidateNever] // Prevents validation errors when creating forms
        public Department Department { get; set; }

        public string? ImageUrl { get; set; }
        public string? Description { get; set; }
        [Column(TypeName = "decimal(18, 2)")] 
        public decimal? Price { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string? RequiredOptions { get; set; }

    }
}
