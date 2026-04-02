using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class CreateSurveyQuestionDTO
    {
        [Required]
        public string QuestionText { get; set; }

        [Required]
        public string QuestionType { get; set; } // e.g., "StarRating", "Text"

        public int OrderIndex { get; set; }
    }
}
