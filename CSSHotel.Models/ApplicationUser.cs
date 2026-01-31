using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace CSSHotel.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Name { get; set; }

        // Nullable because 'Room' or 'Admin' role won't have a department
        public int? DepartmentId { get; set; }
        [ForeignKey("DepartmentId")]
        [JsonIgnore]
        public Department? Department { get; set; }
    }
}
