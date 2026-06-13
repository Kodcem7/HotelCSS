using CSSHotel.Models;

namespace CSSHotel.DataAccess.Repository.IRepository
{
    public interface ISurveyCycleRepository : IRepository<SurveyCycle>
    {
        void Update(SurveyCycle obj);
    }
}
