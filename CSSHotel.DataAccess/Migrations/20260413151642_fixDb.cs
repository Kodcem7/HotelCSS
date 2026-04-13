using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class fixDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<int>(
                name: "HotelEventId",
                table: "BonusCampaigns",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BonusCampaigns_HotelEventId",
                table: "BonusCampaigns",
                column: "HotelEventId");

            migrationBuilder.AddForeignKey(
                name: "FK_BonusCampaigns_HotelEvents_HotelEventId",
                table: "BonusCampaigns",
                column: "HotelEventId",
                principalTable: "HotelEvents",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BonusCampaigns_HotelEvents_HotelEventId",
                table: "BonusCampaigns");

            migrationBuilder.DropIndex(
                name: "IX_BonusCampaigns_HotelEventId",
                table: "BonusCampaigns");

            migrationBuilder.DropColumn(
                name: "HotelEventId",
                table: "BonusCampaigns");

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
    }
}
