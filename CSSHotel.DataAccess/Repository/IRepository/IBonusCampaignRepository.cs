using CSSHotel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.DataAccess.Repository.IRepository
{
    public interface IBonusCampaignRepository : IRepository<BonusCampaign>
    {
        int GetTotalBonusPointsToday(int serviceItemId, DateTime today);
        void Update(BonusCampaign obj);
    }
}
