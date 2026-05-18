using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using VoloBackend.Data;
using VoloBackend.Models;
using VoloBackend.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. SERVICES CONFIGURATION
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS for Next.js (Allows frontend on Port 3000 to talk to us)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Register Core App Brain Logic
builder.Services.AddScoped<VoloLogic>();

// Connect to PostgreSQL Server
builder.Services.AddDbContext<VoloDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// 2. DATABASE AUTOMATION & SEEDING
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<VoloDbContext>();
    
    // UPGRADE: Automatically applies the Migrations you just built to the database!
    db.Database.Migrate(); 

    // Seed data instantly if the database is completely empty
    if (!db.Destinations.Any())
    {
        // 1. Create Destination objects (PostgreSQL will generate the IDs automatically)
        var istNode = new Destination { CityName = "Istanbul", CountryCode = "TR", VibeTags = "historic,metropolitan,culture" };
        var adbNode = new Destination { CityName = "Izmir", CountryCode = "TR", VibeTags = "beach,coast,sunny" };
        var antNode = new Destination { CityName = "Antalya", CountryCode = "TR", VibeTags = "beach,resort,tropical,sunny" };
        var romNode = new Destination { CityName = "Rome", CountryCode = "IT", VibeTags = "culture,historic,ancient" };
        var alpNode = new Destination { CityName = "Swiss Alps", CountryCode = "CH", VibeTags = "winter,ski,mountain,snow" };

        db.Destinations.AddRange(istNode, adbNode, antNode, romNode, alpNode);
        
        // Save first so PostgreSQL locks in their auto-generated IDs!
        db.SaveChanges(); 

        // 2. Link Interconnecting Transport Routes using Navigation Properties (FIXED: TransportEdges)
        db.TransportEdges.AddRange(
            new TransportEdge { SourceNode = istNode, TargetNode = antNode, TransportMode = "Flight", PriceUSD = 120.00m, IsGhostLeg = true }, 
            new TransportEdge { SourceNode = istNode, TargetNode = romNode, TransportMode = "Flight", PriceUSD = 450.00m, IsGhostLeg = false }, 
            new TransportEdge { SourceNode = adbNode, TargetNode = antNode, TransportMode = "Bus", PriceUSD = 40.00m, IsGhostLeg = false },    
            new TransportEdge { SourceNode = adbNode, TargetNode = alpNode, TransportMode = "Flight", PriceUSD = 890.00m, IsGhostLeg = true }   
        );

        db.SaveChanges();
    }
}

// 3. MIDDLEWARE PIPELINE ORDER
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Volo API V1");
    options.RoutePrefix = string.Empty; 
});

// Enable CORS pass before mapping any endpoint routes
app.UseCors("AllowAll");

app.MapGet("/ping", () => "THE ENGINE IS ALIVE!");
app.MapControllers();

app.Run();