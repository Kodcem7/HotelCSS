using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class makeServiceItemIdNullablee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BonusCampaigns_ServiceItems_ServiceItemId",
                table: "BonusCampaigns");

            migrationBuilder.AlterColumn<int>(
                name: "ServiceItemId",
                table: "BonusCampaigns",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_BonusCampaigns_ServiceItems_ServiceItemId",
                table: "BonusCampaigns",
                column: "ServiceItemId",
                principalTable: "ServiceItems",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BonusCampaigns_ServiceItems_ServiceItemId",
                table: "BonusCampaigns");

            migrationBuilder.AlterColumn<int>(
                name: "ServiceItemId",
                table: "BonusCampaigns",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BonusCampaigns_ServiceItems_ServiceItemId",
                table: "BonusCampaigns",
                column: "ServiceItemId",
                principalTable: "ServiceItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
