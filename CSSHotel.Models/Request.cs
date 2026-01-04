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
        [Required]
        public int ServiceItemId { get; set; }

        [ForeignKey("ServiceItemId")]
        [ValidateNever]
        public ServiceItem ServiceItem { get; set; }

        public DateTime RequestDate { get; set; } = DateTime.Now;

        // Status: "Pending", "Completed", "Cancelled"
        public string Status { get; set; } = "Pending";
    }

}

