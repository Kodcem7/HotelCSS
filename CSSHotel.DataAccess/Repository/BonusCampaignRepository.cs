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
    }
}
