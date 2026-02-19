using CSSHotel.Utility;
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
    public class Request
    {
        [Key]
        public int Id { get; set; }

        // Who made the request?
        [Required]
        public int RoomNumber { get; set; }

        [ForeignKey("RoomNumber")]
        [ValidateNever]
        public Room Room { get; set; }

        // What did they ask for?
        // For normal service orders, this is required.
        // For generic issue reports, this can be null.
        public int? ServiceItemId { get; set; }

        [ForeignKey("ServiceItemId")]
        [ValidateNever]
        public ServiceItem? ServiceItem { get; set; }
        [Range(1, 5,ErrorMessage ="You can order between 1 and 5 items.")]
        public int Quantity { get; set; } = 1;
        public string? Note { get; set; }
        public string? PhotoPath { get; set; }
        public DateTime RequestDate { get; set; } = DateTime.Now;
        public string Type { get; set; }
        // Status: "Pending", "Completed", "Cancelled"
        public string Status { get; set; }
    }

}

