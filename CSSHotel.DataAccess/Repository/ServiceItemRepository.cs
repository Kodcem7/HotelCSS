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
    public class ServiceItemRepository : Repository<ServiceItem>, IServiceItemRepository
    {
        private ApplicationDbContext _db;
        public ServiceItemRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(ServiceItem obj)
        {
            _db.ServiceItems.Update(obj);
        }
    }
}
