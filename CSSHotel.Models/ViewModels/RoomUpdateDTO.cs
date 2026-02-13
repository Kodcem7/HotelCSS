using System.ComponentModel.DataAnnotations;

namespace CSSHotel.Models.ViewModels
{
    public class RoomUpdateDTO
    {
        [Required]
        public string Status { get; set; }
    }
}

