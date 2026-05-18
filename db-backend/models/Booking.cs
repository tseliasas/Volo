namespace VoloBackend.Models
{
    public class Booking
    {
        public int BookingId { get; set; } // Primary Key
        public int UserId { get; set; } // Who booked it?
        public string? DestinationCity { get; set; } // Where are they going?
        public decimal TotalCost { get; set; } // How much did it cost?
        public string? Currency { get; set; } // TRY, EUR, etc.
        public DateTime BookingDate { get; set; } = DateTime.UtcNow; // When did they book?
        public string Status { get; set; } = "Confirmed";
    }
}