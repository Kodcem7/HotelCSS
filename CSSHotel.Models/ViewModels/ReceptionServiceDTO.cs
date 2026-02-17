using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class ReceptionServiceDTO
    {
        [Required]
        public DateTime ScheduledTime { get; set; } // for wake up calls, etc.
        public string? Notes { get; set; }
    }
}
