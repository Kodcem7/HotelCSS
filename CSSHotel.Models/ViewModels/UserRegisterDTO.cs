using CSSHotel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Utility
{
    public class UserRegisterDTO : ApplicationUser
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public int? DepartmentId { get; set; }

    }
}
