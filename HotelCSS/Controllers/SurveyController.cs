using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SurveyController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public SurveyController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [HttpGet("GetAllSurveys")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult GetAllSurveys()
        {
            var surveys = _unitOfWork.Survey.GetAll()
                .OrderByDescending(s => s.CreatedAt)
                .ToList();
            return Ok(new { success = true, data = surveys });
        }

        [HttpGet("GetSurveyResponses/{surveyId}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult GetSurveyResponses(int surveyId)
        {
            var survey = _unitOfWork.Survey.GetFirstOrDefault(u => u.Id == surveyId);
            if (survey == null)
            {
                return NotFound(new { success = false, message = "Survey not found" });
            }

            var responses = _unitOfWork.SurveyResponse.GetAll(r => r.SurveyId == surveyId)
        .OrderByDescending(u => u.SubmittedAt)
        .Select(u => new
        {
            responseId = u.Id,
            roomNumber = u.RoomNumber,
            submittedAt = u.SubmittedAt
        }).ToList();
            return Ok(new
            {
                success = true,
                surveyTitle = survey.Title,
                responses = responses
            });
        }

        [HttpGet("GetResponseDetails/{responseId}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult GetResponseDetails(int responseId)
        {
            var response = _unitOfWork.SurveyResponse.GetFirstOrDefault(
                u => u.Id == responseId,
                includeProperties: "Answers"
            );

            if (response == null)
            {
                return NotFound(new { success = false, message = "Survey response not found" });
            }

            var survey = _unitOfWork.Survey.GetFirstOrDefault(
                u => u.Id == response.SurveyId,
                includeProperties: "Questions"
            );

            var formattedAnswers = response.Answers.Select(a => new {
                questionId = a.SurveyQuestionId,
                questionText = survey.Questions.FirstOrDefault(q => q.Id == a.SurveyQuestionId)?.QuestionText,
                questionType = survey.Questions.FirstOrDefault(q => q.Id == a.SurveyQuestionId)?.QuestionType,

                answerValue = a.AnswerValue
            }).ToList();

            return Ok(new
            {
                success = true,
                roomNumber = response.RoomNumber,
                submittedAt = response.SubmittedAt,
                answers = formattedAnswers
            });
        }

        [HttpPost("CreateSurvey")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult CreateSurvey([FromBody] CreateSurveyDTO obj)
        {
            if (obj.Questions == null || obj.Questions.Count == 0)
            {
                return BadRequest(new { success = false, message = "A survey must have at least one question." });
            }

            if (obj.IsActive)
            {
                var activeSurveys = _unitOfWork.Survey.GetAll(u => u.IsActive).ToList();
                foreach (var survey in activeSurveys)
                {
                    survey.IsActive = false;
                    _unitOfWork.Survey.Update(survey);
                }
            }

            var newSurvey = new Survey
            {
                Title = obj.Title,
                Description = obj.Description,
                IsActive = obj.IsActive,
                Questions = new List<SurveyQuestion>()
            };

            foreach (var question in obj.Questions)
            {
                newSurvey.Questions.Add(new SurveyQuestion
                {
                    QuestionText = question.QuestionText,
                    QuestionType = question.QuestionType,
                    OrderIndex = question.OrderIndex
                });
            }
            _unitOfWork.Survey.Add(newSurvey);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Survey created successfully!" });
        }

        [HttpGet("GetPendingSurvey")]
        [Authorize(Roles = SD.Role_Room)]
        public IActionResult GetPendingSurvey()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roomUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
            if (roomUser == null)
            {
                return BadRequest(new { success = false, message = "User not found" });
            }

            string roomNumString = roomUser.UserName.Replace("Room", "");
            int.TryParse(roomNumString, out int roomNumber);

            var activeSurvey = _unitOfWork.Survey.GetFirstOrDefault(u => u.IsActive, includeProperties: "Questions");
            if (activeSurvey == null)
            {
                return Ok(new { hasPendingSurvey = false });
            }

            var existingResponse = _unitOfWork.SurveyResponse.GetFirstOrDefault(
                r => r.SurveyId == activeSurvey.Id && r.RoomNumber == roomNumber);

            bool alreadyAnswered = existingResponse != null;

            if (alreadyAnswered)
            {
                return Ok(new { hasPendingSurvey = false });
            }

            activeSurvey.Questions = activeSurvey.Questions.OrderBy(q => q.OrderIndex).ToList();

            return Ok(new
            {
                hasPendingSurvey = true,
                survey = activeSurvey
            });
        }

        [HttpPost("SubmitSurvey")]
        [Authorize(Roles = SD.Role_Room)]
        public IActionResult SubmitSurvey([FromBody] SubmitSurveyDTO obj)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var roomUser = _unitOfWork.ApplicationUser.GetFirstOrDefault(u => u.Id == userId);
            if (roomUser == null)
            {
                return BadRequest(new { success = false, message = "User not found" });
            }

            string roomNumString = roomUser.UserName.Replace("Room", "");
            int.TryParse(roomNumString, out int roomNumber);

            var existingResponse = _unitOfWork.SurveyResponse.GetFirstOrDefault(
                r => r.SurveyId == obj.SurveyId && r.RoomNumber == roomNumber);

            bool alreadyAnswered = existingResponse != null;

            if (alreadyAnswered)
            {
                return BadRequest(new { message = "You already completed this survey!" });
            }

            var response = new SurveyResponse
            {
                SurveyId = obj.SurveyId,
                RoomNumber = roomNumber,
                Answers = new List<SurveyAnswer>(),
            };

            foreach (var answer in obj.Answers)
            {
                response.Answers.Add(new SurveyAnswer
                {
                    SurveyQuestionId = answer.QuestionId,
                    AnswerValue = answer.Value
                });
            }

            _unitOfWork.SurveyResponse.Add(response);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Survey completed successfully!" });
        }

        [HttpPut("ToggleActive/{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult ToggleActive(int id)
        {
            var survey = _unitOfWork.Survey.GetFirstOrDefault(u => u.Id == id);
            if (survey == null)
            {
                return NotFound(new { success = false, message = "Survey not found" });
            }

            survey.IsActive = !survey.IsActive;

            if (survey.IsActive)
            {
                var activeSurveys = _unitOfWork.Survey.GetAll(u =>u.IsActive && u.Id != id).ToList();
                foreach (var s in activeSurveys)
                {
                    s.IsActive = false;
                    _unitOfWork.Survey.Update(s);
                }
            }

            _unitOfWork.Survey.Update(survey);
            _unitOfWork.Save();
            return Ok(new { success = true, message = $"Survey '{survey.Title}' is now {(survey.IsActive ? "active" : "inactive")}." });
        }

    }
}
