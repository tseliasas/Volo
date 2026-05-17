using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

namespace VoloBackend.Services;

public class TripOptimizerService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _serpApiKey;
    private readonly string _groqApiKey;
    private readonly string _scraperApiKey;

    public TripOptimizerService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _apiKey = config["TravelApis:GeminiApiKey"] ?? string.Empty;
        _serpApiKey = config["TravelApis:SerpApiKey"] ?? string.Empty;
        _groqApiKey = config["TravelApis:GroqApiKey"] ?? string.Empty;
        _scraperApiKey = config["TravelApis:ScraperApiKey"] ?? string.Empty;
    }

    public async Task<List<object>> CalculateBestRoutes(OptimizationRequest request)
    {
        int nights = Math.Max(1, (int)(DateTime.Parse(request.EndDate) - DateTime.Parse(request.StartDate)).TotalDays);
        int days = nights + 1;
        
        decimal dailyBudget = request.TotalBudget / nights;
        string budgetVibe = dailyBudget > 8000m 
            ? "Focus ONLY on ultra-luxury 5-star resorts and fine dining." 
            : dailyBudget > 3500m ? "Include mid-range affordability cities." : "Focus ONLY on extremely cheap destinations.";

        // 1. THE GEOGRAPHY ENFORCER: We strictly ban whole countries!
        // 1. THE GEOGRAPHY ENFORCER (Reduced to 15 cities to prevent JSON cut-offs!)
        string discoveryPrompt = $"Suggest 15 specific CITIES or TOWNS that STRICTLY match this user intent: '{request.UserIntent}'. " +
                                 $"CRITICAL GEOGRAPHY: You MUST ONLY suggest cities located in the exact region requested. If they ask for North Africa, ONLY suggest cities in Morocco, Egypt, Tunisia, Algeria, etc. " +
                                 $"The target budget is {request.TotalBudget} TRY. {budgetVibe} " +
                                 $"Prices MUST be in 2024 Turkish Lira. Use large, raw integers ONLY. NO decimals. DO NOT explain your choices. " +
                                 $"Return ONLY a flat JSON array EXACTLY matching this format: [\"City, Country | IATA | NightlyHotel | DailyFood | RoundtripFlight\"]. No markdown.";
        
        string locationsJson = await CallPrimaryAI(discoveryPrompt, true);
        
        // Let's print the raw AI output to your terminal so you can see if it's breaking!
        Console.WriteLine($"[RAW AI OUTPUT]: {locationsJson}");

        int startIdx = locationsJson.IndexOf('[');
        int endIdx = locationsJson.LastIndexOf(']');
        if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
            locationsJson = locationsJson.Substring(startIdx, endIdx - startIdx + 1);
        }

        string cleanJson = locationsJson.Replace("```json", "").Replace("```", "").Replace("\n", "").Trim();
        
        List<string> locations;
        try 
        {
            locations = JsonSerializer.Deserialize<List<string>>(cleanJson) ?? new List<string>();
            if (locations.Count == 0) throw new Exception("AI returned an empty array.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CRITICAL AI CRASH]: JSON Parsing Failed! Error: {ex.Message}");
            // Your fallback is still Europe, but hopefully, with 15 cities, we never hit this again!
            locations = new List<string> { 
                "Nice, France | NCE | 8000 | 3000 | 15000", 
                "Santorini, Greece | JTR | 7500 | 2500 | 12000", 
                "Barcelona, Spain | BCN | 5000 | 2000 | 10000",
                "Rome, Italy | FCO | 4500 | 1800 | 9000",
                "Dubrovnik, Croatia | DBV | 4000 | 1500 | 8000"
            };
        }

        // 2. THE DYNAMIC MATH FIREWALL
        // We dynamically calculate the absolute maximums based on the user's specific budget!
        // E.g., Hotel gets max 55% of the total budget, Flight gets max 40%, Food gets 25%
        decimal maxNightlyHotel = (request.TotalBudget * 0.55m) / nights;
        decimal maxDailyFood = (request.TotalBudget * 0.25m) / days;
        decimal maxFlight = (request.TotalBudget * 0.40m) / request.TravelPartySize;

        decimal ParsePrice(string input, decimal fallback) {
            string noDecimal = Regex.Replace(input.Trim(), @"[.,]\d{2}$", ""); 
            string clean = Regex.Replace(noDecimal, @"[^\d]", ""); 
            return decimal.TryParse(clean, out decimal result) && result > 200 ? result : fallback;
        }

        var uniqueLocations = locations.GroupBy(loc => loc.Split('|')[0].Trim().ToLower()).Select(g => g.First()).ToList();

        var results = uniqueLocations.Select(loc => {
            var parts = loc.Split('|');
            string name = parts[0].Trim();
            string iata = parts.Length > 1 ? parts[1].Trim() : "LHR";
            
            // If AI hallucinates, fallback to 80% of our max safe limits
            decimal rawHotel = parts.Length > 2 ? ParsePrice(parts[2], maxNightlyHotel * 0.8m) : maxNightlyHotel * 0.8m;
            decimal rawFood = parts.Length > 3 ? ParsePrice(parts[3], maxDailyFood * 0.8m) : maxDailyFood * 0.8m;
            decimal rawFlight = parts.Length > 4 ? ParsePrice(parts[4], maxFlight * 0.8m) : maxFlight * 0.8m;

            // THE GENIUS CLAMPS: The AI's numbers can NEVER exceed the user's math limits!
            rawHotel = Math.Clamp(rawHotel, 500m, maxNightlyHotel);
            rawFood = Math.Clamp(rawFood, 400m, maxDailyFood);
            rawFlight = Math.Clamp(rawFlight, 1500m, maxFlight);

            int hash = Math.Abs(name.GetHashCode());
            decimal hotel = rawHotel + (hash % 600) - 300;    
            decimal food = rawFood + (hash % 400) - 200;      
            decimal flight = rawFlight + (hash % 2000) - 1000; 

            hotel = Math.Max(500m, hotel);
            food = Math.Max(400m, food);
            flight = Math.Max(1500m, flight);

            decimal totalFlightCost = flight * request.TravelPartySize;
            decimal totalHotelCost = hotel * nights;
            decimal totalFoodCost = food * days;

            decimal total = totalFlightCost + totalHotelCost + totalFoodCost;
            decimal match = Math.Round((total / request.TotalBudget) * 100);

            return new { name, total, match, parts, breakdown = new { transport = totalFlightCost, accommodation = totalHotelCost, dailyAllowance = totalFoodCost } };
        }).ToList();

        // 3. THE STRICT FILTER
        var perfectMatches = results.Where(r => r.match >= 85 && r.match <= 115).OrderBy(r => Math.Abs(r.match - 100)).Take(5).ToList();

        if (perfectMatches.Count < 5) {
            var currentNames = perfectMatches.Select(p => p.name).ToHashSet();
            var needed = 5 - perfectMatches.Count;
            var extras = results.Where(r => !currentNames.Contains(r.name)).OrderBy(r => Math.Abs(r.match - 100)).Take(needed);
            perfectMatches.AddRange(extras);
        }

        // 4. THE INSIGHTS
        var final = perfectMatches.Select(async p => {
            string insight = await CallFallbackAI($"Write exactly 12 words explaining why {p.name} is a great destination for {request.UserIntent}. No quotes, no brackets.");
            return (object)new { destination = p.name, totalCost = p.total, match = p.match, aiInsight = insight.Replace("\"", "").Replace("[", "").Replace("]", "").Replace("\\n", "").Trim(), breakdown = p.breakdown, days = nights };
        });

        return (await Task.WhenAll(final)).ToList();
    }

    public async Task<string> GenerateDetailedItinerary(string city, string country, string budget, string currency, int days)
    {
        if (days < 1) days = 3; 
        string prompt = $"You are an expert travel planner. Create a highly realistic {days}-day itinerary for {city}, {country}. Flights and hotels are already paid for. You have exactly 1000 {currency} per day to spend on food, transport, and activities. Return ONLY a valid JSON array of EXACTLY {days} objects. Each object MUST have these keys: 'day' (integer, starting at 1), 'title' (string), 'description' (string, a brief engaging paragraph), and 'cost' (string, e.g. '1000 {currency}'). Do NOT include markdown formatting.";

        try 
        {
            string response = await CallPrimaryAI(prompt, false);
            
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

    // --- THE NEW AI HIERARCHY ---

    private async Task<string> CallPrimaryAI(string prompt, bool isDiscoveryArray)
    {
        string systemMsg = isDiscoveryArray 
            ? "You are a rigid data API. You MUST output a FLAT JSON array of strings. NEVER output JSON objects. NEVER output markdown or conversational text. YOUR ONLY OUTPUT MUST MATCH THIS EXACT FORMAT: [\"String 1\", \"String 2\"]"
            : "You are a rigid data API. You MUST output a JSON array of objects. NEVER output markdown or conversational text.";

        string url = "https://api.groq.com/openai/v1/chat/completions";
        var payload = new {
            model = "llama-3.1-8b-instant", 
            messages = new[] { 
                new { role = "system", content = systemMsg },
                new { role = "user", content = prompt } 
            },
            temperature = 0.1 
        };

        try
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groqApiKey}");
            var response = await client.PostAsJsonAsync(url, payload);
            response.EnsureSuccessStatusCode();
            
            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "[]";
        }
        catch (Exception ex)
        { 
            Console.WriteLine($"[GROQ PRIMARY FAILED]: {ex.Message} -> Deploying Gemini Parachute...");
            return await CallFallbackAI(prompt); 
        }
    }

    private async Task<string> CallFallbackAI(string prompt)
    {
        string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={_apiKey}";
        var payload = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };

        try 
        {
            var response = await _httpClient.PostAsJsonAsync(url, payload);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString() ?? "[]";
        }
        catch (Exception ex)
        { 
            Console.WriteLine($"[GEMINI FALLBACK FAILED]: {ex.Message}");
            return "[]"; 
        }
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