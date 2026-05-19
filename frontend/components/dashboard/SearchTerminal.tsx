"use client";

import { Search, Loader2, Sparkles, Calendar, MapPin, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { EXCHANGE_RATE, convertBudget, currencySymbol } from "@/utils/currency";
import { useTranslation } from "@/context/hooks/useTranslations";
// import { useLanguage } from "@/context/LanguageContext"; // Uncomment if needed

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

  // 1. CHANGED DEFAULT TO "IST"
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
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  });

  // Custom Dropdown State
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const originOptions = [
    { id: "IST", label: "Turkey (IST)", flag: "🇹🇷" },
    { id: "ADB", label: "Turkey (ADB)", flag: "🇹🇷" },
  ];

  // --- THE NEXT.JS HYDRATION SHIELD ---
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

  return (
    <div className="flex flex-col gap-4 w-full relative z-20">
      
      {/* 1. TOP ROW: The Responsive Input Pill */}
      {/* FIX 1: Changed to overflow-visible so the Origin dropdown menu doesn't get chopped off! */}
      <div className="w-full rounded-[28px] border border-cyan-400/40 shadow-[0_0_40px_rgba(0,255,255,0.20)] bg-[#0B1520] relative z-30">
        
        {/* FIX 2: Removed min-w-max so the elements are allowed to squish into the screen */}
        <div className="flex items-stretch w-full overflow-x-auto xl:overflow-visible scrollbar-hide">
          
          {/* SEARCH (Reduced min-w from 320px to 200px and px-8 to px-6) */}
          <div className="flex items-center gap-4 flex-[1.5] min-w-[200px] px-6 py-5 border-r border-white/5 bg-[#07111A] rounded-l-[28px]">
            <Search size={22} className="text-emerald-400 shrink-0" />
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

          {/* BUDGET (Changed fixed w-[360px] to flexible min-w-[280px]) */}
          <div className="flex-[1.5] min-w-[280px] px-6 py-5 border-r border-white/5 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <div className="text-gray-400 text-sm whitespace-nowrap">{tran.budget}</div>
              <div className="flex items-center gap-3">
                <div className="flex rounded-full bg-white/5 p-1 shrink-0">
                  <button
                    onClick={() => setCurrency("TRY")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      currency === "TRY" ? "bg-emerald-400 text-black" : "text-gray-400"
                    }`}
                  >
                    ₺
                  </button>
                  <button
                    onClick={() => setCurrency("EUR")}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      currency === "EUR" ? "bg-emerald-400 text-black" : "text-gray-400"
                    }`}
                  >
                    €
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-emerald-400 text-lg font-semibold shrink-0">
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
                        onOptimize(budget, pax, origin, searchText, startDate, endDate, language);
                      }
                    }}
                    className="w-[75px] bg-transparent outline-none text-right text-emerald-400 text-lg font-semibold"
                  />
                </div>
              </div>
            </div>

            <input
              type="range"
              min={currency === "EUR" ? 190 : 10000}
              max={currency === "EUR" ? 3770 : 200000}
              step={currency === "EUR" ? 5 : 100}
              value={Math.round(convertedBudget)}
              onChange={(e) => {
                const raw = Number(e.target.value);
                const internalValue = currency === "EUR" ? raw * EXCHANGE_RATE : raw;
                setBudget(internalValue);
              }}
              className="w-full mt-3 accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* PASSENGERS (Reduced padding to px-5) */}
          <div className="px-5 shrink-0 flex flex-col justify-center border-r border-white/5">
            <p className="text-xs text-gray-500 mb-2 whitespace-nowrap">{tran.travelers}</p>
            <div className="flex gap-1.5">
              {[1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setPax(num)}
                  className={`w-8 h-8 rounded-full text-sm font-bold transition-all flex items-center justify-center ${
                    pax === num ? "bg-emerald-400 text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* TRAVEL DATES (Reduced padding and shrunk inputs) */}
          <div className="px-5 shrink-0 flex flex-col justify-center border-r border-white/5">
            <p className="text-xs text-gray-500 mb-2">{tran.dates}</p>
            <div className="flex gap-2 items-center">
              <div className="relative group flex items-center">
                <Calendar className="absolute left-2.5 w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-xs text-gray-200 outline-none cursor-pointer transition-all focus:border-emerald-400/50 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
              <span className="text-gray-600 font-medium">→</span>
              <div className="relative group flex items-center">
                <Calendar className="absolute left-2.5 w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-xs text-gray-200 outline-none cursor-pointer transition-all focus:border-emerald-400/50 [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* ORIGIN */}
          <div className="px-5 shrink-0 flex flex-col justify-center relative rounded-r-[28px]">
            <p className="text-xs text-gray-500 mb-2">{tran.origin}</p>
            <button 
              onClick={() => setIsOriginOpen(!isOriginOpen)}
              className="flex items-center justify-between gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white transition-all focus:border-emerald-400/50 min-w-[130px]"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[80px]">{originOptions.find(o => o.id === origin)?.label || origin}</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOriginOpen ? "rotate-180" : ""}`} />
            </button>

            {/* The Floating Dropdown Menu (Fixed visibility!) */}
            {isOriginOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOriginOpen(false)} />
                <div className="absolute top-[85%] right-4 mt-2 w-[160px] bg-[#0B1520]/95 backdrop-blur-xl border border-cyan-400/30 shadow-[0_10px_40px_rgba(0,255,255,0.15)] rounded-xl overflow-hidden z-50 flex flex-col p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  {originOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setOrigin(opt.id);
                        setIsOriginOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left ${
                        origin === opt.id 
                          ? "bg-emerald-500/15 text-emerald-300 font-bold" 
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

      {/* 2. BOTTOM ROW: The Full-Width Optimize Button */}
      <button
        onClick={() => onOptimize(budget, pax, origin, searchText, startDate, endDate, language)}
        disabled={loading}
        className="w-full py-4 rounded-[24px] bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/20 hover:border-transparent shadow-[0_0_20px_rgba(16,185,129,0.05)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] font-bold text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-400 disabled:hover:border-emerald-500/20"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            {tran.routing}
          </>
        ) : (
          <>
            <Sparkles size={20} />
            {tran.optimizeButton}
          </>
        )}
      </button>

    </div>
  );
}