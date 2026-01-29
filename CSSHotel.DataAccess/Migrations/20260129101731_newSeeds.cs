using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class newSeeds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "ServiceItems",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 1,
                column: "Price",
                value: null);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 2,
                column: "Price",
                value: null);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "Price",
                value: null);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 4,
                column: "Price",
                value: null);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 5,
                column: "Price",
                value: null);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 6,
                column: "Price",
                value: null);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 7,
                column: "Price",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Price",
                table: "ServiceItems",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 1,
                column: "Price",
                value: 0m);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 2,
                column: "Price",
                value: 0m);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 3,
                column: "Price",
                value: 0m);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 4,
                column: "Price",
                value: 0m);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 5,
                column: "Price",
                value: 0m);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 6,
                column: "Price",
                value: 0m);

            migrationBuilder.UpdateData(
                table: "ServiceItems",
                keyColumn: "Id",
                keyValue: 7,
                column: "Price",
                value: 0m);
        }
    }
}
