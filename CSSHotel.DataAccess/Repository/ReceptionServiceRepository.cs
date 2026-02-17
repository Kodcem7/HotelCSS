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
    public class ReceptionServiceRepository: Repository<ReceptionService>, IReceptionServiceRepository
    {
        private ApplicationDbContext _db;
        public ReceptionServiceRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(ReceptionService obj)
        {
            _db.ReceptionServices.Update(obj);
        }
    }
}
