using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace VoloBackend.Services;

public class TripOptimizerService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public TripOptimizerService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        // Looking for your specific JSON structure
        _apiKey = config["TravelApis:GeminiApiKey"] ?? string.Empty;
    }

    public async Task<List<object>> CalculateBestRoutes(OptimizationRequest request)
    {
        string discoveryPrompt = "Suggest 5 specific travel destinations (City, Country) for a user interested in '" + request.UserIntent + "' with a budget of " + request.TotalBudget + " TRY for " + request.TravelPartySize + " people. Return ONLY a raw JSON array of strings like [\"City, Country\", \"City, Country\"]";

        string locationsJson = await CallGemini(discoveryPrompt);
        string cleanJson = locationsJson.Replace("```json", "").Replace("```", "").Trim();
        
        List<string> locations;
        try 
        {
            locations = JsonSerializer.Deserialize<List<string>>(cleanJson) ?? new List<string>();
        }
        catch 
        {
            locations = new List<string> { "Antalya, Turkey", "Bursa, Turkey", "Fethiye, Turkey" };
        }

        var results = new List<object>();

        foreach (var loc in locations.Take(5))
        {
            var prices = GenerateFallbackPrices(loc);
            decimal totalTransport = Math.Round(prices.Flight * request.TravelPartySize);
            decimal totalHotel = Math.Round(prices.Hotel * 2);
            decimal totalCost = totalTransport + totalHotel + 1000;

            string insightPrompt = "In 15 words, why is " + loc + " a great match for '" + request.UserIntent + "' on a budget of " + totalCost + " TRY? Be a helpful travel expert.";
            
            string aiInsight = await CallGemini(insightPrompt);

            results.Add(new {
                destination = loc,
                totalCost = totalCost,
                aiInsight = aiInsight.Replace("\"", ""),
                breakdown = new { 
                    transport = totalTransport, 
                    accommodation = totalHotel, 
                    dailyAllowance = 1000 
                }
            });
        }

        return results;
    }

    private async Task<string> CallGemini(string prompt)
    {
        if (string.IsNullOrEmpty(_apiKey)) return "Missing API Key";

        // Make sure there is ONLY ONE 'string url' declared here!
        string url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" + _apiKey;
        
        var payload = new {
            contents = new[] { new { parts = new[] { new { text = prompt } } } }
        };

        try 
        {
            var response = await _httpClient.PostAsJsonAsync(url, payload);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            
            return doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AI ERROR]: {ex.Message}");
            return "AI Error";
        }
    }

    private (decimal Flight, decimal Hotel) GenerateFallbackPrices(string dest)
    {
        var rnd = new Random(dest.GetHashCode());
        return (rnd.Next(1500, 3800), rnd.Next(900, 2500));
    }
}

public class OptimizationRequest
{
    public decimal TotalBudget { get; set; }
    public int TravelPartySize { get; set; }
    public string Origin { get; set; } = string.Empty;
    public bool HasSchengenVisa { get; set; }
    public string UserIntent { get; set; } = string.Empty;
}