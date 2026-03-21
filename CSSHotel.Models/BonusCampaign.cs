using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models
{
    public class BonusCampaign
    {
        [Key]
        public int Id { get; set; }

        public int? ServiceItemId { get; set; }

        [ForeignKey("ServiceItemId")]
        [ValidateNever]
        public ServiceItem? ServiceItem { get; set; }

        [Required]
        public string CampaignType { get; set; }

        [Required]
        public int ExtraPoints { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;
    
    }
}
