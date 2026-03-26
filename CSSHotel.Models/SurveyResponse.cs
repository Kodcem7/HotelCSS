using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class SurveyResponse
    {
        [Key]
        public int Id { get; set; }

        // Which survey did they take?
        public int SurveyId { get; set; }
        public Survey Survey { get; set; }

        // Who took it? (Essential for hiding the popup later)
        public int RoomNumber { get; set; }

        public DateTime SubmittedAt { get; set; } = DateTime.Now;

        // EF Core Magic: One Response has Many Answers
        public ICollection<SurveyAnswer> Answers { get; set; }
    }
}
