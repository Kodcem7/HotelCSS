using CSSHotel.DataAccess.Data;
using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;

namespace CSSHotel.DataAccess.Repository
{
    public class SurveyCycleRepository : Repository<SurveyCycle>, ISurveyCycleRepository
    {
        private readonly ApplicationDbContext _db;
        public SurveyCycleRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public void Update(SurveyCycle obj)
        {
            _db.SurveyCycles.Update(obj);
        }
    }
}
