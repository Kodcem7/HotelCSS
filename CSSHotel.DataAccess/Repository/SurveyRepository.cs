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
    public class SurveyRepository : Repository<Survey>, ISurveyRepository
    {
        private readonly ApplicationDbContext _db;
        public SurveyRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public void Update(Survey obj)
        {
            _db.Surveys.Update(obj);
        }
    }
}
