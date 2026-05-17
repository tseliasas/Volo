"use client";

import { useState, useEffect } from "react";
import TopAgentsBar from "@/components/dashboard/TopAgentsBar";
import SearchTerminal from "@/components/dashboard/SearchTerminal";
import DestinationRow from "@/components/dashboard/DestinationRow";

export default function Home() {
  // 1. THE STATE: Lazy initialized to safely read memory BEFORE mounting!
  const [liveTrips, setLiveTrips] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("volo_trips");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [activeBudget, setActiveBudget] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("volo_budget");
      return saved ? Number(saved) : 11500;
    }
    return 11500;
  });

  const [activeOrigin, setActiveOrigin] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("volo_origin") || "ADB";
    return "ADB";
  });

  const [currency, setCurrency] = useState<"TRY" | "EUR">(() => {
    if (typeof window !== "undefined") return (sessionStorage.getItem("volo_currency") as "TRY" | "EUR") || "TRY";
    return "TRY";
  });

  const [loading, setLoading] = useState(false);

  // 2. THE SAVE BLOCK: Save preferences instantly, save trips only when we have them!
  useEffect(() => {
    sessionStorage.setItem("volo_budget", activeBudget.toString());
    sessionStorage.setItem("volo_currency", currency);
    sessionStorage.setItem("volo_origin", activeOrigin);

    if (liveTrips.length > 0) {
      sessionStorage.setItem("volo_trips", JSON.stringify(liveTrips));
    }
  }, [liveTrips, activeBudget, currency, activeOrigin]);

  // 3. THE ENGINE: This talks to your Fedora backend
  const runVoloEngine = async (budget: number, pax: number, origin: string, query: string, startDate: string, endDate: string) => {
    console.log("🚀 REACT IS SENDING:", { startDate, endDate });
    setLoading(true);
    setLiveTrips([]); // <--- ADD THIS LINE! This instantly deletes the ghosts from the screen while loading!
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
    <div className="flex flex-col h-full">
      
      {/* HEADER */}
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

        {/* LOADING OVERLAY */}
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