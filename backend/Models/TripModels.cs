namespace VoloBackend.Models;

public class TripRequest
{
    public string UserIntent { get; set; } = string.Empty; // e.g., "Beach and history"
    public decimal TotalBudget { get; set; }
    public string Origin { get; set; } = "Izmir";
    public bool HasSchengenVisa { get; set; }
    public int TravelPartySize { get; set; } = 1;
}

public class TripOption
{
    public string Destination { get; set; } = string.Empty;
    public decimal TotalCost { get; set; }
    public string TransportMode { get; set; } = string.Empty;
    public string StayType { get; set; } = string.Empty;
    public string AiInsight { get; set; } = string.Empty; // The "Crazy AI" text
    public BudgetBreakdown Breakdown { get; set; } = new();
}

public class BudgetBreakdown
{
    public decimal Transport { get; set; }
    public decimal Accommodation { get; set; }
    public decimal DailyAllowance { get; set; }
}