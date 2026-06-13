using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CSSHotel.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddSurveyCycle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SurveyCycleId",
                table: "SurveyResponses",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SurveyCycles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SurveyId = table.Column<int>(type: "int", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SurveyCycles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SurveyCycles_Surveys_SurveyId",
                        column: x => x.SurveyId,
                        principalTable: "Surveys",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SurveyResponses_SurveyCycleId",
                table: "SurveyResponses",
                column: "SurveyCycleId");

            migrationBuilder.CreateIndex(
                name: "IX_SurveyCycles_SurveyId",
                table: "SurveyCycles",
                column: "SurveyId");

            migrationBuilder.AddForeignKey(
                name: "FK_SurveyResponses_SurveyCycles_SurveyCycleId",
                table: "SurveyResponses",
                column: "SurveyCycleId",
                principalTable: "SurveyCycles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SurveyResponses_SurveyCycles_SurveyCycleId",
                table: "SurveyResponses");

            migrationBuilder.DropTable(
                name: "SurveyCycles");

            migrationBuilder.DropIndex(
                name: "IX_SurveyResponses_SurveyCycleId",
                table: "SurveyResponses");

            migrationBuilder.DropColumn(
                name: "SurveyCycleId",
                table: "SurveyResponses");
        }
    }
}
