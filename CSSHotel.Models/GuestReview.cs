using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class GuestReview
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string TripAdvisorId { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public int Rating { get; set; }
        public string Author { get; set; }
        public DateTime PublishedDate { get; set; }

        public DateTime FetchedAt { get; set; } = DateTime.UtcNow;
    }
}
