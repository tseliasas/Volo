"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, UserCircle, LogOut, Plane } from "lucide-react";
import SearchTerminal from "@/components/dashboard/SearchTerminal";
import DestinationRow from "@/components/dashboard/DestinationRow";
import VoloIdleState from "@/components/dashboard/VoloIdleState";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/context/hooks/useTranslations";

export default function Home() {
  const router = useRouter();

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
      return saved ? Number(saved) : 30000;
    }
    return 30000;
  });

  const [activeOrigin, setActiveOrigin] = useState(() => {
    if (typeof window !== "undefined") return sessionStorage.getItem("volo_origin") || "IST";
    return "IST";
  });

  const [currency, setCurrency] = useState<"TRY" | "EUR">(() => {
    if (typeof window !== "undefined") return (sessionStorage.getItem("volo_currency") as "TRY" | "EUR") || "TRY";
    return "TRY";
  });

  const { language, setLanguage } = useLanguage();
  const tran = useTranslation();
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [storedUsername, setStoredUsername] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUserId = localStorage.getItem("volo_userId");
    const savedUsername = localStorage.getItem("volo_username");
    if (savedUserId && savedUsername) {
      setHasProfile(true);
      setStoredUsername(savedUsername);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("volo_budget", activeBudget.toString());
    sessionStorage.setItem("volo_currency", currency);
    sessionStorage.setItem("volo_origin", activeOrigin);
    if (liveTrips.length > 0) {
      sessionStorage.setItem("volo_trips", JSON.stringify(liveTrips));
    }
  }, [liveTrips, activeBudget, currency, activeOrigin]);

  const runVoloEngine = async (budget: number, pax: number, origin: string, query: string, startDate: string, endDate: string, language: string) => {
    setLoading(true);
    setLiveTrips([]); 
    setActiveBudget(budget); 
    setActiveOrigin(origin);
    
    // Dynamic URL for Cloud Backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5133";
    
    try {
      const response = await fetch(`${apiUrl}/api/optimize-trip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TotalBudget: budget,
          TravelPartySize: pax,
          Origin: origin,
          HasSchengenVisa: false,
          UserIntent: query || "Best Value",
          StartDate: startDate,
          EndDate: endDate,
          Language: language,
        }),
      });

      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      setLiveTrips(data); 
    } catch (error) {
      console.warn("API offline, falling back to mock data...");
      setLiveTrips([
        { city: "Antalya", country: "Türkiye", match: 98, totalCost: budget * 0.45, aiInsight: "Perfect coastal getaway." },
        { city: "Rome", country: "Italy", match: 96, totalCost: budget * 0.75, aiInsight: "Excellent alignment." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    
    const apiUrl = process.env.NEXT_PUBLIC_DB_API_URL || "http://localhost:5088";

    try {
      const response = await fetch(`${apiUrl}/api/user/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: authUsername, Password: authPassword, MonthlyIncomeUSD: 5000, BaseCurrency: "TRY" })
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("volo_userId", data.userId.toString());
        localStorage.setItem("volo_username", authUsername);
        setHasProfile(true);
        setStoredUsername(authUsername);
        setShowLoginModal(false);
      } else {
        setModalMessage(data.message || "Auth failed.");
      }
    } catch (err) {
      setModalMessage("Server connection failed.");
    } finally {
      setModalLoading(false);
    } 
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full relative">
      <header className="shrink-0 flex flex-col gap-4 border-b border-white/5 pb-5 mb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-6 sm:mb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-400 flex items-center justify-center border border-emerald-300 sm:w-12 sm:h-12">
              <Plane className="w-6 h-6 text-[#07111A] -rotate-45 ml-1 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[0.08em] text-white sm:text-[44px]">
              VOLO
            </h1>
          </div>
        </div>
        
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-5">
          <div className="flex items-center gap-2 rounded-full bg-white/5 p-1">
            <button onClick={() => setLanguage("tr")} className={`px-3 py-1.5 rounded-full text-sm ${language === "tr" ? "bg-emerald-400 text-black" : "bg-white/5 text-gray-400"}`}>TR</button>
            <button onClick={() => setLanguage("en")} className={`px-3 py-1.5 rounded-full text-sm ${language === "en" ? "bg-emerald-400 text-black" : "bg-white/5 text-gray-400"}`}>EN</button>
          </div>
          {hasProfile ? (
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="p-2.5 rounded-xl bg-red-500/10 text-red-400">
              <LogOut size={18} />
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="px-5 py-2 rounded-xl bg-white/5 text-white font-bold">Login</button>
          )}
        </div>
      </header>

      <div className="shrink-0 relative">
        <SearchTerminal onOptimize={runVoloEngine} currency={currency} setCurrency={setCurrency} loading={loading} language={language} setLanguage={setLanguage} />
      </div>

      <div className="flex-1 mt-8 min-h-0">
        {liveTrips.length > 0 ? (
          <DestinationRow trips={liveTrips} loading={loading} budget={activeBudget} currency={currency} origin={activeOrigin} />
        ) : (
          <VoloIdleState />
        )}
      </div>
    </div>
  );
}
