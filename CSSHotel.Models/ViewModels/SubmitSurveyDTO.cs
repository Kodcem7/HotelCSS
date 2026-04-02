using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CSSHotel.Models;

namespace CSSHotel.Models.ViewModels
{
    public class SubmitSurveyDTO
    {
        public int SurveyId { get; set; }
        public List<SubmitAnswerDTO> Answers { get; set; } = new List<SubmitAnswerDTO>();
    }
}
