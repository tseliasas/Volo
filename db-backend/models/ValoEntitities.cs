using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VoloBackend.Models;

// ==========================================
// TABLE 1: USER IDENTITY
// ==========================================
public class User
{
    [Key] 
    public int UserId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty; // NEW!

    [Required]
    [MaxLength(50)]
    public string Password { get; set; } = string.Empty; // NEW!

    [Required] 
    [MaxLength(100)] 
    public string FullName { get; set; } = string.Empty;

    [Required]
    [MaxLength(3)] 
    public string NationalityCode { get; set; } = "TUR";

    [MaxLength(50)] 
    public string PassportTier { get; set; } = "Ordinary";

    [MaxLength(3)] 
    public string BaseCurrency { get; set; } = "TRY";

    public ICollection<UserVisa> VisaWallet { get; set; } = new List<UserVisa>();
}

// ==========================================
// TABLE 2: VISA WALLET
// ==========================================
public class UserVisa
{
    [Key]
    public int VisaId { get; set; }

    public int UserId { get; set; }
    [ForeignKey("UserId")] 
    public User User { get; set; } = null!;

    [Required]
    [MaxLength(20)] 
    public string VisaType { get; set; } = string.Empty;

    public DateTime ExpiryDate { get; set; } 
}

// ==========================================
// TABLE 3: FINANCE PROFILE
// ==========================================
public class UserFinanceProfile
{
    [Key]
    public int ProfileId { get; set; }

    public int UserId { get; set; }
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyIncomeUSD { get; set; }
    
    [MaxLength(3)]
    public string? BaseCurrency { get; set; }
    
    [MaxLength(50)]
    public string? RiskTolerance { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyRent { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyUtilities { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal MonthlyGroceries { get; set; }
}

// ==========================================
// TABLES 4 & 5: THE GLOBAL TRANSPORT GRAPH
// ==========================================
public class Destination
{
    [Key]
    public int NodeId { get; set; }
    
    [Required]
    public string CityName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(3)]
    public string CountryCode { get; set; } = string.Empty;
    
    public string VibeTags { get; set; } = string.Empty; 
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal HistoricalAvgNightlyCost { get; set; }
}

public class TransportEdge
{
    [Key]
    public int EdgeId { get; set; }
    
    public int SourceNodeId { get; set; }
    [ForeignKey("SourceNodeId")]
    public Destination SourceNode { get; set; } = null!;
    
    public int TargetNodeId { get; set; }
    [ForeignKey("TargetNodeId")]
    public Destination TargetNode { get; set; } = null!;
    
    public string TransportMode { get; set; } = "Flight";
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal PriceUSD { get; set; }
    
    public bool IsGhostLeg { get; set; }
    public DateTime DepartureTime { get; set; }
}

// ==========================================
// TABLE 6: THE GLOBAL VISA MATRIX
// ==========================================
public class GlobalVisaMatrix
{
    [Key] 
    public int MatrixId { get; set; }

    [Required]
    [MaxLength(3)] 
    public string VisitorNationality { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(3)] 
    public string TargetCountryCode { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(20)] 
    public string AccessLevel { get; set; } = "Required";
}