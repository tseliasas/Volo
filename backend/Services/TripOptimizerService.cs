using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;
using System.Text.Json.Serialization;
using System.Globalization;

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
        int nights = 3; 
        var siteLanguage = GetSiteLanguage(request.Language);
        
        if (!string.IsNullOrEmpty(request.StartDate) && !string.IsNullOrEmpty(request.EndDate))
        {
            if (DateTime.TryParse(request.StartDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime start) &&
                DateTime.TryParse(request.EndDate, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime end))
            {
                nights = Math.Max(1, (int)(end - start).TotalDays);
            }
        }
        
        int days = nights + 1;
        
        Console.WriteLine($"\n🚨 [C# RECEIVED] Start: '{request.StartDate}' | End: '{request.EndDate}' | C# Calculated Nights: {nights}\n");

        decimal dailyBudget = request.TotalBudget / nights;
        
        // THE MACROECONOMIC CITY FILTER
        string budgetVibe = siteLanguage == "English"
            ? dailyBudget > 8000m 
                ? "BUDGET RULE: The user has a massive luxury budget. You MUST ONLY suggest inherently expensive, exclusive, high-wealth destinations (e.g., Monaco, Zurich, Dubai, Maldives, St. Barts). DO NOT suggest traditionally cheap countries." 
                : dailyBudget > 3500m 
                    ? "BUDGET RULE: The user has a standard mid-range budget. Suggest normal, balanced international cities." 
                    : "BUDGET RULE: The user is on a strict backpacker budget. You MUST ONLY suggest inherently cheap destinations with a highly affordable cost of living (e.g., Vietnam, Bolivia, Laos, Eastern Europe). DO NOT suggest expensive Western cities."
            : dailyBudget > 8000m 
                ? "BÜTÇE KURALI: Kullanıcının çok yüksek bir lüks bütçesi var. SADECE doğası gereği pahalı, seçkin ve lüks destinasyonlar önerin (Örn: Monako, Zürih, Dubai, Maldivler). Asla ucuz ülkeleri önermeyin." 
                : dailyBudget > 3500m 
                    ? "BÜTÇE KURALI: Kullanıcının orta sınıf bir bütçesi var. Standart, dengeli uluslararası şehirler önerin." 
                    : "BÜTÇE KURALI: Kullanıcı çok kısıtlı bir sırt çantalı gezgin bütçesine sahip. SADECE yaşam maliyetinin çok düşük olduğu, doğası gereği ucuz yerleri önerin (Örn: Vietnam, Bolivya, Laos, Doğu Avrupa). Asla pahalı Batı şehirlerini önermeyin.";

        string discoveryPrompt = siteLanguage == "English" 
            ? $"You are a master travel agent. Suggest 15 UNIQUE CITIES that STRICTLY match this user intent: '{request.UserIntent}'.\n" +
              $"RULE 0 - TRANSLATION: The user intent might be written in Turkish or another language. You MUST translate it to English internally to understand the true region requested (e.g., 'asya sahilleri' means Asian beaches) before applying the geography rules.\n" +
              $"RULE 1 - GEOGRAPHY: If the user requests a specific region or country, you MUST ONLY suggest cities in that exact region. DO NOT suggest global cities if a specific region is requested.\n" +
              $"RULE 2 - DIVERSITY: If NO region is specified, you MUST provide a diverse GLOBAL mix (e.g., Thailand, Spain, Mexico, Egypt). Do not just list cities from one country.\n" +
              $"RULE 3 - FEATURES: If they want 'beaches', the city MUST natively have a beach. No inland transit hubs.\n" +
              $"The target budget is {request.TotalBudget} TRY. {budgetVibe}\n" +
              $"Prices MUST be in 2026 Turkish Lira. Use large, raw integers ONLY. NO decimals.\n" +
              $"Return ONLY a flat JSON array EXACTLY matching this format: [\"City, Full Country Name | IATA | NightlyHotel | DailyFood | RoundtripFlight\"]. You MUST write the City and Country names in English. DO NOT use 2-letter country codes. No markdown."
            : $"Siz uzman bir seyahat asistanısınız. Kullanıcının şu isteğine KESİNLİKLE uyan 15 FARKLI ŞEHİR önerin: '{request.UserIntent}'.\n" +
              $"KURAL 0 - ÇEVİRİ: Kullanıcı niyeti İngilizce veya başka bir dilde yazılmış olabilir. Bölgeyi ve isteği doğru anlamak için önce kendi içinizde Türkçe'ye çevirin.\n" +
              $"KURAL 1 - COĞRAFYA: Kullanıcı belirli bir bölge (Örn: 'Latin ülkeleri' Güney/Orta Amerika demektir) veya ülke istiyorsa, SADECE o bölgeden şehirler önerin. Bölge belirtildiyse dünyanın geri kalanından şehir ÖNERMEYİN.\n" +
              $"KURAL 2 - ÇEŞİTLİLİK: Eğer belirli bir bölge İSTENMEDİYSE, SADECE Türkiye'den şehirler ÖNERMEYİN. Tüm DÜNYADAN (Örn: Tayland, İspanya, Meksika, Mısır) çeşitli bir karma sunmanız ZORUNLUDUR.\n" +
              $"KURAL 3 - ÖZELLİK: 'Sahil', 'Kumsal' isteniyorsa, şehrin KENDİSİNDE deniz olmalıdır.\n" +
              $"Hedef bütçe {request.TotalBudget} TL'dir. {budgetVibe}\n" +
              $"Fiyatlar MUTLAKA 2026 Türk Lirası cinsinden olmalıdır. Sadece büyük, tam sayılar kullanın. Ondalık sayı KULLANMAYIN.\n" +
              $"Yalnızca şu formata tam olarak uyan düz bir JSON dizisi döndürün: [\"Şehir, Tam Ülke Adı | IATA | GecelikOtel | GünlükYemek | Gidiş-DönüşUçuş\"]. Ülke isimlerini KISALTMAYIN. Tam Türkçe isimlerini yazın. Markdown yok.";

        string locationsJson = "";

        // ==============================================================
        // THE MULTI-CLOUD WATERFALL (GEMINI -> GROQ -> HARDCODED)
        // ==============================================================

        // --- LAYER 1: GEMINI (The Primary Engine) ---
        try 
        {
            locationsJson = await CallFallbackAI(discoveryPrompt); 
            Console.WriteLine("[GEMINI SUCCESS]: Primary engine delivered the payload.");
        }
        catch (Exception exGemini)
        {
            Console.WriteLine($"[GEMINI RATE LIMIT / FAILED]: {exGemini.Message} -> Deploying Groq Parachute...");
            
            // --- LAYER 2: GROQ (The Backup Engine) ---
            try 
            {
                locationsJson = await CallPrimaryAI(discoveryPrompt, true); 
                Console.WriteLine("[GROQ SUCCESS]: Backup engine saved the request.");
            }
            catch (Exception exGroq)
            {
                // --- LAYER 3: THE HARDCODED EMERGENCY (Total API Failure) ---
                Console.WriteLine($"[CRITICAL MULTI-CLOUD FAILURE]: Both AIs are dead! Error: {exGroq.Message}");
                Console.WriteLine("Deploying hardcoded emergency list...");
                
                locationsJson = "[\"Bali, Endonezya | DPS | 2000 | 800 | 25000\", \"Phuket, Tayland | HKT | 1800 | 700 | 22000\", \"Maldivler, Maldivler | MLE | 5000 | 2000 | 35000\", \"Langkawi, Malezya | LGK | 1600 | 600 | 23000\", \"Da Nang, Vietnam | DAD | 1200 | 500 | 20000\"]";
            }
        }

        Console.WriteLine($"[RAW AI OUTPUT]: {locationsJson}");

        // --- THE BULLETPROOF JSON EXTRACTOR ---
        List<string> locations;
        try 
        {
            int startIdx = locationsJson.IndexOf('[');
            int endIdx = locationsJson.LastIndexOf(']');
            
            if (startIdx != -1 && endIdx != -1 && endIdx > startIdx) {
                locationsJson = locationsJson.Substring(startIdx, endIdx - startIdx + 1);
            }

            string cleanJson = locationsJson.Replace("\n", "").Replace("\r", "").Replace("```json", "").Replace("```", "").Trim();

            locations = JsonSerializer.Deserialize<List<string>>(cleanJson) ?? new List<string>();
            if (locations.Count == 0) throw new Exception("AI returned an empty array.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[CRITICAL AI CRASH]: JSON Parsing Failed! Error: {ex.Message}");
            locations = new List<string> { 
                "Nice, France | NCE | 8000 | 3000 | 15000", 
                "Santorini, Greece | JTR | 7500 | 2500 | 12000", 
                "Barcelona, Spain | BCN | 5000 | 2000 | 10000",
                "Rome, Italy | FCO | 4500 | 1800 | 9000",
                "Dubrovnik, Croatia | DBV | 4000 | 1500 | 8000"
            };
        }

        // ==============================================================
        // DYNAMIC MATH FIREWALL
        // ==============================================================
        decimal maxNightlyHotel = (request.TotalBudget * 0.45m) / nights;
        decimal maxDailyFood = (request.TotalBudget * 0.35m) / days;
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
            
            decimal rawHotel = parts.Length > 2 ? ParsePrice(parts[2], maxNightlyHotel * 0.8m) : maxNightlyHotel * 0.8m;
            decimal rawFood = parts.Length > 3 ? ParsePrice(parts[3], maxDailyFood * 0.8m) : maxDailyFood * 0.8m;
            decimal rawFlight = parts.Length > 4 ? ParsePrice(parts[4], maxFlight * 0.8m) : maxFlight * 0.8m;

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

        var perfectMatches = results.Where(r => r.match >= 85 && r.match <= 115).OrderBy(r => Math.Abs(r.match - 100)).Take(7).ToList();

        if (perfectMatches.Count < 7) {
            var currentNames = perfectMatches.Select(p => p.name).ToHashSet();
            var needed = 7 - perfectMatches.Count;
            var extras = results.Where(r => !currentNames.Contains(r.name)).OrderBy(r => Math.Abs(r.match - 100)).Take(needed);
            perfectMatches.AddRange(extras);
        }

        var finalResults = new List<object>();

        foreach (var p in perfectMatches)
        {
            string defaultInsight = siteLanguage == "Turkish"
                ? "Muhteşem mimari, zengin kültür ve unutulmaz yerel lezzetler."
                : "Experience stunning architecture, rich culture and unforgettable local cuisine today.";
            
            string insight = defaultInsight;
            
            try 
            {
                string insightPrompt = siteLanguage == "English"
                    ? $"Write exactly 12 words explaining why {p.name} is a great destination for {request.UserIntent}. Respond in {siteLanguage}. No quotes."
                    : $"{p.name}'in {request.UserIntent} için neden harika bir hedef olduğunu açıklayan tam 12 kelime yazın. Cevabınızı Türkçe dilinde verin. Tırnak işaretleri kullanmayın.";
                
                // Keep Groq for the insights since it handles the rapid loops incredibly well!
                var aiTask = CallPrimaryAI(insightPrompt, false, true);
                var timeoutTask = Task.Delay(5000); 
                
                var completedTask = await Task.WhenAny(aiTask, timeoutTask);
                
                if (completedTask == aiTask) {
                    string rawResult = await aiTask;
                    if (!string.IsNullOrWhiteSpace(rawResult) && rawResult != "[]") {
                        insight = rawResult;
                    }
                    Console.WriteLine($"[LANGUAGE]: {siteLanguage} - Insight generated for {p.name}");
                } else {
                    Console.WriteLine($"[KILL SWITCH ACTIVATED]: Groq took too long for {p.name}!");
                }
            } 
            catch { /* Ignore insight crashes and keep the fallback string */ }

            finalResults.Add(new { 
                destination = p.name, 
                totalCost = p.total, 
                match = p.match, 
                aiInsight = insight.Replace("\"", "").Replace("[", "").Replace("]", "").Replace("\n", "").Trim(), 
                breakdown = p.breakdown, 
                days = nights 
            });

            await Task.Delay(200); 
        }

        return finalResults;
    }

    public async Task<string> GenerateDetailedItinerary(string city, string country, string budget, string currency, int days, string language)
    {
        if (days < 1) days = 3; 

        var siteLanguage = GetSiteLanguage(language);
        
        string prompt = siteLanguage == "English" 
            ? $"You are an expert travel planner. Create a highly realistic {days}-day itinerary for {city}, {country}. Flights and hotels are already paid for. Respond ONLY in {siteLanguage}. For each day, include a 'costWeight' integer from 1 to 5. Assign a 1 for very cheap days (e.g., walking, parks, free museums) and a 5 for very expensive days (e.g., Broadway shows, fine dining, theme parks). Return ONLY a valid JSON array of EXACTLY {days} objects. Each object MUST have these exact keys: 'day' (integer, starting at 1), 'title' (string), 'description' (string, a brief engaging paragraph), and 'costWeight' (integer between 1 and 5). Do NOT include markdown formatting or extra text. "
            : $"Siz uzman bir seyahat planlayıcısınız. {city}, {country} için son derece gerçekçi {days} günlük bir seyahat planı oluşturun. Uçuşlar ve oteller zaten ödenmiştir. YALNIZCA Türkçe dilinde yanıt verin. Her gün için 1 ile 5 arasında bir 'maliyetAğırlığı' tamsayı değeri ekleyin. Çok ucuz günler için (örneğin, yürüyüş, parklar, ücretsiz müzeler) 1, çok pahalı günler için (örneğin, Broadway gösterileri, lüks restoranlar, tema parkları) 5 atayın. Yalnızca tam olarak {days} nesneden oluşan geçerli bir JSON dizisi döndürün. Her nesnenin şu anahtarlara sahip olması GEREKİR: 'day' (gün - tamsayı, 1'den başlayarak), 'title' (başlık - dize), 'description' (açıklama - dize, kısa ve ilgi çekici bir paragraf) ve 'costWeight' (maliyetAğırlığı - 1 ile 5 arasında tamsayı). Markdown biçimlendirmesi veya ek metin eklemeyin.";
        
        Console.WriteLine($"\n[ITINERARY LANGUAGE]: {siteLanguage}");
        
        string response = "";

        // ==============================================================
        // THE ITINERARY WATERFALL (GEMINI -> GROQ -> HARDCODED ERROR)
        // ==============================================================

        // --- LAYER 1: GEMINI (The Deep Thinker) ---
        try 
        {
            response = await CallFallbackAI(prompt);
            Console.WriteLine("[GEMINI ITINERARY SUCCESS]: Primary engine delivered the itinerary.");
        }
        catch (Exception exGemini)
        {
            Console.WriteLine($"[GEMINI RATE LIMIT]: {exGemini.Message} -> Deploying Groq Itinerary Parachute...");
            
            // --- LAYER 2: GROQ (The Backup Engine) ---
            try 
            {
                // We pass 'false' for isDiscoveryArray and 'false' for isPlainText
                // This tells Groq to expect an array of JSON objects!
                response = await CallPrimaryAI(prompt, false, false); 
                Console.WriteLine("[GROQ ITINERARY SUCCESS]: Backup engine saved the itinerary.");
            }
            catch (Exception exGroq)
            {
                // --- LAYER 3: HARDCODED ERROR (Total API Failure) ---
                Console.WriteLine($"[CRITICAL ITINERARY FAILURE]: Both AIs are dead! Error: {exGroq.Message}");
                return "[{\"day\": 1, \"title\": \"AI Sync Error\", \"description\": \"The AI agents are currently calculating heavy loads. Please try again in a moment.\", \"costWeight\": 1}]";
            }
        }

        // --- THE BULLETPROOF JSON EXTRACTOR ---
        try
        {
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
            Console.WriteLine($"[ITINERARY EXTRACTION ERROR]: {ex.Message}");
            return "[{\"day\": 1, \"title\": \"Formatting Error\", \"description\": \"The AI generated the itinerary, but the JSON formatting was corrupted.\", \"costWeight\": 1}]";
        }
    }

    // ==============================================================
    // THE API HELPERS (Updated to "Throw" errors upwards!)
    // ==============================================================

    private async Task<string> CallPrimaryAI(string prompt, bool isDiscoveryArray, bool isPlainText = false)
    {
        string systemMsg = isPlainText 
            ? "You are a concise travel assistant. You MUST output ONLY raw, plain text. NEVER output JSON, markdown, brackets, or conversational filler."
            : (isDiscoveryArray 
                ? "You are a rigid data API. You MUST output a FLAT JSON array of exactly 15 strings. DO NOT REPEAT CITIES. ALL 15 CITIES MUST BE UNIQUE. NEVER output JSON objects. NEVER output markdown. YOUR ONLY OUTPUT MUST MATCH THIS EXACT FORMAT: [\"String 1\", \"String 2\"]"
                : "You are a rigid data API. You MUST output a JSON array of objects. NEVER output markdown or conversational text.");

        string url = "https://api.groq.com/openai/v1/chat/completions";
        
        var payload = new {
            model = "llama-3.3-70b-versatile", 
            messages = new[] { 
                new { role = "system", content = systemMsg },
                new { role = "user", content = prompt } 
            },
            temperature = 0.4 
        };

        try
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_groqApiKey}");
            var response = await client.PostAsJsonAsync(url, payload);
            
            // This is the trigger! If Groq hits a 400 or 429, this throws the error to the waterfall.
            response.EnsureSuccessStatusCode(); 
            
            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "[]";
        }
        catch (Exception ex)
        { 
            Console.WriteLine($"[GROQ API EXCEPTION]: {ex.Message}");
            throw; // Propagate the error up to the Waterfall catch blocks!
        }
    }

    // Gemini is now the primary AI
    private async Task<string> CallFallbackAI(string prompt)
    {
        string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={_apiKey}";
        var payload = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };

        try 
        {
            var response = await _httpClient.PostAsJsonAsync(url, payload);
            
            // Triggers the Waterfall if Gemini hits a 429 rate limit!
            response.EnsureSuccessStatusCode(); 
            
            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString() ?? "[]";
        }
        catch (Exception ex)
        { 
            Console.WriteLine($"[GEMINI API EXCEPTION]: {ex.Message}");
            throw; // Propagate the error up to the Waterfall catch blocks!
        }
    }

    private string GetSiteLanguage(string lang)
    {
        return lang?.ToLower() switch
        {
            "tr" => "Turkish",
            "en" => "English",
            _ => "English"
        };
    }
}

public class OptimizationRequest 
{
    public decimal TotalBudget { get; set; }
    public int TravelPartySize { get; set; }
    public string Origin { get; set; }
    public bool HasSchengenVisa { get; set; }
    public string UserIntent { get; set; }
    
    [JsonPropertyName("StartDate")]
    public string StartDate { get; set; }

    [JsonPropertyName("EndDate")]
    public string EndDate { get; set; }

    public string Language { get; set; } = "en";
}