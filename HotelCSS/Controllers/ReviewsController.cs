using CSSHotel.DataAccess.Repository.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<ReviewsController> _logger;

        public ReviewsController(IHttpClientFactory httpClientFactory, IMemoryCache cache, IConfiguration config, IUnitOfWork unitOfWork, ILogger<ReviewsController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _config = config;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        // forceRefresh=true bypasses the 6-hour cooldown so a brand-new review can be
        // pulled on demand (useful for testing or a manual "Refresh" button).
        [HttpGet("tripadvisor")]
        public async Task<IActionResult> GetTripAdvisorReviews([FromQuery] bool forceRefresh = false)
        {
            // 1. Call TripAdvisor when forced, or when the 6-hour cooldown has expired.
            if (forceRefresh || !_cache.TryGetValue("TripAdvisorCooldown", out _))
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

            if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(locationId))
            {
                _logger.LogWarning("TripAdvisor sync skipped: ApiKey or LocationId is not configured.");
                return;
            }

            var client = _httpClientFactory.CreateClient();

            // The Content API returns at most 5 (most-recent) reviews per language, so we
            // request several languages to widen coverage across guest nationalities.
            // Only codes TripAdvisor actually supports (pl/uk/fi are rejected with 400).
            // tr/en/ru/de/nl + Scandinavian (sv/no/da).
            string[] targetLanguages = { "tr", "en", "ru", "de", "nl", "sv", "no", "da" };
            int addedCount = 0;

            try
            {
                foreach (var lang in targetLanguages)
                {
                    string url = $"https://api.content.tripadvisor.com/api/v1/location/{locationId}/reviews?key={apiKey}&language={lang}";
                    var response = await client.GetAsync(url);
                    var body = await response.Content.ReadAsStringAsync();

                    // Surface API failures instead of silently swallowing them: without this
                    // a bad key / quota / wrong location just looks like "no new reviews".
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogWarning("TripAdvisor [{Lang}] returned {Status}: {Body}", lang, (int)response.StatusCode, body);
                        continue;
                    }

                    using JsonDocument doc = JsonDocument.Parse(body);
                    if (!doc.RootElement.TryGetProperty("data", out var dataArray))
                    {
                        _logger.LogWarning("TripAdvisor [{Lang}] response had no 'data' array: {Body}", lang, body);
                        continue;
                    }

                    int returnedCount = dataArray.GetArrayLength();

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
                            addedCount++;
                        }
                    }

                    _logger.LogInformation("TripAdvisor [{Lang}]: API returned {Returned} review(s).", lang, returnedCount);
                }
                _unitOfWork.Save();
                _logger.LogInformation("TripAdvisor sync complete: {Added} new review(s) saved.", addedCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing with TripAdvisor.");
            }
        }
    }
}