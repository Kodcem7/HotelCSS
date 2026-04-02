using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class CreateSurveyDTO
    {
        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        public bool IsActive { get; set; }

        public List<CreateSurveyQuestionDTO> Questions { get; set; } = new List<CreateSurveyQuestionDTO>();
    }
}
