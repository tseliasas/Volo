using System.Text.Json;

namespace VoloBackend.Services;

public class LiveTravelApiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiHost;

    public LiveTravelApiService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _apiKey = config["TravelApis:RapidApiKey"] ?? throw new ArgumentNullException("RapidAPI Key missing!");
        _apiHost = config["TravelApis:RapidApiHost"] ?? throw new ArgumentNullException("RapidAPI Host missing!");
        
        // RapidAPI specific headers
        _httpClient.DefaultRequestHeaders.Add("x-rapidapi-key", _apiKey);
        _httpClient.DefaultRequestHeaders.Add("x-rapidapi-host", _apiHost);
    }

    public async Task<decimal> GetCheapestFlightAsync(string originCode, string destCode)
    {
        try
        {
            // RapidAPI usually wants dates in YYYY-MM-DD format
            var dateFrom = DateTime.UtcNow.AddDays(7).ToString("yyyy-MM-dd");
            var dateTo = DateTime.UtcNow.AddDays(10).ToString("yyyy-MM-dd"); // 3-day trip
            
            // 🚨 THE UPDATED URL based on your screenshot:
            // Note: Check the "Params(19)" tab in your screenshot to confirm the exact parameter names.
            // Usually, for Sky Scraper, it looks something like this:
            var url = $"https://{_apiHost}/flights/search-roundtrip?fromEntityId={originCode}&toEntityId={destCode}&departDate={dateFrom}&returnDate={dateTo}&currency=TRY";

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var jsonString = await response.Content.ReadAsStringAsync();
            
            // 🛑 HACKATHON DEBUGGER: Keep this uncommented the first time you run it!
            Console.WriteLine("RAPID API RESPONSE:");
            Console.WriteLine(jsonString); 

            using var jsonDoc = JsonDocument.Parse(jsonString);

            // This is a guess at the JSON structure. You MUST look at the Console.WriteLine output
            // to see exactly where the "price" field is hidden inside the JSON tree!
            var dataObject = jsonDoc.RootElement.GetProperty("data");
            var itinerariesArray = dataObject.GetProperty("itineraries");
            
            if (itinerariesArray.GetArrayLength() > 0)
            {
                // Grabbing the price of the first (cheapest) itinerary returned
                var priceProperty = itinerariesArray[0]
                    .GetProperty("price")
                    .GetProperty("raw") // Sometimes it's nested like price -> raw or price -> formatted
                    .GetDecimal();
                    
                return priceProperty;
            }

            return 0m;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"RapidAPI Error: {ex.Message}");
            return 2500m; // Safe fallback for the demo
        }
    }
}