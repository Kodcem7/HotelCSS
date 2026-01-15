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
    public class StaffRepository : Repository<Staff>, IStaffRepository
    {
        private ApplicationDbContext _db;
        public StaffRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(Staff obj)
        {
            var objFromDb = _db.Staffs.FirstOrDefault(u => u.Id == obj.Id);

            if (objFromDb != null)
            {
                objFromDb.Username = obj.Username;
                objFromDb.DepartmentId = obj.DepartmentId;
                if (obj.Password != null)
                {
                    //hashing the password while updating.
                    objFromDb.Password = BCrypt.Net.BCrypt.HashPassword(obj.Password);
                }
            }
        }
    }
}
