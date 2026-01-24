using CSSHotel.DataAccess.Data;
using CSSHotel.Models;
using CSSHotel.Utility;
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
            //CREATING ROOM DEPARTMENT IF NOT EXISTS
            var guestDept = _db.Departments.FirstOrDefault(u => u.DepartmentName == "Room");
            if (guestDept == null)
            {
                guestDept = new Department
                {
                    DepartmentName = "Room",
                };

                _db.Departments.Add(guestDept);
                _db.SaveChanges();
            }
            if (!_roleManager.RoleExistsAsync(SD.Role_Room).GetAwaiter().GetResult())
            {
                _roleManager.CreateAsync(new IdentityRole(SD.Role_Room)).GetAwaiter().GetResult();
            }
            //ADDING ROOM USERS AND ASSIGNING ROLES
            int validRoomDeptId = guestDept.Id;
            var allRooms = _db.Rooms.ToList();

            foreach (var room in allRooms)
            {
                string userName = "Room" + room.RoomNumber;

                var existingRoomUser = _userManager.FindByNameAsync(userName).GetAwaiter().GetResult();

                if (existingRoomUser == null)
                {
                    var newRoomUser = new ApplicationUser
                    {
                        UserName = userName,
                        Name = "Guest Room" + room.RoomNumber,
                        DepartmentId = validRoomDeptId
                    };
                    _userManager.CreateAsync(newRoomUser, "HotelGuest123!").GetAwaiter().GetResult();
                    _userManager.AddToRoleAsync(newRoomUser, SD.Role_Room).GetAwaiter().GetResult();
                }
            }
            return;
        }
    }
}
