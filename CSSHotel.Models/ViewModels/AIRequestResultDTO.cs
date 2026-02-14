using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class AIRequestResultDTO
    {
        public int? ServiceItemId { get; set; }
        public string? ItemName { get; set; }
        public int Quantity { get; set; }
        public string? Intent { get; set; }
        public string? Note { get; set; }
    }
}
