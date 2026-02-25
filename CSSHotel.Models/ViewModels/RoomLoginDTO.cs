using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class RoomLoginDTO
    {
        public int RoomId { get; set; }
        public string Token { get; set; }
        public string Email { get; set; }
    }
}
