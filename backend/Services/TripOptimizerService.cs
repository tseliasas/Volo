using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace VoloBackend.Services;

public class TripOptimizerService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _serpApiKey;
    private readonly string _groqApiKey;

    public TripOptimizerService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _apiKey = config["TravelApis:GeminiApiKey"] ?? string.Empty;
        _serpApiKey = config["TravelApis:SerpApiKey"] ?? string.Empty;
        _groqApiKey = config["TravelApis:GroqApiKey"] ?? string.Empty;
    }

    public async Task<List<object>> CalculateBestRoutes(OptimizationRequest request)
    {
        string discoveryPrompt = $"Suggest 8 highly diverse travel destinations (City, Country) for '{request.UserIntent}' from {request.StartDate} to {request.EndDate}. Include a mix of very cheap, moderate, and highly expensive cities to guarantee budget variety. The target budget is {request.TotalBudget} TRY. Return ONLY a JSON array of strings formatted exactly like this: [\"City, Country | IATA | EstimatedNightlyHotelCostTRY | EstimatedDailyFoodCostTRY\"]. Example: [\"Paris, France | CDG | 4500 | 2000\"]. No markdown.";
        
        string locationsJson = await CallGemini(discoveryPrompt);
        
        // --- THE BRUTE FORCE EXTRACTOR ---
        int startIdx = locationsJson.IndexOf('[');
        int endIdx = locationsJson.LastIndexOf(']');
        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx)
        {
            locationsJson = locationsJson.Substring(startIdx, endIdx - startIdx + 1);
        }

        string cleanJson = locationsJson.Replace("```json", "").Replace("```", "").Trim();
        
        List<string> locations;
        try 
        {
            locations = JsonSerializer.Deserialize<List<string>>(cleanJson) ?? new List<string>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CRITICAL: JSON DESERIALIZATION FAILED]: {ex.Message}");
            locations = new List<string> { "Antalya, Turkey | AYT | 1000 | 800", "Bursa, Turkey | YEI | 800 | 600", "Fethiye, Turkey | DLM | 1200 | 900" };
        }

        int numberOfNights = 1; 
        if (DateTime.TryParse(request.StartDate, out DateTime start) && DateTime.TryParse(request.EndDate, out DateTime end))
        {
            numberOfNights = Math.Max(1, (int)(end - start).TotalDays);
        }
        int totalDays = numberOfNights + 1; 

        var optimizationTasks = locations.Select(async loc => 
        {
            var parts = loc.Split('|');
            string uiLocation = parts[0].Trim(); 
            string destAirportCode = parts.Length > 1 ? parts[1].Trim() : "LHR";
            
            decimal dynamicNightlyHotel = parts.Length > 2 && decimal.TryParse(parts[2].Trim(), out decimal h) ? h : 1200m;
            decimal dynamicDailyFood = parts.Length > 3 && decimal.TryParse(parts[3].Trim(), out decimal f) ? f : 1000m;

            string googleStartDate = DateTime.Parse(request.StartDate).ToString("yyyy-MM-dd");
            string googleEndDate = DateTime.Parse(request.EndDate).ToString("yyyy-MM-dd");
            
            decimal liveFlightPrice = await FetchLiveFlightPrice(request.Origin, destAirportCode, googleStartDate, googleEndDate);
            
            decimal totalTransport = Math.Round(liveFlightPrice * request.TravelPartySize);
            decimal totalHotel = Math.Round(dynamicNightlyHotel * numberOfNights);
            decimal totalAllowance = Math.Round(dynamicDailyFood * totalDays); 
            
            decimal totalCost = totalTransport + totalHotel + totalAllowance;
            decimal matchPercentage = Math.Round((totalCost / request.TotalBudget) * 100);

            return new {
                destination = uiLocation,
                totalCost = totalCost,
                match = matchPercentage,
                breakdown = new { 
                    transport = totalTransport, 
                    accommodation = totalHotel, 
                    dailyAllowance = totalAllowance 
                }
            };
        });

        var allScrapedCities = await Task.WhenAll(optimizationTasks);

        // Filter: 60% - 115% for better variety
        var perfectMatches = allScrapedCities
            .Where(city => city.match >= 60 && city.match <= 115)
            .OrderByDescending(city => city.match)
            .Take(5)
            .ToList();

        if (perfectMatches.Count < 5)
        {
            perfectMatches = allScrapedCities.OrderBy(city => city.totalCost).Take(5).ToList();
        }

        var finalTasks = perfectMatches.Select(async city => 
        {
            string insightPrompt = $"In exactly 15 words, why is {city.destination} good for '{request.UserIntent}' on {city.totalCost} TRY budget?";
            string aiInsight = await CallGemini(insightPrompt);

            return (object)new {
                destination = city.destination,
                totalCost = city.totalCost,
                aiInsight = aiInsight.Replace("\"", ""),
                breakdown = city.breakdown,
                match = city.match
            };
        });

        return (await Task.WhenAll(finalTasks)).ToList();
    }

    public async Task<string> GenerateDetailedItinerary(string city, string country, string budget, string currency, int days)
    {
        if (days < 1) days = 3; 

        string prompt = $"You are an expert travel planner. Create a highly realistic {days}-day itinerary for {city}, {country}. Flights and hotels are already paid for. You have exactly 1000 {currency} per day to spend on food, transport, and activities. Return ONLY a valid JSON array of EXACTLY {days} objects. Each object MUST have these keys: 'day' (integer, starting at 1), 'title' (string), 'description' (string, a brief engaging paragraph), and 'cost' (string, e.g. '1000 {currency}'). Do NOT include markdown formatting.";

        try 
        {
            // We use CallGemini here because it already has the built-in Groq fallback!
            string response = await CallGemini(prompt);
            
            // Brute force extract JSON array just in case the AI adds chatter
            int startIdx = response.IndexOf('[');
            int endIdx = response.LastIndexOf(']');
            if (startIdx != -1 && endIdx != -1 && endIdx > startIdx)
            {
                response = response.Substring(startIdx, endIdx - startIdx + 1);
            }

            return response.Replace("```json", "").Replace("```", "").Trim();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Itinerary Error]: {ex.Message}");
            return "[{\"day\": 1, \"title\": \"AI Sync Error\", \"description\": \"The AI agents are currently calculating heavy loads.\", \"cost\": \"0\"}]";
        }
    }

    private async Task<decimal> FetchLiveFlightPrice(string originCode, string destCode, string outboundDate, string returnDate)
    {
        string url = $"https://serpapi.com/search.json?engine=google_flights&departure_id={originCode}&arrival_id={destCode}&outbound_date={outboundDate}&return_date={returnDate}&currency=TRY&hl=en&api_key={_serpApiKey}";

        try
        {
            using var client = new HttpClient();
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return 4500m;

            var jsonString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(jsonString);
            
            if (doc.RootElement.TryGetProperty("best_flights", out JsonElement best) && best.GetArrayLength() > 0)
                return (decimal)best[0].GetProperty("price").GetInt32();
            
            return 4500m;
        }
        catch { return 4500m; }
    }

    private async Task<string> CallGemini(string prompt)
    {
        string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={_apiKey}";
        var payload = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };

        try 
        {
            var response = await _httpClient.PostAsJsonAsync(url, payload);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString() ?? "";
        }
        catch (HttpRequestException)
        {
            return await CallBackupApi(prompt); 
        }
        catch { return "AI Error"; }
    }

    private async Task<string> CallBackupApi(string prompt)
    {
        string url = "https://api.groq.com/openai/v1/chat/completions";
        var payload = new {
            model = "llama-3.1-8b-instant", 
            messages = new[] { 
                new { role = "system", content = "JSON API mode. ONLY array output." },
                new { role = "user", content = prompt } 
            },
            temperature = 0.2
        };

        try
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groqApiKey}");
            var response = await client.PostAsJsonAsync(url, payload);
            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "[]";
        }
        catch { return "[]"; }
    }
}

public class OptimizationRequest
{
    public decimal TotalBudget { get; set; }
    public int TravelPartySize { get; set; }
    public string Origin { get; set; } = string.Empty;
    public bool HasSchengenVisa { get; set; }
    public string UserIntent { get; set; } = string.Empty;
    public string StartDate { get; set; } = string.Empty;
    public string EndDate { get; set; } = string.Empty;
}