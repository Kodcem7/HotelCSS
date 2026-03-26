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
    public class SurveyAnswerRepository: Repository<SurveyAnswer>, ISurveyAnswerRepository
    {
        private readonly ApplicationDbContext _db;
        public SurveyAnswerRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public void Update(SurveyAnswer obj)
        {
            _db.SurveyAnswers.Update(obj);
        }
    }
}
