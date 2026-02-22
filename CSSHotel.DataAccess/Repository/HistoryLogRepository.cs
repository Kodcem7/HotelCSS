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
    public class HistoryLogRepository: Repository<HistoryLog>, IHistoryLogRepository
    {
        private ApplicationDbContext _db;
        public HistoryLogRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public void Update(HistoryLog obj)
        {
            _db.HistoryLogs.Update(obj);
        }
    }
}
