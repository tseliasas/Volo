using Microsoft.EntityFrameworkCore;
using VoloBackend.Models;

namespace VoloBackend.Data
{
    public class VoloDbContext : DbContext
    {
        public VoloDbContext(DbContextOptions<VoloDbContext> options) : base(options)
        {
        }

        // ==========================================
        // DATABASE TABLES
        // Every DbSet here represents a real table in PostgreSQL
        // ==========================================
        
        public DbSet<User> Users { get; set; }
        public DbSet<UserFinanceProfile> UserFinanceProfiles { get; set; }
        public DbSet<Destination> Destinations { get; set; }
        public DbSet<TransportEdge> TransportEdges { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        // ==========================================
        // RELATIONSHIPS & CONFIGURATION (Optional but safe)
        // ==========================================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Tells the database exactly what currency prices should look like (e.g., 99.99)
            modelBuilder.Entity<TransportEdge>()
                .Property(t => t.PriceUSD)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<UserFinanceProfile>()
                .Property(u => u.MonthlyIncomeUSD)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalCost)
                .HasColumnType("decimal(18,2)");
        }
    }
 }