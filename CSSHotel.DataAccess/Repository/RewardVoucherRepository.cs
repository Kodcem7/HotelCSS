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
    public class RewardVoucherRepository : Repository<RewardVoucher>, IRewardVoucherRepository
    {
        private readonly ApplicationDbContext _db;
        public RewardVoucherRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public void Update(RewardVoucher obj)
        {
            _db.RewardVouchers.Update(obj);
        }
    }
}
