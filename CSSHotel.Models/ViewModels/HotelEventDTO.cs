using System;
using System.ComponentModel.DataAnnotations;

namespace CSSHotel.Models.ViewModels
{

    public class HotelEventDTO
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? EventType { get; set; } 

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int BonusPoints { get; set; } = 0;

        [MaxLength(2000)]
        public string? MealInfo { get; set; }

        public bool IsActive { get; set; } = true;
    }
}

