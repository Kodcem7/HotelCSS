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
        void Save();
    }
}
