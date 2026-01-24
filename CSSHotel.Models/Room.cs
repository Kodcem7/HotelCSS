using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class Room
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [Display(Name = "Room Number")]
        public int RoomNumber { get; set; } // e.g., 310

        public string Status { get; set; } = "Available";
        // This stores the unique string/URL for the QR code
        public string QrCodeString { get; set; } = Guid.NewGuid().ToString();

    }
}
