using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using VoloBackend.Data;   
using VoloBackend.Models; 

namespace VoloBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly VoloDbContext _context; 

        public UserController(VoloDbContext context)
        {
            _context = context;
        }

        // POST: api/user/auth (Dual Login/Register flow)
        [HttpPost("auth")]
        public async Task<IActionResult> Auth([FromBody] AuthRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username))
            {
                return BadRequest(new { message = "Invalid credentials payload." });
            }

            // 1. Search for existing user profile
            var dbUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

            if (dbUser != null)
            {
                if (dbUser.Password != request.Password)
                {
                    return BadRequest(new { message = "Incorrect password." });
                }
                
                return Ok(new { message = "Access Granted!", userId = dbUser.UserId });
            }

            // 2. Register flow: Create Identity Row
            var createdUser = new VoloBackend.Models.User
            {
                Username = request.Username,
                Password = request.Password, 
                FullName = request.Username,
                NationalityCode = "TUR",
                PassportTier = "Ordinary",
                BaseCurrency = request.BaseCurrency ?? "TRY"
            };

            _context.Users.Add(createdUser);
            await _context.SaveChangesAsync();

            // 3. FIX: Using .Set<T>() to initialize the Finance Profile without relying on implicit DbSet properties
            var financeProfile = new UserFinanceProfile
            {
                UserId = createdUser.UserId,
                MonthlyIncomeUSD = request.MonthlyIncomeUSD,
                BaseCurrency = request.BaseCurrency ?? "TRY",
                RiskTolerance = "Standard",
                MonthlyRent = 0,
                MonthlyUtilities = 0,
                MonthlyGroceries = 0
            };

            _context.Set<UserFinanceProfile>().Add(financeProfile);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile created successfully!", userId = createdUser.UserId });
        }

        // GET: api/user/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var targetUser = await _context.Users.FindAsync(id);
            if (targetUser == null) return NotFound(new { message = "Operative not found." });
            return Ok(targetUser);
        }

        // DELETE: api/user/{id} (The Danger Zone System Wipe)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var targetUser = await _context.Users.FindAsync(id);
            if (targetUser == null)
            {
                return NotFound(new { message = "Operative not found." });
            }

            // Clear booking dependencies (Assumed to be mapped via _context.Bookings)
            try 
            {
                var userBookings = _context.Set<Booking>().Where(b => EF.Property<int>(b, "UserId") == id);
                _context.Set<Booking>().RemoveRange(userBookings);
            }
            catch { /* Skip dependency if entity framework mapping structure differs */ }

            // FIX: Using .Set<T>() dynamically bypasses missing property definitions inside VoloDbContext
            var userFinance = _context.Set<UserFinanceProfile>().Where(f => f.UserId == id);
            _context.Set<UserFinanceProfile>().RemoveRange(userFinance);

            // FIX: Safely wiping User Visas table entry directly by schema mapping invocation
            var userVisas = _context.Set<UserVisa>().Where(v => v.UserId == id);
            _context.Set<UserVisa>().RemoveRange(userVisas);

            // Erase identity row
            _context.Users.Remove(targetUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Operative profile permanently purged." });
        }
    }

    public class AuthRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public decimal MonthlyIncomeUSD { get; set; }
        public string BaseCurrency { get; set; } = "TRY";
    }
}