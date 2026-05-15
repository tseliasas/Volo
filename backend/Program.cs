using VoloBackend.Models;
using VoloBackend.Services;
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

app.Run();