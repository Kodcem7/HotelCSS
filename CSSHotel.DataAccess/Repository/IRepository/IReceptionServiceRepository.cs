using CSSHotel.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.DataAccess.Repository.IRepository
{
    public interface IReceptionServiceRepository: IRepository<ReceptionService>
    {
        void Update(ReceptionService obj);
    }
}
