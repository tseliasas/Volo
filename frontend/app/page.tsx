"use client";

import { useState, useEffect } from "react";
import TopAgentsBar from "@/components/dashboard/TopAgentsBar";
import SearchTerminal from "@/components/dashboard/SearchTerminal";
import DestinationRow from "@/components/dashboard/DestinationRow";

export default function Home() {
  // 1. THE STATE: This holds the live data from your C# engine
  const [liveTrips, setLiveTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeBudget, setActiveBudget] = useState(11500);
  const [activeOrigin, setActiveOrigin] = useState("ADB");
  const [currency, setCurrency] = useState<"TRY" | "EUR">("TRY");

  // 1. THE LOAD BLOCK: When the page opens, check if we have saved trips in memory
  useEffect(() => {
    const savedTrips = sessionStorage.getItem("volo_trips");
    const savedBudget = sessionStorage.getItem("volo_budget");
    const savedCurrency = sessionStorage.getItem("volo_currency");
    const savedOrigin = sessionStorage.getItem("volo_origin");

    if (savedOrigin) setActiveOrigin(savedOrigin);
    if (savedTrips) setLiveTrips(JSON.parse(savedTrips));
    if (savedBudget) setActiveBudget(Number(savedBudget));
    if (savedCurrency) setCurrency(savedCurrency as "TRY" | "EUR");
  }, []);

  // 2. THE SAVE BLOCK: Whenever trips change, secretly save them to the browser
  useEffect(() => {
    if (liveTrips.length > 0) {
      sessionStorage.setItem("volo_trips", JSON.stringify(liveTrips));
      sessionStorage.setItem("volo_budget", activeBudget.toString());
      sessionStorage.setItem("volo_currency", currency);
      sessionStorage.setItem("volo_origin", activeOrigin);
    }
  }, [liveTrips, activeBudget, currency, activeOrigin]);

  // 3. THE ENGINE: This talks to your Fedora backend
  const runVoloEngine = async (budget: number, pax: number, origin: string, query: string, startDate: string, endDate: string) => {
    setLoading(true);
    setActiveBudget(budget); 
    setActiveOrigin(origin);
    
    try {
      const response = await fetch("http://localhost:5133/api/optimize-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TotalBudget: budget,
          TravelPartySize: pax,
          Origin: origin,
          HasSchengenVisa: false,
          UserIntent: query || "Best Value",
          StartDate: startDate,
          EndDate: endDate
        }),
      });

      if (!response.ok) throw new Error("API error or budget too low");
      
      const data = await response.json();
      setLiveTrips(data); 
    } catch (error) {
      console.error("Volo Engine Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Replaced the heavy page wrappers with a clean, flexible column
    // because layout.tsx handles the dark background and screen constraints now!
    <div className="flex flex-col h-full">
      
      {/* HEADER: Kept your Volo title and Agents bar right at the top */}
      <header className="shrink-0 flex items-center justify-between pb-6 border-b border-white/5 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Volo</h1>
          <p className="text-sm text-gray-500 mt-1">Travel your budget.</p>
        </div>
        <TopAgentsBar />
      </header>

      {/* SEARCH TERMINAL */}
      <div className="shrink-0 relative">
        <SearchTerminal 
          onOptimize={runVoloEngine}
          currency={currency}
          setCurrency={setCurrency}
          loading={loading} 
        />

        {/* LOADING OVERLAY: Blurs out the terminal while C# is thinking */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30 rounded-[28px]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin mx-auto" />
              <p className="mt-4 text-sm font-bold tracking-widest uppercase text-emerald-400">
                AI recalibrating...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DESTINATION CARDS AREA */}
      <div className="flex-1 mt-8 min-h-0">
        <DestinationRow 
          trips={liveTrips} 
          loading={loading} 
          budget={activeBudget} 
          currency={currency} 
          origin={activeOrigin} 
        />
      </div>

    </div>
  );
}