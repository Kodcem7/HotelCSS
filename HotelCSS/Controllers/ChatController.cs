using CSSHotel.DataAccess.Repository.IRepository;
using CSSHotel.Utility.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using CSSHotel.Models.ViewModels;

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AIService _aiService;
        private readonly IUnitOfWork _unitOfWork;

        public ChatController(AIService aiService, IUnitOfWork unitOfWork)
        {
            _aiService = aiService;
            _unitOfWork = unitOfWork;
        }


        [HttpPost]
        public async Task<IActionResult> AskAI([FromBody] ChatRequest request)
        {
            if (string.IsNullOrEmpty(request.Question))
            {
                return BadRequest(new { success = false, message = "Question cannot be empty" });
            }

            try
            {
                //Call Gemini
                var answer = await _aiService.GetAnswer(request.Question);
                return Ok(new { answer = answer });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"AI Error: {ex.Message}");
            }
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeRequest([FromBody] ChatRequest request)
        {
            // 1. Get all available Service Items from DB
            var allItems = _unitOfWork.ServiceItem.GetAll();

            // 2. Convert them to a simple string list (ID and Name) for the AI
            var menuList = allItems.Select(x => new
            {
                x.Id,
                x.Name,
                Options = x.RequiredOptions ?? "None"
            }).ToList();
            string menuJson = System.Text.Json.JsonSerializer.Serialize(menuList);

            // 3. Ask AI to match the user's text to a menu item
            string jsonResponse = await _aiService.GetStructuredRequest(request.Question, menuJson);

            // 4. Clean up the response (sometimes AI adds ```json ... ``` wrappers)
            jsonResponse = jsonResponse.Replace("```json", "").Replace("```", "").Trim();

            try
            {
                // 5. Convert JSON string back to C# Object
                var decision = System.Text.Json.JsonSerializer.Deserialize<AIRequestResultDTO>(jsonResponse);

                // 6. Return the structured decision!
                return Ok(new { success = true, data = decision });
            }
            catch
            {
                return BadRequest(new { success = false, message = "AI failed to format JSON", raw = jsonResponse });
            }
        }
    }


    // A simple container for the question
    public class ChatRequest
    {
        public string? Question { get; set; }
    }
}

