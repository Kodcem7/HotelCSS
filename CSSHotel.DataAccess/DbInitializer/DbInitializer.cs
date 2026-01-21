using CSSHotel.DataAccess.Data;
using CSSHotel.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CSSHotel.DataAccess.DbInitializer
{
    public class DbInitializer : IDbInitializer
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _db;

        public DbInitializer(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext db)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _db = db;
        }

        public void Initialize()
        {
            // 1. Apply Migrations (Safety Check)
            try
            {
                if (_db.Database.GetPendingMigrations().Count() > 0)
                {
                    _db.Database.Migrate();
                }
            }
            catch (Exception ex)
            {
                // Log errors here if needed
            }

            // 2. Fix the "Department" FK Issue
            // We ensure Department 99 exists before we try to put a user in it.
            var adminDept = _db.Departments.FirstOrDefault(u => u.Id == 99);
            if (adminDept == null)
            {
                _db.Departments.Add(new Department
                {
                    Id = 99,
                    DepartmentName = "Administration",
                    // ImageUrl = "" // Set empty string if required by your model
                });
                _db.SaveChanges();
            }

            // 3. Create Roles
            if (!_roleManager.RoleExistsAsync("Admin").GetAwaiter().GetResult())
            {
                _roleManager.CreateAsync(new IdentityRole("Admin")).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole("Manager")).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole("Staff")).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole("HouseKeeping")).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole("Kitchen")).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole("Technic")).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole("Reception")).GetAwaiter().GetResult();
                _roleManager.CreateAsync(new IdentityRole("Restaurant")).GetAwaiter().GetResult();

                // 4. Create Admin User
                _userManager.CreateAsync(new ApplicationUser
                {
                    UserName = "admin",
                    Email = "admin@hotelcss.com",
                    Name = "Super Admin",
                    DepartmentId = 99, // We just ensured this ID exists above!
                    EmailConfirmed = true
                }, "Admin123!").GetAwaiter().GetResult();

                // 5. Assign Role
                ApplicationUser user = _db.ApplicationUsers.FirstOrDefault(u => u.Email == "admin@hotelcss.com");
                _userManager.AddToRoleAsync(user, "Admin").GetAwaiter().GetResult();
            }

            return;
        }
    }
}
