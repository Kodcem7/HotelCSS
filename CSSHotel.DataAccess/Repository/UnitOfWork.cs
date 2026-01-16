using CSSHotel.DataAccess.Data;
using CSSHotel.DataAccess.Repository.IRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.DataAccess.Repository
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _db;

        public IDepartmentRepository Department { get; private set; }
        public IServiceItemRepository ServiceItem { get; private set; }
        public IRequestRepository Request { get; private set; }
        public IRoomRepository Room { get; private set; }
        public IApplicationUserRepository Staff { get; private set; }

        public UnitOfWork(ApplicationDbContext db)
        {
            _db = db;
            Department = new DepartmentRepository(_db);
            ServiceItem = new ServiceItemRepository(_db);
            Request = new RequestRepository(_db);
            Room = new RoomRepository(_db);
            Staff = new ApplicationUserRepository(_db);
        }

        public void Save()
        {
            _db.SaveChanges();
        }
    }
}
