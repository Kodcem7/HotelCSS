using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class SurveyQuestion
    {
        [Key]
        public int Id { get; set; }

        public int SurveyId { get; set; }
        public Survey Survey { get; set; }

        [Required]
        public string QuestionText { get; set; }

        // Tells React what UI to draw (e.g., "Rating", "YesNo", "Text")
        [Required]
        public string QuestionType { get; set; }

        // To keep questions in a specific order (1st, 2nd, 3rd)
        public int OrderIndex { get; set; }
    }
}
