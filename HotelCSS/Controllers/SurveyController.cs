using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Models;
using CSSHotel.Models.ViewModels;
using CSSHotel.Utility;
using CSSHotel.Utility.Service;
using MailKit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SurveyController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly AIService _aiService;
        public SurveyController(IUnitOfWork unitOfWork, AIService aiService)
        {
            _unitOfWork = unitOfWork;
            _aiService = aiService;
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

            var formattedAnswers = response.Answers.Select(a => new
            {
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

            var rooms = _unitOfWork.Room.GetAll().ToList();
            foreach (var room in rooms)
            {
                if (room.Status == SD.Status_Room_Available)
                {
                    room.isSkipped = true;
                }
                else
                {
                    room.isSkipped = false;
                }
                _unitOfWork.Room.Update(room);
            }

            _unitOfWork.Survey.Add(newSurvey);
            _unitOfWork.Save();

            // If created as active, open its first cycle (round).
            if (newSurvey.IsActive)
            {
                _unitOfWork.SurveyCycle.Add(new SurveyCycle { SurveyId = newSurvey.Id, StartedAt = DateTime.Now });
                _unitOfWork.Save();
            }

            return Ok(new
            {
                success = true,
                message = "Survey created successfully!",
            });
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

            // Answered-check is per CYCLE (week), not per survey, so the same room can
            // answer the same survey again each time it is re-activated.
            var currentCycle = _unitOfWork.SurveyCycle
                .GetAll(c => c.SurveyId == activeSurvey.Id && c.EndedAt == null)
                .OrderByDescending(c => c.StartedAt)
                .FirstOrDefault();

            bool alreadyAnswered = currentCycle != null
                ? _unitOfWork.SurveyResponse.GetFirstOrDefault(
                      r => r.SurveyCycleId == currentCycle.Id && r.RoomNumber == roomNumber) != null
                : _unitOfWork.SurveyResponse.GetFirstOrDefault(
                      r => r.SurveyId == activeSurvey.Id && r.RoomNumber == roomNumber) != null;

            if (alreadyAnswered)
            {
                return Ok(new { hasPendingSurvey = false });
            }
            var room = _unitOfWork.Room.GetFirstOrDefault(r => r.RoomNumber == roomNumber);
            if (room.isSkipped)
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

            var currentCycle = _unitOfWork.SurveyCycle
                .GetAll(c => c.SurveyId == obj.SurveyId && c.EndedAt == null)
                .OrderByDescending(c => c.StartedAt)
                .FirstOrDefault();

            bool alreadyAnswered = currentCycle != null
                ? _unitOfWork.SurveyResponse.GetFirstOrDefault(
                      r => r.SurveyCycleId == currentCycle.Id && r.RoomNumber == roomNumber) != null
                : _unitOfWork.SurveyResponse.GetFirstOrDefault(
                      r => r.SurveyId == obj.SurveyId && r.RoomNumber == roomNumber) != null;

            if (alreadyAnswered)
            {
                return BadRequest(new { message = "You already completed this survey!" });
            }

            var response = new SurveyResponse
            {
                SurveyId = obj.SurveyId,
                SurveyCycleId = currentCycle?.Id,
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
                // Only one survey active at a time: deactivate others + close their open cycles.
                var activeSurveys = _unitOfWork.Survey.GetAll(u => u.IsActive && u.Id != id).ToList();
                foreach (var s in activeSurveys)
                {
                    s.IsActive = false;
                    _unitOfWork.Survey.Update(s);
                    CloseOpenCycles(s.Id);
                }

                // Open a fresh cycle (this week's round) for this survey.
                _unitOfWork.SurveyCycle.Add(new SurveyCycle { SurveyId = survey.Id, StartedAt = DateTime.Now });

                // Reset skip flags so currently occupied rooms get the survey again this round.
                var rooms = _unitOfWork.Room.GetAll().ToList();
                foreach (var room in rooms)
                {
                    room.isSkipped = room.Status == SD.Status_Room_Available;
                    _unitOfWork.Room.Update(room);
                }
            }
            else
            {
                // Deactivated: close this survey's open cycle.
                CloseOpenCycles(survey.Id);
            }

            _unitOfWork.Survey.Update(survey);
            _unitOfWork.Save();
            return Ok(new { success = true, message = $"Survey '{survey.Title}' is now {(survey.IsActive ? "active" : "inactive")}." });
        }

        [HttpGet("AnalyzeSurvey/{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public async Task<IActionResult> AnalyzeSurvey(int id)
        {
            // 1. Fetch the survey and all responses
            var survey = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == id, includeProperties: "Questions");
            var responses = _unitOfWork.SurveyResponse.GetAll(r => r.SurveyId == id, includeProperties: "Answers").ToList();

            if (survey == null)
            {
                return NotFound(new { success = false, message = "Survey not found." });
            }
            if (responses.Count == 0)
            {
                return BadRequest(new { success = false, message = "Not enough responses to analyze yet. Please wait for guests to complete the survey." });
            }

            // 2. Build the Prompt for Gemini
            var promptBuilder = new System.Text.StringBuilder();
            promptBuilder.AppendLine($"Act as an expert Hotel Operations Analyst. Analyze the following guest survey results for the '{survey.Title}' survey.");
            promptBuilder.AppendLine("Provide a professional executive summary formatted in Markdown. Identify specific strengths and pinpoint exact areas needing improvement based on the data provided." +
                " If there are complaints about cleaning, food, or staff in the text comments, highlight them explicitly.To ensure the Hotel Manager can instantly identify key takeaways without drowning in text," +
                " you MUST use the following visual emoji system at the start of your bullet points:\r\n\r\nUse ✅ or \U0001f7e2 for specific strengths, positive feedback, and high scores.\r\n\r\nUse ❌ or 🔴 for exact areas" +
                " needing improvement or negative trends.\r\n\r\nUse 🚨 to explicitly highlight ANY textual complaints specifically regarding Cleaning, Food, or Staff.\r\n\r\nKeep your analysis concise, data-driven, and action-oriented.");
            promptBuilder.AppendLine("\n--- RAW SURVEY DATA ---");

            foreach (var q in survey.Questions.OrderBy(x => x.OrderIndex))
            {
                promptBuilder.AppendLine($"\nQuestion: {q.QuestionText}");

                // Get all answers for this specific question
                var allAnswers = responses.SelectMany(r => r.Answers).Where(a => a.SurveyQuestionId == q.Id).ToList();

                if (q.QuestionType == "StarRating")
                {
                    var average = allAnswers.Any() ? allAnswers.Average(a => double.Parse(a.AnswerValue)) : 0;
                    promptBuilder.AppendLine($"- Average Score: {average:F1} out of 5 stars");
                }
                else if (q.QuestionType == "YesNo")
                {
                    int yesCount = allAnswers.Count(a => a.AnswerValue.Equals("Yes", StringComparison.OrdinalIgnoreCase));
                    int noCount = allAnswers.Count(a => a.AnswerValue.Equals("No", StringComparison.OrdinalIgnoreCase));
                    promptBuilder.AppendLine($"- Guest Votes: {yesCount} Yes | {noCount} No");
                }
                else
                {
                    promptBuilder.AppendLine("- Guest Comments:");
                    foreach (var a in allAnswers)
                    {
                        if (!string.IsNullOrWhiteSpace(a.AnswerValue))
                            promptBuilder.AppendLine($"  * \"{a.AnswerValue}\"");
                    }
                }
            }
            promptBuilder.AppendLine("--- END OF DATA ---");

            string finalPrompt = promptBuilder.ToString();

            try
            {
                string aiResponse = await _aiService.GetAnswer(finalPrompt);

                return Ok(new { success = true, analysis = aiResponse });
            }
            catch (Exception ex)
            {
                // If Gemini's API is down or the key fails, this catches it safely
                return StatusCode(500, new { success = false, message = "Gemini AI Analysis failed: " + ex.Message });
            }
        }

        [HttpDelete("DeleteSurvey/{id}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult DeleteSurvey(int id)
        {
            var survey = _unitOfWork.Survey.GetFirstOrDefault(u => u.Id == id);
            if (survey == null)
            {
                return NotFound(new { success = false, message = "Survey not found." });
            }


            var surveyResponses = _unitOfWork.SurveyResponse.GetAll(u => u.SurveyId == id).ToList();
            var surveyQuestions = _unitOfWork.SurveyQuestion.GetAll(u => u.SurveyId == id).ToList();

            var questionIds = surveyQuestions.Select(q => q.Id).ToList();

            var surveyAnswers = _unitOfWork.SurveyAnswer.GetAll(a => questionIds.Contains(a.SurveyQuestionId)).ToList();

            if (surveyAnswers.Any())
                _unitOfWork.SurveyAnswer.RemoveRange(surveyAnswers);

            if (surveyQuestions.Any())
                _unitOfWork.SurveyQuestion.RemoveRange(surveyQuestions);

            if (surveyResponses.Any())
                _unitOfWork.SurveyResponse.RemoveRange(surveyResponses);

            _unitOfWork.Survey.Remove(survey);
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Survey deleted successfully." });
        }

        [HttpDelete("BulkDeleteSurveys")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public async Task<IActionResult> BulkDeleteSurveys([FromBody] List<int> surveyIds)
        {
            if (surveyIds == null || !surveyIds.Any())
            {
                return BadRequest(new { success = false, message = "No survey IDs provided for deletion." });
            }
            foreach (var id in surveyIds)
            {
                var survey = _unitOfWork.Survey.GetFirstOrDefault(u => u.Id == id);
                if (survey != null)
                {
                    var surveyResponses = _unitOfWork.SurveyResponse.GetAll(u => u.SurveyId == id).ToList();
                    var surveyQuestions = _unitOfWork.SurveyQuestion.GetAll(u => u.SurveyId == id).ToList();
                    var questionIds = surveyQuestions.Select(q => q.Id).ToList();
                    var surveyAnswers = _unitOfWork.SurveyAnswer.GetAll(a => questionIds.Contains(a.SurveyQuestionId)).ToList();
                    if (surveyAnswers.Any())
                        _unitOfWork.SurveyAnswer.RemoveRange(surveyAnswers);
                    if (surveyQuestions.Any())
                        _unitOfWork.SurveyQuestion.RemoveRange(surveyQuestions);
                    if (surveyResponses.Any())
                        _unitOfWork.SurveyResponse.RemoveRange(surveyResponses);
                    _unitOfWork.Survey.Remove(survey);
                }
            }
            _unitOfWork.Save();
            return Ok(new { success = true, message = "Selected surveys deleted successfully." });
        }
        [HttpGet("AverageStars/{surveyId}")]
        public IActionResult AverageStars(int surveyId)
        {
            // 1. FIXED: We MUST include "Questions" or the server will crash later!
            var survey = _unitOfWork.Survey.GetFirstOrDefault(
                u => u.Id == surveyId,
                includeProperties: "Questions"
            );

            if (survey == null)
            {
                return NotFound(new { success = false, message = "Survey not found." });
            }

            // 2. FIXED: Grab the IDs of ALL StarRating questions, just in case there are multiple!
            var starQuestionIds = survey.Questions
                .Where(q => q.QuestionType == "StarRating")
                .Select(q => q.Id)
                .ToList();

            if (!starQuestionIds.Any())
            {
                return BadRequest(new { success = false, message = "This survey does not have any Star Rating questions." });
            }

            var surveyResponses = _unitOfWork.SurveyResponse.GetAll(
                u => u.SurveyId == surveyId,
                includeProperties: "Answers"
            ).ToList();

            // FIXED: GetAll() returns an empty list, not null. So we check .Any()
            if (!surveyResponses.Any())
            {
                return Ok(new { success = true, average = 0, message = "No one has taken this survey yet." });
            }

            // 3. FIXED: Safely grab the answers and parse them without crashing
            var starRatings = surveyResponses
                .SelectMany(r => r.Answers)
                // Only look at answers that belong to one of our Star Questions
                .Where(a => starQuestionIds.Contains(a.SurveyQuestionId))
                .Select(a =>
                {
                    // SAFE PARSING: If it's a valid number, grab it. If not, ignore it.
                    bool isNumber = double.TryParse(a.AnswerValue, out double rating);
                    return new { isNumber, rating };
                })
                .Where(x => x.isNumber)
                .Select(x => x.rating)
                .ToList();

            if (!starRatings.Any())
            {
                return Ok(new { success = true, average = 0, message = "No star ratings found in the responses." });
            }

            // 4. Calculate the average and round it to 1 decimal place (e.g., 4.2 instead of 4.238491)
            var average = Math.Round(starRatings.Average(), 1);

            return Ok(new { success = true, average = average });
        }

        // Closes any still-open cycle(s) for a survey (sets EndedAt = now).
        private void CloseOpenCycles(int surveyId)
        {
            var openCycles = _unitOfWork.SurveyCycle.GetAll(c => c.SurveyId == surveyId && c.EndedAt == null).ToList();
            foreach (var c in openCycles)
            {
                c.EndedAt = DateTime.Now;
                _unitOfWork.SurveyCycle.Update(c);
            }
        }

        // Per-question average star rating for each weekly cycle (for the trend chart).
        [HttpGet("GetQuestionTrends/{surveyId}")]
        [Authorize(Roles = SD.Role_Admin + "," + SD.Role_Manager)]
        public IActionResult GetQuestionTrends(int surveyId)
        {
            var survey = _unitOfWork.Survey.GetFirstOrDefault(s => s.Id == surveyId, includeProperties: "Questions");
            if (survey == null)
            {
                return NotFound(new { success = false, message = "Survey not found." });
            }

            var starQuestions = survey.Questions
                .Where(q => q.QuestionType == "StarRating")
                .OrderBy(q => q.OrderIndex)
                .ToList();

            var questionMeta = starQuestions
                .Select(q => new { id = q.Id, key = $"q{q.Id}", text = q.QuestionText })
                .ToList();

            var cycles = _unitOfWork.SurveyCycle
                .GetAll(c => c.SurveyId == surveyId)
                .OrderBy(c => c.StartedAt)
                .ToList();

            if (!starQuestions.Any() || !cycles.Any())
            {
                return Ok(new
                {
                    success = true,
                    surveyTitle = survey.Title,
                    questions = questionMeta,
                    weeks = new List<object>(),
                    message = !starQuestions.Any()
                        ? "This survey has no star-rating questions."
                        : "No survey rounds yet. Activate the survey to start a round."
                });
            }

            var responses = _unitOfWork.SurveyResponse
                .GetAll(r => r.SurveyId == surveyId && r.SurveyCycleId != null, includeProperties: "Answers")
                .ToList();

            var weeks = new List<Dictionary<string, object>>();
            foreach (var cycle in cycles)
            {
                var row = new Dictionary<string, object>
                {
                    ["cycleId"] = cycle.Id,
                    ["startedAt"] = cycle.StartedAt,
                    ["label"] = cycle.StartedAt.ToString("dd MMM, HH:mm"),
                    ["responseCount"] = responses.Count(r => r.SurveyCycleId == cycle.Id)
                };

                var cycleAnswers = responses
                    .Where(r => r.SurveyCycleId == cycle.Id)
                    .SelectMany(r => r.Answers)
                    .ToList();

                foreach (var q in starQuestions)
                {
                    var ratings = cycleAnswers
                        .Where(a => a.SurveyQuestionId == q.Id)
                        .Select(a => double.TryParse(a.AnswerValue, out var v) ? (double?)v : null)
                        .Where(v => v.HasValue)
                        .Select(v => v.Value)
                        .ToList();

                    row[$"q{q.Id}"] = ratings.Any() ? (object)Math.Round(ratings.Average(), 2) : null;
                }

                weeks.Add(row);
            }

            return Ok(new
            {
                success = true,
                surveyTitle = survey.Title,
                questions = questionMeta,
                weeks = weeks
            });
        }

    }
}
