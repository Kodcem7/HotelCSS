using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class CreateRoomDTO
    {
        [Required]
        public int RoomNumber { get; set; }
    }
}
