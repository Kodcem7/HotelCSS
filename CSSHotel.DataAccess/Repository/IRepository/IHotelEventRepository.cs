using CSSHotel.Models;

namespace CSSHotel.DataAccess.Repository.IRepository
{
    public interface IHotelEventRepository : IRepository<HotelEvent>
    {
        void Update(HotelEvent obj);
    }
}

