using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class SurveyAnswer
    {
        [Key]
        public int Id { get; set; }

        // Links to the specific session/receipt
        public int SurveyResponseId { get; set; }
        public SurveyResponse SurveyResponse { get; set; }

        // Links to the exact question they are answering
        public int SurveyQuestionId { get; set; }
        public SurveyQuestion SurveyQuestion { get; set; }

        // Held as a string to allow both numbers ("5") and text ("Great room!")
        [Required]
        public string AnswerValue { get; set; }
    }
}
