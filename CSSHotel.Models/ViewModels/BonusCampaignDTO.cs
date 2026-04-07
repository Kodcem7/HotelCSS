using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.Models.ViewModels
{
    public class BonusCampaignDTO
    {
        public string CampaignType { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public int? ServiceItemId { get; set; }
        public int ExtraPoints { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool? IsActive { get; set; } = true;
    }
}
