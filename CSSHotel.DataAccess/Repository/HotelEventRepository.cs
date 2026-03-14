using CSSHotel.DataAccess.Data;
using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;

namespace CSSHotel.DataAccess.Repository
{
    public class HotelEventRepository : Repository<HotelEvent>, IHotelEventRepository
    {
        private readonly ApplicationDbContext _db;

        public HotelEventRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(HotelEvent obj)
        {
            _db.HotelEvents.Update(obj);
        }
    }
}

