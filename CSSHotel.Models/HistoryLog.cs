using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class HistoryLog
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int RoomNumber { get; set; }
        [Required]
        public string GuestMail { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
    }
}
