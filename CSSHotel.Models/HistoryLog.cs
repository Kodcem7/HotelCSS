using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public int? PointsEarned { get; set; }
        public int? PointsSpent { get; set; }
        [Column(TypeName = "decimal(18, 2)")]
        public decimal? MoneySpent { get; set; }
        public string? OrdersSummary { get; set; }
    }
}
