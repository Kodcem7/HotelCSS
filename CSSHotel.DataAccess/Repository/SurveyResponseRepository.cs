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
    public class SurveyResponseRepository: Repository<SurveyResponse>, ISurveyResponseRepository
    {
        private readonly ApplicationDbContext _db;
        public SurveyResponseRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public void Update(SurveyResponse obj)
        {
            _db.SurveyResponses.Update(obj);
        }
    }
}
