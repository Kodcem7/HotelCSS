using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class seedDatasToDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "DepartmentName" },
                values: new object[,]
                {
                    { 1, "Housekeeping" },
                    { 2, "Kitchen" },
                    { 3, "Technic" },
                    { 4, "Reception" },
                    { 5, "Restaurant" }
                });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "RoomNumber", "Floor", "QrCodeString" },
                values: new object[,]
                {
                    { 1101, "1. Floor", "https://csshotel.com/login?room=1101" },
                    { 1102, "1. Floor", "https://csshotel.com/login?room=1102" },
                    { 1103, "1. Floor", "https://csshotel.com/login?room=1103" },
                    { 1104, "1. Floor", "https://csshotel.com/login?room=1104" },
                    { 1105, "1. Floor", "https://csshotel.com/login?room=1105" },
                    { 1106, "1. Floor", "https://csshotel.com/login?room=1106" },
                    { 1107, "1. Floor", "https://csshotel.com/login?room=1107" },
                    { 1108, "1. Floor", "https://csshotel.com/login?room=1108" },
                    { 1109, "1. Floor", "https://csshotel.com/login?room=1109" },
                    { 1110, "1. Floor", "https://csshotel.com/login?room=1110" },
                    { 1111, "1. Floor", "https://csshotel.com/login?room=1111" },
                    { 1112, "1. Floor", "https://csshotel.com/login?room=1112" },
                    { 1113, "1. Floor", "https://csshotel.com/login?room=1113" },
                    { 1114, "1. Floor", "https://csshotel.com/login?room=1114" },
                    { 1115, "1. Floor", "https://csshotel.com/login?room=1115" },
                    { 1116, "1. Floor", "https://csshotel.com/login?room=1116" },
                    { 2201, "2. Floor", "https://csshotel.com/login?room=2201" },
                    { 2202, "2. Floor", "https://csshotel.com/login?room=2202" },
                    { 2203, "2. Floor", "https://csshotel.com/login?room=2203" },
                    { 2204, "2. Floor", "https://csshotel.com/login?room=2204" },
                    { 2205, "2. Floor", "https://csshotel.com/login?room=2205" },
                    { 2206, "2. Floor", "https://csshotel.com/login?room=2206" },
                    { 2207, "2. Floor", "https://csshotel.com/login?room=2207" },
                    { 2208, "2. Floor", "https://csshotel.com/login?room=2208" },
                    { 2209, "2. Floor", "https://csshotel.com/login?room=2209" },
                    { 2210, "2. Floor", "https://csshotel.com/login?room=2210" },
                    { 2211, "2. Floor", "https://csshotel.com/login?room=2211" },
                    { 2212, "2. Floor", "https://csshotel.com/login?room=2212" },
                    { 2213, "2. Floor", "https://csshotel.com/login?room=2213" },
                    { 2214, "2. Floor", "https://csshotel.com/login?room=2214" },
                    { 2215, "2. Floor", "https://csshotel.com/login?room=2215" },
                    { 2216, "2. Floor", "https://csshotel.com/login?room=2216" },
                    { 3301, "3. Floor", "https://csshotel.com/login?room=3301" },
                    { 3302, "3. Floor", "https://csshotel.com/login?room=3302" },
                    { 3303, "3. Floor", "https://csshotel.com/login?room=3303" },
                    { 3304, "3. Floor", "https://csshotel.com/login?room=3304" },
                    { 3305, "3. Floor", "https://csshotel.com/login?room=3305" },
                    { 3306, "3. Floor", "https://csshotel.com/login?room=3306" },
                    { 3307, "3. Floor", "https://csshotel.com/login?room=3307" },
                    { 3308, "3. Floor", "https://csshotel.com/login?room=3308" },
                    { 3309, "3. Floor", "https://csshotel.com/login?room=3309" },
                    { 3310, "3. Floor", "https://csshotel.com/login?room=3310" },
                    { 3311, "3. Floor", "https://csshotel.com/login?room=3311" },
                    { 3312, "3. Floor", "https://csshotel.com/login?room=3312" },
                    { 3313, "3. Floor", "https://csshotel.com/login?room=3313" },
                    { 3314, "3. Floor", "https://csshotel.com/login?room=3314" },
                    { 3315, "3. Floor", "https://csshotel.com/login?room=3315" },
                    { 3316, "3. Floor", "https://csshotel.com/login?room=3316" },
                    { 4401, "4. Floor", "https://csshotel.com/login?room=4401" },
                    { 4402, "4. Floor", "https://csshotel.com/login?room=4402" },
                    { 4403, "4. Floor", "https://csshotel.com/login?room=4403" },
                    { 4404, "4. Floor", "https://csshotel.com/login?room=4404" },
                    { 4405, "4. Floor", "https://csshotel.com/login?room=4405" },
                    { 4406, "4. Floor", "https://csshotel.com/login?room=4406" },
                    { 4407, "4. Floor", "https://csshotel.com/login?room=4407" },
                    { 4408, "4. Floor", "https://csshotel.com/login?room=4408" },
                    { 4409, "4. Floor", "https://csshotel.com/login?room=4409" },
                    { 4410, "4. Floor", "https://csshotel.com/login?room=4410" },
                    { 4411, "4. Floor", "https://csshotel.com/login?room=4411" },
                    { 4412, "4. Floor", "https://csshotel.com/login?room=4412" },
                    { 4413, "4. Floor", "https://csshotel.com/login?room=4413" },
                    { 4414, "4. Floor", "https://csshotel.com/login?room=4414" },
                    { 4415, "4. Floor", "https://csshotel.com/login?room=4415" },
                    { 4416, "4. Floor", "https://csshotel.com/login?room=4416" },
                    { 5501, "5. Floor", "https://csshotel.com/login?room=5501" },
                    { 5502, "5. Floor", "https://csshotel.com/login?room=5502" },
                    { 5503, "5. Floor", "https://csshotel.com/login?room=5503" },
                    { 5504, "5. Floor", "https://csshotel.com/login?room=5504" },
                    { 5505, "5. Floor", "https://csshotel.com/login?room=5505" },
                    { 5506, "5. Floor", "https://csshotel.com/login?room=5506" },
                    { 5507, "5. Floor", "https://csshotel.com/login?room=5507" },
                    { 5508, "5. Floor", "https://csshotel.com/login?room=5508" },
                    { 5509, "5. Floor", "https://csshotel.com/login?room=5509" },
                    { 5510, "5. Floor", "https://csshotel.com/login?room=5510" },
                    { 5511, "5. Floor", "https://csshotel.com/login?room=5511" },
                    { 5512, "5. Floor", "https://csshotel.com/login?room=5512" },
                    { 5513, "5. Floor", "https://csshotel.com/login?room=5513" },
                    { 5514, "5. Floor", "https://csshotel.com/login?room=5514" },
                    { 5515, "5. Floor", "https://csshotel.com/login?room=5515" },
                    { 5516, "5. Floor", "https://csshotel.com/login?room=5516" }
                });

            migrationBuilder.InsertData(
                table: "ServiceItems",
                columns: new[] { "Id", "DepartmentId", "Name" },
                values: new object[,]
                {
                    { 1, 1, "Towel" },
                    { 2, 1, "Shampoo" },
                    { 3, 1, "Extra Blanket" },
                    { 4, 2, "Hamburger" },
                    { 5, 2, "Cola" },
                    { 6, 3, "Fix AC" },
                    { 7, 3, "TV Remote" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1101);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1102);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1103);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1104);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1105);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1106);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1107);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1108);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1109);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1110);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1111);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1112);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1113);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1114);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1115);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 1116);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2201);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2202);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2203);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2204);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2205);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2206);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2207);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2208);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2209);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2210);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2211);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2212);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2213);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2214);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2215);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 2216);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3301);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3302);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3303);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3304);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3305);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3306);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3307);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3308);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3309);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3310);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3311);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3312);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3313);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3314);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3315);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 3316);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4401);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4402);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4403);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4404);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4405);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4406);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4407);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4408);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4409);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4410);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4411);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4412);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4413);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4414);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4415);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 4416);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5501);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5502);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5503);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5504);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5505);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5506);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5507);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5508);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5509);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5510);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5511);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5512);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5513);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5514);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5515);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "RoomNumber",
                keyValue: 5516);

            migrationBuilder.DeleteData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
