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
    public class SurveyQuestionRepository: Repository<SurveyQuestion>, ISurveyQuestionRepository
    {
        private readonly ApplicationDbContext _db;
        public SurveyQuestionRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }
        public void Update(SurveyQuestion obj)
        {
            _db.SurveyQuestions.Update(obj);
        }
    }
}
