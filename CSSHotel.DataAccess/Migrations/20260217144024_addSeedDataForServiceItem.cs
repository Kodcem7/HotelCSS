using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class addSeedDataForServiceItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 6,
                column: "Name",
                value: "Technic Issue");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 6,
                column: "Name",
                value: "Fix AC");

            migrationBuilder.InsertData(
                table: "ServiceItems",
                columns: new[] { "Id", "DepartmentId", "Description", "ImageUrl", "IsAvailable", "Name", "Price", "RequiredOptions" },
                values: new object[] { 7, 3, null, null, true, "TV Remote", null, null });
        }
    }
}
