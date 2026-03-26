using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class Survey
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; }

        public string Description { get; set; }

        // The master switch. Only ONE survey should usually be active at a time.
        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // EF Core Magic: One Survey has Many Questions
        public ICollection<SurveyQuestion> Questions { get; set; }
    }
}
