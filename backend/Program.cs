using VoloBackend.Models;
using VoloBackend.Services;
using System.Text.Json.Serialization;
// Make sure to add the using statement for your services!
// using VoloBackend.Services; 

var builder = WebApplication.CreateBuilder(args);

// 1. CORS Bypass
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
});

// 2. WIRING UP YOUR ENGINE: Register your services here so the API can use them
// (Uncomment these if you use IHttpClientFactory in your services)
builder.Services.AddHttpClient(); 
builder.Services.AddScoped<LiveTravelApiService>();
builder.Services.AddScoped<TripOptimizerService>();
builder.Services.AddHttpClient<TripOptimizerService>();

var app = builder.Build();

app.UseCors("AllowAll");

// 3. THE LIVE ENDPOINT
app.MapPost("/api/optimize-trip", async (OptimizationRequest request, TripOptimizerService optimizer) =>
{
    try 
    {
        // 1. Call the engine
        var liveTrips = await optimizer.CalculateBestRoutes(request);
        
        // 2. Return the live data
        return Results.Ok(liveTrips); 
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// NEW: The Itinerary Endpoint
app.MapPost("/api/generate-itinerary", async (ItineraryRequest req, TripOptimizerService aiService) =>
{
    // ADD req.Days TO THE END OF THIS LINE RIGHT HERE!
    Console.WriteLine("RAW REQUEST DEBUG:");
    Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(req));

    Console.WriteLine($"SiteLanguage = '{req.SiteLanguage}'");
    // Console.WriteLine($"SITE LANGUAGE FROM REQUEST: {req.SiteLanguage}");
    var result = await aiService.GenerateDetailedItinerary(req.City, req.Country, req.Budget, req.Currency, req.Days, req.SiteLanguage);
    return Results.Content(result, "application/json");
});

app.Run(); 

// 3. ALL RECORDS AND CLASSES MUST GO DOWN HERE AT THE VERY BOTTOM
public record ItineraryRequest(string City, string Country, string Budget, string Currency, int Days, [property: JsonPropertyName("siteLanguage")] string SiteLanguage);