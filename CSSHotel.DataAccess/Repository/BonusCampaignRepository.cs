using CSSHotel.DataAccess.Data;
using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.DataAccess.Repository
{
    public class BonusCampaignRepository : Repository<BonusCampaign>, IBonusCampaignRepository
    {
        private ApplicationDbContext _db;
        public BonusCampaignRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public void Update(BonusCampaign obj)
        {
            _db.BonusCampaigns.Update(obj);
        }
        public int GetTotalBonusPointsToday(int serviceItemId, DateTime today)
        {
            // This tells SQL Server to do the math and just return the final integer!
            return _db.BonusCampaigns
                .Where(b => b.IsActive == true &&
                            b.StartDate <= today &&
                            b.EndDate >= today &&
                            (b.CampaignType == "AllItems" || b.ServiceItemId == serviceItemId))
                .Sum(b => b.ExtraPoints);
        }
    }
}
