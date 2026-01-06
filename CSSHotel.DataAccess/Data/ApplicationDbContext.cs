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
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<Room> Rooms { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<ServiceItem> ServiceItems { get; set; }
        public DbSet<Request> Requests { get; set; }
        public DbSet<Staff> Staffs { get; set; }


    

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // REQUIRED for Identity to work correctly

            // A. Seed Departments
            modelBuilder.Entity<Department>().HasData(
                new Department { Id = 1, DepartmentName = "Housekeeping" },
                new Department { Id = 2, DepartmentName = "Kitchen" },
                new Department { Id = 3, DepartmentName = "Technic" },
                new Department { Id = 4, DepartmentName = "Reception" },
                new Department { Id = 5, DepartmentName = "Restaurant" }
            );

            // B. Seed Service Items (Examples)
            modelBuilder.Entity<ServiceItem>().HasData(
                // Housekeeping Items
                new ServiceItem { Id = 1, Name = "Towel", DepartmentId = 1 },
                new ServiceItem { Id = 2, Name = "Shampoo", DepartmentId = 1 },
                new ServiceItem { Id = 3, Name = "Extra Blanket", DepartmentId = 1 },
                // Kitchen Items
                new ServiceItem { Id = 4, Name = "Hamburger", DepartmentId = 2 },
                new ServiceItem { Id = 5, Name = "Cola", DepartmentId = 2 },
                // Technic Items
                new ServiceItem { Id = 6, Name = "Fix AC", DepartmentId = 3 },
                new ServiceItem { Id = 7, Name = "TV Remote", DepartmentId = 3 }
            );
        }
    }

}
