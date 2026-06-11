using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class QuestionTrendDTO
    {
        public string Period { get; set; } 
        public Dictionary<string, double> QuestionAverages { get; set; } = new();
    }
}
