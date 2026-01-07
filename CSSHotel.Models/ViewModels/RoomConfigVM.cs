using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class RoomConfigVM
    {
        public int TotalFloors { get; set; }
        public int RoomsPerFloor { get; set; }
        public int StartingRoomNumber { get; set; } = 100;
    }
}
