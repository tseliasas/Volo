using VoloBackend.Models;

namespace VoloBackend.Services;

public class VoloLogic
{
    // The privacy-first explainer text sent to the UI
    public string DailyBurnBrief => "The Daily Burn Rate (DBR) measures your daily home cost. " +
                                    "Provide it to see if traveling is actually CHEAPER than staying home. " +
                                    "This is 100% optional and private.";

    // ==========================================
    // THE ARBITRAGE CALCULATOR
    // ==========================================
    public string CalculateArbitrage(decimal tripCostUSD, int days, UserFinanceProfile? profile)
    {
        // If the user skipped the finance step, 'profile' is null. 
        // We gracefully return just the price.
        if (profile == null) return $"Cost: ${tripCostUSD}";

        // Math: (Rent + Utilities + Groceries) / 30 days
        decimal dailyHomeCost = (profile.MonthlyRent + profile.MonthlyUtilities + profile.MonthlyGroceries) / 30;
        
        // How much money they "save" by not living at home for 'X' days
        decimal homeCostSaved = dailyHomeCost * days;
        decimal netPosition = homeCostSaved - tripCostUSD;

        // If the trip costs less than their home expenses, it's an Arbitrage win!
        if (netPosition > 0)
            return $"Profitable! You net save ${netPosition} by leaving home.";
        
        return $"Cost: ${tripCostUSD} (Standard Expense)";
    }
}