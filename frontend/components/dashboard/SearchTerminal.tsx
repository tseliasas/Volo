"use client";

import { Search, Loader2, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { EXCHANGE_RATE, convertBudget, currencySymbol } from "@/utils/currency";

interface SearchTerminalProps {
  onOptimize: (
    budget: number,
    pax: number,
    origin: string,
    query: string,
    startDate: string,
    endDate: string
  ) => void;
  loading: boolean;
  currency: "TRY" | "EUR";
  setCurrency: (value: "TRY" | "EUR") => void;
}

export default function SearchTerminal({
  onOptimize,
  loading,
  currency,
  setCurrency,
}: SearchTerminalProps) {
  /* =========================
     STATE (With Memory!)
  ========================= */
  const [searchText, setSearchText] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("term_query") || "";
    return "";
  });

  const [budget, setBudget] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("volo_budget");
      return saved ? Number(saved) : 5000;
    }
    return 5000;
  });

  const [pax, setPax] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("term_pax");
      return saved ? Number(saved) : 2;
    }
    return 2;
  });

  const [origin, setOrigin] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("volo_origin") || "ADB";
    return "ADB";
  });

  const [startDate, setStartDate] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("term_start") || new Date().toISOString().split("T")[0];
    return new Date().toISOString().split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("term_end");
      if (saved) return saved;
    }
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  });

  // --- THE NEXT.JS HYDRATION SHIELD ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // ------------------------------------

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("term_query", searchText);
      sessionStorage.setItem("volo_budget", budget.toString());
      sessionStorage.setItem("term_pax", pax.toString());
      sessionStorage.setItem("volo_origin", origin);
      sessionStorage.setItem("term_start", startDate);
      sessionStorage.setItem("term_end", endDate);
    }
  }, [searchText, budget, pax, origin, startDate, endDate]);

  const convertedBudget = convertBudget(budget, currency);

  // --- PREVENT HYDRATION MISMATCH ---
  if (!mounted) return null;
  // ----------------------------------

  return (
    /* MAIN WRAPPER: Stacks the input pill and the button vertically */
    <div className="flex flex-col gap-4 w-full">
      
      {/* 1. TOP ROW: The Scrolling Input Pill */}
      <div className="w-full overflow-x-auto scrollbar-hide rounded-[28px] border border-cyan-400/40 shadow-[0_0_40px_rgba(0,255,255,0.20)]">
        <div className="flex items-stretch min-w-max bg-[#0B1520]">
          
          {/* SEARCH */}
          <div className="flex items-center gap-5 w-[380px] shrink-0 px-8 py-5 border-r border-white/5 bg-[#07111A]">
            <Search size={24} className="text-emerald-400" />
            <input
              placeholder="Where does your budget want to go?"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onOptimize(budget, pax, origin, searchText, startDate, endDate);
                }
              }}
              className="flex-1 bg-transparent outline-none text-base text-gray-200 placeholder:text-gray-500 min-w-0"
            />
          </div>

          {/* BUDGET */}
          <div className="w-[320px] shrink-0 px-8 py-6 border-r border-white/5 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <div className="text-gray-400 text-sm">Budget</div>
              <div className="flex items-center gap-3">
                <div className="flex rounded-full bg-white/5 p-1">
                  <button
                    onClick={() => setCurrency("TRY")}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      currency === "TRY" ? "bg-emerald-400 text-black" : "text-gray-400"
                    }`}
                  >
                    ₺
                  </button>
                  <button
                    onClick={() => setCurrency("EUR")}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      currency === "EUR" ? "bg-emerald-400 text-black" : "text-gray-400"
                    }`}
                  >
                    €
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-emerald-400 text-xl font-semibold">
                    {currencySymbol(currency)}
                  </span>
                  <input
                    value={Math.round(convertedBudget)}
                    onChange={(e) => {
                      const raw = Number(e.target.value.replace(/\D/g, ""));
                      const internalValue = currency === "EUR" ? raw * EXCHANGE_RATE : raw;
                      setBudget(internalValue);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        onOptimize(budget, pax, origin, searchText, startDate, endDate);
                      }
                    }}
                    className="w-[90px] bg-transparent outline-none text-right text-emerald-400 text-xl font-semibold"
                  />
                </div>
              </div>
            </div>

            <input
              type="range"
              min={currency === "EUR" ? 50 : 1000}
              max={currency === "EUR" ? 600 : 20000}
              step={currency === "EUR" ? 10 : 100}
              value={Math.round(convertedBudget)}
              onChange={(e) => {
                const raw = Number(e.target.value);
                const internalValue = currency === "EUR" ? raw * EXCHANGE_RATE : raw;
                setBudget(internalValue);
              }}
              className="w-full mt-4 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* PASSENGERS */}
          <div className="px-6 shrink-0 flex flex-col justify-center border-r border-white/5">
            <p className="text-xs text-gray-500 mb-3">Travelers</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setPax(num)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    pax === num ? "bg-emerald-400 text-black" : "bg-white/5 text-gray-400"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* TRAVEL DATES */}
          <div className="px-6 py-2 shrink-0 flex flex-col justify-center border-r border-white/5">
            <p className="text-xs text-gray-500 mb-2">Dates</p>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer [color-scheme:dark]"
              />
              <span className="text-gray-600">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer [color-scheme:dark]"
              />
            </div>
          </div>

          {/* ORIGIN (Removed border-r since it's the last item now!) */}
          <div className="px-8 shrink-0 flex items-center hover:bg-white/5 transition-colors">
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="bg-transparent text-white font-medium outline-none appearance-none cursor-pointer"
            >
              <option value="ADB" className="bg-gray-900">🇹🇷 Turkey (ADB)</option>
              <option value="IST" className="bg-gray-900">🇹🇷 Turkey (IST)</option>
            </select>
          </div>

        </div>
      </div>

      {/* 2. BOTTOM ROW: The Full-Width Optimize Button */}
      <button
        onClick={() => onOptimize(budget, pax, origin, searchText, startDate, endDate)}
        disabled={loading}
        className="w-full py-4 rounded-[24px] bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 hover:border-transparent shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] font-bold text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-400 disabled:hover:border-emerald-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Routing...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Optimize Route
          </>
        )}
      </button>

    </div>
  );
}