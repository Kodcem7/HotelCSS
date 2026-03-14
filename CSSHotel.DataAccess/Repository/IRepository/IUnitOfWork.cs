using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.DataAccess.Repository.IRepository
{
    public interface IUnitOfWork
    {
        IDepartmentRepository Department { get; }
        IServiceItemRepository ServiceItem { get; }
        IRequestRepository Request { get; }
        IRoomRepository Room { get; }
        IApplicationUserRepository ApplicationUser { get; }
        IReceptionServiceRepository ReceptionService { get; }
        IHistoryLogRepository HistoryLog { get; }
<<<<<<< HEAD
        IRewardVoucherRepository RewardVoucher { get; }
        IBonusCampaignRepository BonusCampaign { get; }
=======
        IHotelEventRepository HotelEvent { get; }
>>>>>>> ea0b5d435af9cc3cfc44e5a72b1d9a3a3d630217
        void Save();
    }
}
