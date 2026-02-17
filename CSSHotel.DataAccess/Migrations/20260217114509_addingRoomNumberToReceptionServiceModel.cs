using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class addingRoomNumberToReceptionServiceModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "ScheduledTime",
                table: "ReceptionServices",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<int>(
                name: "RoomNumber",
                table: "ReceptionServices",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ReceptionServices_RoomNumber",
                table: "ReceptionServices",
                column: "RoomNumber");

            migrationBuilder.AddForeignKey(
                name: "FK_ReceptionServices_Rooms_RoomNumber",
                table: "ReceptionServices",
                column: "RoomNumber",
                principalTable: "Rooms",
                principalColumn: "RoomNumber",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReceptionServices_Rooms_RoomNumber",
                table: "ReceptionServices");

            migrationBuilder.DropIndex(
                name: "IX_ReceptionServices_RoomNumber",
                table: "ReceptionServices");

            migrationBuilder.DropColumn(
                name: "RoomNumber",
                table: "ReceptionServices");

            migrationBuilder.AlterColumn<DateTime>(
                name: "ScheduledTime",
                table: "ReceptionServices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }
    }
}
