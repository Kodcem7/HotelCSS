using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class addMailBoolToRoomDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "mailSent",
                table: "Rooms",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "mailSent",
                table: "Rooms");
        }
    }
}
