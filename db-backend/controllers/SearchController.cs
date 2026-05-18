using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VoloBackend.Data;
using VoloBackend.Models;
using VoloBackend.Services;

namespace VoloBackend.Controllers
{
    [AllowAnonymous] 
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly VoloDbContext _db;
        private readonly VoloLogic _logic;

        public SearchController(VoloDbContext db, VoloLogic logic)
        {
            _db = db;
            _logic = logic;
        }

        // ==========================================
        // GET: /api/search/routes?vibe=Beach&budget=1000
        // ==========================================
        [HttpGet("routes")]
        public async Task<IActionResult> FindTrips(
            [FromQuery] string? vibe, 
            [FromQuery] decimal budget,
            [FromQuery] int userId = 1,   
            [FromQuery] int originId = 1) 
        {
            // Fixes the null warning by safely setting a default fallback vibe string
            string targetVibe = vibe?.ToLower() ?? "beach";
            var finance = await _db.UserFinanceProfiles.FirstOrDefaultAsync(f => f.UserId == userId);

            // 1. DATABASE CHECK: Look into PostgreSQL first (FIXED: TransportEdges)
            var localRoutes = await _db.TransportEdges
                .Include(t => t.TargetNode) 
                .Where(t => t.SourceNodeId == originId 
                         && t.PriceUSD <= budget 
                         && t.TargetNode.VibeTags.ToLower().Contains(targetVibe))
                .OrderByDescending(t => t.IsGhostLeg) 
                .ThenBy(t => t.PriceUSD)
                .Take(5) 
                .ToListAsync();

            // 2. DATABASE HIT
            if (localRoutes.Any())
            {
                return Ok(FormatDataPackage(localRoutes, finance));
            }

            // 3. DATABASE MISS -> Fallback to AI Generation
            var aiGeneratedRoutes = await CallAIForRoutesAsync(targetVibe, budget, originId);
            
            if (aiGeneratedRoutes != null && aiGeneratedRoutes.Any())
            {
                // 4. WRITE-BACK CACHE (FIXED: TransportEdges)
                await _db.TransportEdges.AddRangeAsync(aiGeneratedRoutes);
                await _db.SaveChangesAsync();

                // Pull fresh matching results using navigation objects instead of unknown identity keys (FIXED: TransportEdges)
                var freshlyCachedRoutes = await _db.TransportEdges
                    .Include(t => t.TargetNode)
                    .Where(t => t.SourceNodeId == originId && t.PriceUSD <= budget && t.TargetNode.VibeTags.ToLower().Contains(targetVibe))
                    .ToListAsync();

                return Ok(FormatDataPackage(freshlyCachedRoutes, finance));
            }

            return Ok(new List<object>());
        }

        private IEnumerable<object> FormatDataPackage(List<TransportEdge> routes, UserFinanceProfile? finance)
        {
            return routes.Select(route => new
            {
                Destination = route.TargetNode?.CityName ?? "Unknown Destination",
                Country = route.TargetNode?.CountryCode ?? "TR",
                TransportMode = route.TransportMode,
                BasePriceUSD = route.PriceUSD,
                IsGhostLeg = route.IsGhostLeg,
                ArbitrageStatus = _logic.CalculateArbitrage(route.PriceUSD, 7, finance) 
            });
        }

        private async Task<List<TransportEdge>> CallAIForRoutesAsync(string vibe, decimal budget, int originId)
        {
            await Task.Delay(100); 
            return new List<TransportEdge>(); 
        }
    }
}