"use client";

import { Search, Loader2, Sparkles, Calendar, MapPin, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { EXCHANGE_RATE, convertBudget, currencySymbol } from "@/utils/currency";
import { useTranslation } from "@/context/hooks/useTranslations";

interface SearchTerminalProps {
  onOptimize: (
    budget: number,
    pax: number,
    origin: string,
    query: string,
    startDate: string,
    endDate: string,
    language: string
  ) => void;
  loading: boolean;
  currency: "TRY" | "EUR";
  setCurrency: (value: "TRY" | "EUR") => void;
  language: "en" | "tr";
  setLanguage: (value: "en" | "tr") => void;
}

export default function SearchTerminal({
  onOptimize,
  loading,
  currency,
  setCurrency,
  language,
  setLanguage,
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
      return saved ? Number(saved) : 30000;
    }
    return 30000;
  });

  const [pax, setPax] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("term_pax");
      return saved ? Number(saved) : 1;
    }
    return 1;
  });

  const [origin, setOrigin] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("volo_origin") || "IST";
    return "IST";
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
    return new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  });

  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const originOptions = [
    { id: "IST", label: "Turkey (IST)", flag: "🇹🇷" },
    { id: "ADB", label: "Turkey (ADB)", flag: "🇹🇷" },
  ];

  const [mounted, setMounted] = useState(false);
  const tran = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  // CHANGED: Calculate today's date in YYYY-MM-DD format to block past dates
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-4 w-full relative z-20">
      
      <div className="w-full rounded-[28px] border border-white/15 bg-black/35 backdrop-blur-xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.7)] relative z-30 sm:rounded-[32px]">
        <div className="grid w-full grid-cols-1 overflow-visible md:grid-cols-2">

          {/* SEARCH */}
          <div className="flex items-center gap-3 bg-transparent px-4 py-4 border-b border-white/5 sm:px-6 sm:py-5 md:col-span-2">
            <Search size={22} className="text-blue-400 shrink-0" />
            <input
              placeholder={tran.searchPlaceholder}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onOptimize(budget, pax, origin, searchText, startDate, endDate, language);
                }
              }}
              className="w-full bg-transparent outline-none text-base text-gray-200 placeholder:text-gray-500 truncate"
            />
          </div>

          {/* BUDGET */}
          <div className="px-4 py-4 border-b border-white/5 flex flex-col justify-center sm:px-6 sm:py-5 md:border-r">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="text-gray-400 text-sm whitespace-nowrap">{tran.budget}</div>
              <div className="flex items-center gap-3">
                <div className="flex rounded-full bg-white/5 p-1 shrink-0">
                  <button
                    onClick={() => setCurrency("TRY")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      currency === "TRY" ? "bg-blue-400 text-white" : "text-gray-400"
                    }`}
                  >
                    ₺
                  </button>
                  <button
                    onClick={() => setCurrency("EUR")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      currency === "EUR" ? "bg-blue-400 text-white" : "text-gray-400"
                    }`}
                  >
                    €
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-blue-400 text-lg font-semibold shrink-0">
                    {currencySymbol(currency)}
                  </span>
                  <span className="text-right text-blue-400 text-lg font-semibold min-w-[60px]">
                    {Math.round(convertedBudget).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <input
              type="range"
              min={currency === "EUR" ? Math.round(15000 / EXCHANGE_RATE) : 15000}
              max={currency === "EUR" ? Math.round(150000 / EXCHANGE_RATE) : 150000}
              step={currency === "EUR" ? 5 : 100}
              value={Math.round(convertedBudget)}
              onChange={(e) => {
                const raw = Number(e.target.value);
                const internalValue = currency === "EUR" ? raw * EXCHANGE_RATE : raw;
                setBudget(internalValue);
              }}
              className="w-full mt-3 accent-blue-400 cursor-pointer"
            />
          </div>

          {/* PASSENGERS */}
          <div className="px-4 py-4 flex flex-col justify-center border-b border-white/5 sm:px-5 md:border-b-0 md:border-r">
            <p className="text-xs text-gray-500 mb-2 whitespace-nowrap">{tran.travelers}</p>
            <div className="flex gap-1.5">
              {[1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setPax(num)}
                  className={`w-8 h-8 rounded-full text-sm font-bold transition-all flex items-center justify-center ${
                    pax === num ? "bg-blue-400 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* TRAVEL DATES */}
          <div className="px-4 py-4 flex flex-col justify-center border-b border-white/5 sm:px-5 md:border-b-0">
            <p className="text-xs text-gray-500 mb-2">{tran.dates}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative group flex items-center">
                <Calendar className="absolute left-2.5 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors pointer-events-none" />
                <input
                  type="date"
                  // CHANGED: Added min={today}
                  min={today}
                  value={startDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setStartDate(newStart);
                    // UX Bonus: If they pick a start date AFTER the end date, automatically push the end date forward!
                    if (newStart > endDate) {
                      setEndDate(newStart);
                    }
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg pl-8 pr-2 py-2 text-xs text-gray-200 outline-none cursor-pointer transition-all focus:border-blue-400/50 [color-scheme:dark] sm:w-auto sm:py-1.5 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
              <span className="hidden text-gray-600 font-medium sm:block">→</span>
              <div className="relative group flex items-center">
                <Calendar className="absolute left-2.5 w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors pointer-events-none" />
                <input
                  type="date"
                  // CHANGED: Added min={startDate} so they can't travel back in time for their return flight!
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg pl-8 pr-2 py-2 text-xs text-gray-200 outline-none cursor-pointer transition-all focus:border-blue-400/50 [color-scheme:dark] sm:w-auto sm:py-1.5 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* ORIGIN */}
          <div className="px-4 py-4 flex flex-col justify-center relative sm:px-5">
            <p className="text-xs text-gray-500 mb-2">{tran.origin}</p>
            <button 
              onClick={() => setIsOriginOpen(!isOriginOpen)}
              className="flex w-full items-center justify-between gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white transition-all focus:border-blue-400/50 sm:w-auto sm:min-w-[130px] sm:py-1.5"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate max-w-[80px]">{originOptions.find(o => o.id === origin)?.label || origin}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOriginOpen ? "rotate-180" : ""}`} />
            </button>

            {isOriginOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOriginOpen(false)} />
                <div className="absolute top-[85%] right-4 mt-2 w-[160px] bg-[#102436] border border-white/10 rounded-xl overflow-hidden z-50 flex flex-col p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {originOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setOrigin(opt.id);
                        setIsOriginOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                        origin === opt.id 
                          ? "bg-blue-500/15 text-blue-300 font-bold" 
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{opt.flag}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <button
        onClick={() => onOptimize(budget, pax, origin, searchText, startDate, endDate, language)}
        disabled={loading}
        style={{ background: "linear-gradient(to bottom, #60A5FA, #2563EB)" }}
        className="w-full py-2 pl-8 pr-2 rounded-full text-white font-bold text-lg tracking-wide transition-opacity duration-200 flex items-center justify-center gap-3 disabled:opacity-50 hover:opacity-90"
      >
        {loading ? (
          <>
            <span className="py-2.5">{tran.routing}</span>
            <span className="w-11 h-11 rounded-full bg-black/10 flex items-center justify-center shrink-0">
              <Loader2 className="animate-spin" size={20} />
            </span>
          </>
        ) : (
          <>
            <span className="py-2.5">{tran.optimizeButton}</span>
            <span className="w-11 h-11 rounded-full bg-black/10 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </span>
          </>
        )}
      </button>

    </div>
  );
}
