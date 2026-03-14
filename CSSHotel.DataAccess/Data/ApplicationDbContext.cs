using CSSHotel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.DataAccess.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<Room> Rooms { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<ServiceItem> ServiceItems { get; set; }
        public DbSet<Request> Requests { get; set; }
        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<ReceptionService> ReceptionServices { get; set; }
        public DbSet<HistoryLog> HistoryLogs { get; set; }
<<<<<<< HEAD
        public DbSet<RewardVoucher> RewardVouchers { get; set; }
        public DbSet<BonusCampaign> BonusCampaigns { get; set; }
=======
        public DbSet<HotelEvent> HotelEvents { get; set; }
>>>>>>> ea0b5d435af9cc3cfc44e5a72b1d9a3a3d630217




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // REQUIRED for Identity to work correctly

            // A. Seed Departments
            modelBuilder.Entity<Department>().HasData(
                new Department { Id = 1, DepartmentName = "Housekeeping" },
                new Department { Id = 2, DepartmentName = "Kitchen" },
                new Department { Id = 3, DepartmentName = "Technic" },
                new Department { Id = 4, DepartmentName = "Reception" },
                new Department { Id = 5, DepartmentName = "Restaurant" },
                new Department { Id = 6, DepartmentName = "Manager" }
            );

            // B. Seed Service Items (Examples)
            modelBuilder.Entity<ServiceItem>().HasData(
                // Housekeeping Items
                new ServiceItem { Id = 1, Name = "Towel", DepartmentId = 1,PointsEarned = 30 },
                new ServiceItem { Id = 2, Name = "Shampoo", DepartmentId = 1, PointsEarned = 20 },
                new ServiceItem { Id = 3, Name = "Extra Blanket", DepartmentId = 1, PointsEarned = 50 },
                // Kitchen Items
                new ServiceItem { Id = 4, Name = "Hamburger", DepartmentId = 2, PointsEarned = 100 },
                new ServiceItem { Id = 5, Name = "Cola", DepartmentId = 2, PointsEarned = 150 },
                // Technic Items
                new ServiceItem { Id = 6, Name = "Tech Issue", DepartmentId = 3 },
                //Reception Items
                new ServiceItem { Id = 7, Name = "2 Days Free Sunbed Voucher", DepartmentId = 4, PointsEarned = 0,PointsCost = 50 }
            );
        }
    }

}
