using System.ComponentModel.DataAnnotations;

namespace CSSHotel.Models.ViewModels
{
    public class RoomUpdateDTO
    {
        [Required]
        public string Status { get; set; }
        public int PointsAdded { get; set; }
    }
}

