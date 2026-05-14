"use client";

import { Search, Loader2, Sparkles } from "lucide-react";
import { useState, useRef } from "react";

interface SearchTerminalProps {
  onOptimize: (budget: number, pax: number, origin: string, query: string) => void;
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
  const [searchText, setSearchText] = useState("");
  const [budget, setBudget] = useState(5000);
  const [pax, setPax] = useState(2);
  const [origin, setOrigin] = useState("ADB");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const delayedOptimize = (
    budgetValue: number,
    paxValue: number,
    originValue: string,
    queryValue: string
  ) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onOptimize(budgetValue, paxValue, originValue, queryValue);
    }, 2000);
  };

  return (
    <div className="flex items-stretch rounded-[28px] overflow-hidden bg-[#0B1520] border border-cyan-400/40 shadow-[0_0_40px_rgba(0,255,255,0.20)]">
      
      {/* SEARCH */}
      <div className="flex items-center gap-5 flex-1 px-8 py-5 border-r border-white/5 bg-[#07111A]">
        <Search size={24} className="text-emerald-400" />
        <input
          placeholder="Where does your budget want to go?"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onOptimize(budget, pax, origin, searchText);
            }
          }}
          className="flex-1 bg-transparent outline-none text-base text-gray-200 placeholder:text-gray-500"
        />
      </div>

      {/* BUDGET */}
      <div className="w-[320px] px-8 py-6 border-r border-white/5 flex flex-col justify-center">
        <div className="flex justify-between items-start">
          <div className="text-gray-400 text-sm">Budget</div>
          <div className="flex rounded-full bg-white/5 p-1 mb-2">
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
            <input
              value={budget}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setBudget(Number(raw));
                delayedOptimize(Number(raw), pax, origin, searchText);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onOptimize(budget, pax, origin, searchText);
                }
              }}
              className="w-[120px] bg-transparent outline-none text-center text-emerald-400 text-xl font-semibold"
            />
          </div>
        </div>
        <input
          type="range"
          min={1000}
          max={20000}
          step={100}
          value={budget}
          onChange={(e) => {
            const value = Number(e.target.value);
            setBudget(value);
            delayedOptimize(value, pax, origin, searchText);
          }}
          className="w-full mt-3 accent-emerald-400 cursor-pointer"
        />
      </div>

      {/* PAX */}
      <div className="px-6 flex flex-col justify-center border-r border-white/5">
        <p className="text-xs text-gray-500 mb-3">Travelers</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => {
                setPax(num);
                delayedOptimize(budget, num, origin, searchText);
              }}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                pax === num ? "bg-emerald-400 text-black" : "bg-white/5 text-gray-400"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* ORIGIN */}
      <div className="px-8 flex items-center border-r border-white/5 hover:bg-white/5 transition-colors">
        <select
          value={origin}
          onChange={(e) => {
            setOrigin(e.target.value);
            delayedOptimize(budget, pax, e.target.value, searchText);
          }}
          className="bg-transparent text-white font-medium outline-none appearance-none cursor-pointer"
        >
          <option value="ADB" className="bg-gray-900">🇹🇷 Turkey (ADB)</option>
          <option value="IST" className="bg-gray-900">🇹🇷 Turkey (IST)</option>
        </select>
      </div>

      {/* OPTIMIZE BUTTON */}
      <button
        onClick={() => onOptimize(budget, pax, origin, searchText)}
        disabled={loading}
        className="px-10 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black font-bold text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-2 min-w-[180px] disabled:opacity-50 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-400"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Routing...
          </>
        ) : (
          <>
            <Sparkles size={20} />
            Optimize
          </>
        )}
      </button>
    </div>
  );
}