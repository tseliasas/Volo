"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  
  // 1. Hold the data the user types in
  const [income, setIncome] = useState("5000");
  const [currency, setCurrency] = useState("TRY");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 2. The function that talks to your C# Engine!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Stops the page from refreshing
    setLoading(true);
    setMessage("");

    try {
      // ==========================================
      // PUNCH 1: Save Identity 
      // (Matches the new IdentityDto in C#)
      // ==========================================
      const identityResponse = await fetch("http://localhost:5088/api/user/identity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          FullName: "Hackathon VIP", 
          NationalityCode: "TUR",    
          PassportTier: "Ordinary", 
          BaseCurrency: currency
        })
      });
      
      const identityData = await identityResponse.json();

      if (!identityResponse.ok) {
        setMessage(`Identity Rejected: ${identityData.message || identityData.error || "Unknown Error"}`);
        setLoading(false);
        return;
      }
      
      // ==========================================
      // SECRET WEAPON: PERMANENT MEMORY
      // (Using localStorage so the Dashboard never forgets them!)
      // ==========================================
      if (identityData.userId) {
        localStorage.setItem("volo_userId", identityData.userId.toString());
      }
      
      // ==========================================
      // PUNCH 2: Save Finance Profile 
      // (Matches the new FinanceDto in C#)
      // ==========================================
      const financeResponse = await fetch("http://localhost:5088/api/user/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserId: identityData.userId, 
          MonthlyIncomeUSD: Number(income),
          BaseCurrency: currency,
          RiskTolerance: "Medium",
          MonthlyRent: 0,       
          MonthlyUtilities: 0,  
          MonthlyGroceries: 0   
        })
      });

      if (financeResponse.ok) {
        setMessage("Profile created! Redirecting to terminal...");
        // Wait 2 seconds so they can read the success message, then send them to the Search Terminal
        setTimeout(() => router.push("/"), 2000); 
      } else {
        const financeData = await financeResponse.json();
        setMessage(`Finance Rejected: ${financeData.message || financeData.error || "Unknown Error"}`);
      }
    } catch (error) {
      console.error("Database connection failed:", error);
      setMessage("Failed to connect to the engine. Is C# running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07111A] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#0B1520] border border-cyan-400/20 rounded-[38px] p-10 shadow-[0_0_40px_rgba(0,255,255,0.05)]">
        
        <div className="flex items-center gap-3 mb-8 text-cyan-400">
          <Sparkles size={24} />
          <h2 className="text-2xl font-semibold">Initialize Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* INCOME INPUT */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2 block">
              Monthly Income
            </label>
            <input 
              type="number" 
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-400 transition-colors"
              required
            />
          </div>

          {/* CURRENCY SELECTOR */}
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-2 block">
              Base Currency
            </label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#0B1520] border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-cyan-400 transition-colors appearance-none"
            >
              <option value="TRY">Turkish Lira (₺)</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>

          {/* MESSAGE DISPLAY */}
          {message && (
            <p className={`text-sm font-medium text-center py-3 rounded-xl border ${
              message.toLowerCase().includes("rejected") || message.toLowerCase().includes("failed") 
                ? "bg-red-500/10 text-red-400 border-red-500/20" 
                : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
            }`}>
              {message}
            </p>
          )}

          {/* SUBMIT BUTTON */}
          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 disabled:text-gray-400 text-black font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:-translate-y-1"
          >
            {loading ? "Writing to Database..." : "Activate Profile"}
            {!loading && <ArrowRight size={20} />}
          </button>

        </form>
      </div>
    </div>
  );
}