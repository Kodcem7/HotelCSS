using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class DepartmentCreateDTO
    {
        [Required]
        public string DepartmentName { get; set; }
        public IFormFile? Image { get; set; }
    }
}
