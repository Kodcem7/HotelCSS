using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class addNewSeed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 6,
                column: "Name",
                value: "Tech Issue");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 6,
                column: "Name",
                value: "Technic Issue");
        }
    }
}
