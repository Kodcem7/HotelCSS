using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class addBonusCampaignForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BonusCampaignId",
                table: "HotelEvents",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_HotelEvents_BonusCampaignId",
                table: "HotelEvents",
                column: "BonusCampaignId");

            migrationBuilder.AddForeignKey(
                name: "FK_HotelEvents_BonusCampaigns_BonusCampaignId",
                table: "HotelEvents",
                column: "BonusCampaignId",
                principalTable: "BonusCampaigns",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HotelEvents_BonusCampaigns_BonusCampaignId",
                table: "HotelEvents");

            migrationBuilder.DropIndex(
                name: "IX_HotelEvents_BonusCampaignId",
                table: "HotelEvents");

            migrationBuilder.DropColumn(
                name: "BonusCampaignId",
                table: "HotelEvents");
        }
    }
}
