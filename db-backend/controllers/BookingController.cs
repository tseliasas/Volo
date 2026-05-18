using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VoloBackend.Data;
using VoloBackend.Models;

namespace VoloBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly VoloDbContext _db;

        public BookingController(VoloDbContext db)
        {
            _db = db;
        }

        // ==========================================
        // POST: /api/booking/confirm (You already have this!)
        // ==========================================
        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmBooking([FromBody] Booking request)
        {
            try
            {
                request.BookingId = 0; 
                request.BookingDate = DateTime.UtcNow;
                request.Status = "Confirmed";

                _db.Bookings.Add(request);
                await _db.SaveChangesAsync(); 

                return Ok(new { message = "Trip successfully booked!", bookingId = request.BookingId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to book trip.", error = ex.Message });
            }
        }

        // ==========================================
        // GET: /api/booking/user/1  <--- NEW DASHBOARD FETCHER
        // ==========================================
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserBookings(int userId)
        {
            try
            {
                // Fetch all receipts for this user, newest first
                var receipts = await _db.Bookings
                    .Where(b => b.UserId == userId)
                    .OrderByDescending(b => b.BookingDate)
                    .ToListAsync();

                return Ok(receipts);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to load dashboard.", error = ex.Message });
            }
        }
    }
}