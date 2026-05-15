"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
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

  // 2. THE ENGINE: This talks to your Fedora backend
  // We expect the SearchTerminal to pass us the budget, pax, and origin when clicked
  // 1. Add 'query: string' to the parameters
  // 1. Add startDate and endDate to the parameters
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
          // 2. Send the dates to C#!
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
    <main className="min-h-screen bg-[#07111A] text-white overflow-hidden">
      {/* HEADER */}
      <header className="h-[90px] flex items-center justify-between px-10 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Volo</h1>
          <p className="text-sm text-gray-500 mt-1">Travel your budget.</p>
        </div>
        <TopAgentsBar />
      </header>

      {/* MAIN BODY */}
      <div className="flex h-[calc(100vh-100px)]">
        <Sidebar />

        {/* CONTENT */}
        <div className="flex-1 px-8 py-6 overflow-y-auto overflow-x-hidden">
          
          {/* 3. Pass the engine function DOWN to the Search Terminal */}
          <SearchTerminal onOptimize={runVoloEngine}
            currency = {currency}
            setCurrency = {setCurrency}
           loading={loading} />

          {loading && (

            <div
              className="
                absolute
                inset-0

                z-50

                flex
                items-center
                justify-center

                backdrop-blur-md

                bg-black/30
              "
            >

              <div className="text-center">

                <div
                  className="
                    w-20
                    h-20

                    rounded-full

                    border-4
                    border-emerald-400/20
                    border-t-emerald-400

                    animate-spin

                    mx-auto
                  "
                />

                <p className="mt-6 text-lg">
                  AI recalibrating...
                </p>

              </div>

            </div>

          )}

          {/* DESTINATION AREA */}
          <div className="flex-1 mt-8 overflow-hidden">
            
            {/* Pass the activeBudget down to the row */}
            <DestinationRow trips={liveTrips} loading={loading} budget={activeBudget} currency={currency} origin={activeOrigin} />
          </div>
        </div>
      </div>
    </main>
  );
}