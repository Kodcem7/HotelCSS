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
    public class GuestReviewRepository : Repository<GuestReview>, IGuestReviewRepository
    {
        private ApplicationDbContext _db;

        public GuestReviewRepository(ApplicationDbContext db) : base(db)
        {
            _db = db;
        }

        public void Update(GuestReview obj)
        {
            _db.GuestReviews.Update(obj);
        }
    }
}
