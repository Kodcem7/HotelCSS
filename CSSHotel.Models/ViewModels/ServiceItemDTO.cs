using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class ServiceItemDTO
    {
        public string Name { get; set; }
        public int DepartmentId { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? ImageUrl { get; set; }
    }
}
