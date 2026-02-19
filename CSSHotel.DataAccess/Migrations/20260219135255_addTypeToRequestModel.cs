using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class addTypeToRequestModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Type",
                table: "Requests");
        }
    }
}
