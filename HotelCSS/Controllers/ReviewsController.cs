using CSSHotel.DataAccess.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System.Text.Json; // 👈 Required to parse the TripAdvisor JSON
using CSSHotel.Models; // 👈 Adjust this if your models are in a different namespace

namespace HotelCSS.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;
        private readonly IConfiguration _config;

        public ReviewsController(IHttpClientFactory httpClientFactory, IMemoryCache cache, IConfiguration config, IUnitOfWork unitOfWork)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _config = config;
            _unitOfWork = unitOfWork;
        }

        [HttpGet("tripadvisor")]
        public async Task<IActionResult> GetTripAdvisorReviews()
        {
            // 1. Only call the TripAdvisor API if the 6-hour cooldown has expired
            if (!_cache.TryGetValue("TripAdvisorCooldown", out bool isOnCooldown))
            {
                await SyncReviewsFromApi();
                // Set a 6-hour cooldown flag so we don't spam the API
                _cache.Set("TripAdvisorCooldown", true, TimeSpan.FromHours(6));
            }

            // 2. ALWAYS return the data directly from your SQL Database via UnitOfWork
            // Note: If your UnitOfWork property is plural, change GuestReview to GuestReviews
            var allSavedReviews = _unitOfWork.GuestReview.GetAll()
                                        .OrderByDescending(r => r.PublishedDate)
                                        .ToList();

            // We wrap it in a "data" object so your React frontend doesn't break!
            return Ok(new { data = allSavedReviews });
        }

        private async Task SyncReviewsFromApi()
        {
            var apiKey = _config["TripAdvisor:ApiKey"];
            var locationId = _config["TripAdvisor:LocationId"];

            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(locationId)) return;

            var client = _httpClientFactory.CreateClient();

            string[] targetLanguages = { "tr", "en", "ru", "de" };

            try
            {
                foreach (var lang in targetLanguages)
                {
                    string url = $"https://api.content.tripadvisor.com/api/v1/location/{locationId}/reviews?key={apiKey}&language={lang}";
                    var response = await client.GetAsync(url);

                    if (response.IsSuccessStatusCode)
                    {
                        var jsonResult = await response.Content.ReadAsStringAsync();
                        using JsonDocument doc = JsonDocument.Parse(jsonResult);
                        var dataArray = doc.RootElement.GetProperty("data");

                        foreach (var reviewObj in dataArray.EnumerateArray())
                        {
                            string taId = reviewObj.GetProperty("id").ToString();

                            var existingReview = _unitOfWork.GuestReview.GetFirstOrDefault(r => r.TripAdvisorId == taId);

                            if (existingReview == null)
                            {
                                var newReview = new GuestReview
                                {
                                    TripAdvisorId = taId,
                                    Title = reviewObj.GetProperty("title").GetString() ?? "No Title",
                                    Text = reviewObj.GetProperty("text").GetString() ?? "",
                                    Rating = reviewObj.GetProperty("rating").GetInt32(),
                                    Author = reviewObj.GetProperty("user").GetProperty("username").GetString() ?? "Verified Guest",
                                    PublishedDate = DateTime.Parse(reviewObj.GetProperty("published_date").GetString() ?? DateTime.UtcNow.ToString()),
                                    FetchedAt = DateTime.UtcNow
                                };

                                _unitOfWork.GuestReview.Add(newReview);
                            }
                        }
                    }
                } 
                _unitOfWork.Save();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error syncing with TripAdvisor: {ex.Message}");
            }
        }
    }
}