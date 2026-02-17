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
    public class ReceptionService
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int RoomNumber { get; set; }
        [ForeignKey("RoomNumber")]
        [ValidateNever]
        public Room Room { get; set; }
        [Required]
        public string RequestType { get; set; }
        public DateTime? ScheduledTime { get; set; } // for wake up calls, etc.
        public DateTime PickUpTime { get; set; } 
        public string? Status { get; set; } = "Pending"; // Pending, Completed, Cancelled
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
