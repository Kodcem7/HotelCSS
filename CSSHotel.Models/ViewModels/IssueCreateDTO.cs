using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace CSSHotel.Models.ViewModels
{
    /// <summary>
    /// DTO for room users to report a generic issue with optional photo.
    /// This does not require selecting a ServiceItem.
    /// </summary>
    public class IssueCreateDTO
    {
        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        public IFormFile? Photo { get; set; }
    }
}

