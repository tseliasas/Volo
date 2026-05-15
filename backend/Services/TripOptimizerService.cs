using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
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
        // 1. INCREASE SAMPLE SIZE & PROMPT PRESSURE
        string discoveryPrompt = $"Suggest 15 travel destinations for '{request.UserIntent}' from {request.StartDate} to {request.EndDate}. " +
                                 $"The total target budget is EXACTLY {request.TotalBudget} TRY. Include many high-end, expensive cities " +
                                 $"and mid-range cities. Return ONLY a JSON array: [\"City, Country | IATA | NightlyHotelTRY | DailyFoodTRY\"]. No markdown.";
        
        string locationsJson = await CallGemini(discoveryPrompt);
        
        // 2. BRUTE FORCE EXTRACTOR
        int startIdx = locationsJson.IndexOf('[');
        int endIdx = locationsJson.LastIndexOf(']');
        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx)
        {
            locationsJson = locationsJson.Substring(startIdx, endIdx - startIdx + 1);
        }

        string cleanJson = locationsJson.Replace("```json", "").Replace("```", "").Trim();
        
        // 3. THE "SILENT CRASH" SAFETY NET
        List<string> locations;
        try 
        {
            locations = JsonSerializer.Deserialize<List<string>>(cleanJson) ?? new List<string>();
            
            // If the AI returned an empty array "[]", manually trigger the catch block!
            if (locations.Count == 0)
            {
                throw new Exception("AI returned 0 cities.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CRITICAL: AI FAILED TO GENERATE CITIES]: {ex.Message}");
            locations = new List<string> { 
                "Antalya, Turkey | AYT | 1500 | 1000", 
                "Bursa, Turkey | YEI | 1200 | 800", 
                "Fethiye, Turkey | DLM | 1800 | 1200",
                "Istanbul, Turkey | IST | 2500 | 1500",
                "Izmir, Turkey | ADB | 1400 | 900"
            };
        }

        int nights = Math.Max(1, (int)(DateTime.Parse(request.EndDate) - DateTime.Parse(request.StartDate)).TotalDays);

        // 4. SCRAPE EVERYTHING IN PARALLEL
        var tasks = locations.Select(async loc => {
            var parts = loc.Split('|');
            string name = parts[0].Trim();
            string iata = parts.Length > 1 ? parts[1].Trim() : "LHR";
            decimal hotel = parts.Length > 2 && decimal.TryParse(parts[2].Trim(), out decimal h) ? h : 1200m;
            decimal food = parts.Length > 3 && decimal.TryParse(parts[3].Trim(), out decimal f) ? f : 1000m;

            decimal flight = await FetchLiveFlightPrice(request.Origin, iata, 
                DateTime.Parse(request.StartDate).ToString("yyyy-MM-dd"), 
                DateTime.Parse(request.EndDate).ToString("yyyy-MM-dd"));

            decimal total = (flight * request.TravelPartySize) + (hotel * nights) + (food * (nights + 1));
            decimal match = Math.Round((total / request.TotalBudget) * 100);

            return new { name, total, match, parts, breakdown = new { transport = flight * request.TravelPartySize, accommodation = hotel * nights, dailyAllowance = food * (nights + 1) } };
        });

        var results = await Task.WhenAll(tasks);

        // 5. APPLY THE STRICT 85-115% FILTER
        var perfectMatches = results
            .Where(r => r.match >= 85 && r.match <= 115) 
            .OrderBy(r => Math.Abs(r.match - 100)) // Closest to 100% first
            .Take(5)
            .ToList();

        // FALLBACK: If the filter found nothing, take the closest 5 cities regardless
        if (perfectMatches.Count < 5) {
            perfectMatches = results.OrderBy(r => Math.Abs(r.match - 100)).Take(5).ToList();
        }

        // 6. GENERATE INSIGHTS FOR THE WINNERS
        var final = perfectMatches.Select(async p => {
            string insight = await CallGemini($"15 words: Why {p.name} for {request.UserIntent}?");
            return (object)new {
                destination = p.name,
                totalCost = p.total,
                match = p.match,
                aiInsight = insight.Replace("\"", ""),
                breakdown = p.breakdown
            };
        });

        return (await Task.WhenAll(final)).ToList();
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

    public async Task<string> GenerateDetailedItinerary(string city, string country, string budget, string currency, int days)
    {
        if (days < 1) days = 3; 
        string prompt = $"You are an expert travel planner. Create a highly realistic {days}-day itinerary for {city}, {country}. Flights and hotels are already paid for. You have exactly 1000 {currency} per day to spend on food, transport, and activities. Return ONLY a valid JSON array of EXACTLY {days} objects. Each object MUST have these keys: 'day' (integer, starting at 1), 'title' (string), 'description' (string, a brief engaging paragraph), and 'cost' (string, e.g. '1000 {currency}'). Do NOT include markdown formatting.";

        try 
        {
            string response = await CallGemini(prompt);
            
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
        catch (HttpRequestException ex)
        {
            Console.WriteLine($"[GEMINI RATE LIMITED]: {ex.Message} -> Redirecting to Backup AI...");
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
                // The ultimate strict system prompt
                new { role = "system", content = "You are a rigid data API. You MUST output a FLAT JSON array of strings. NEVER output JSON objects. NEVER output markdown or conversational text. YOUR ONLY OUTPUT MUST MATCH THIS EXACT FORMAT: [\"String 1\", \"String 2\"]" },
                new { role = "user", content = prompt } 
            },
            temperature = 0.1 // Lowered to 0.1 to make it hyper-robotic and predictable
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