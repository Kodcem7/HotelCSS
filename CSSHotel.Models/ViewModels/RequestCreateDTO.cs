using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class RequestCreateDTO
    {
        
        [Required]
        public int ServiceItemId { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; }

        public IFormFile? Photo { get; set; }




    }
}
