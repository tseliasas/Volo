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
            <div className="w-11 h-11 rounded-2xl bg-blue-400 flex items-center justify-center border border-blue-300 sm:w-12 sm:h-12">
              <Plane className="w-6 h-6 text-[#0A1929] -rotate-45 ml-1 sm:w-7 sm:h-7" strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-[0.08em] text-white sm:text-[44px]">
              VOLO
            </h1>
          </div>
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-5">
          {hasProfile && (
            <p className="hidden text-sm text-gray-400 md:block">
              Hello, <span className="text-white font-semibold">{storedUsername}</span>
            </p>
          )}
          <div className="flex items-center gap-1 rounded-full bg-white/5 p-1">
            <button onClick={() => setLanguage("tr")} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${language === "tr" ? "bg-blue-400 text-white" : "text-gray-400 hover:text-white"}`}>TR</button>
            <button onClick={() => setLanguage("en")} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${language === "en" ? "bg-blue-400 text-white" : "text-gray-400 hover:text-white"}`}>EN</button>
          </div>
          {hasProfile ? (
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-11 h-11 rounded-full bg-white/5 hover:bg-red-500/10 text-gray-300 hover:text-red-400 flex items-center justify-center transition-colors shrink-0">
              <LogOut size={18} />
            </button>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="flex items-center gap-2 pl-5 pr-1.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors">
              Login
              <span className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center">
                <UserCircle size={18} />
              </span>
            </button>
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
      {/* PASTE THIS ENTIRE MODAL BLOCK HERE */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-[#0A1929]/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-[#102436] border border-blue-400/40 rounded-[38px] p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">✕</button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                <UserCircle size={28} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Agent Login</h2>
              <p className="text-gray-400 text-sm mt-1">Authenticate to access the Vault.</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Username</label>
                <input type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Password</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-blue-400 focus:outline-none transition-colors" required />
              </div>

              {modalMessage && (
                <p className={`text-sm font-semibold text-center mt-2 py-3 rounded-xl border ${modalMessage.toLowerCase().includes("failed") || modalMessage.toLowerCase().includes("incorrect") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-400/10 text-blue-400 border-blue-400/20"}`}>
                  {modalMessage}
                </p>
              )}

              <button type="submit" disabled={modalLoading} className="mt-4 flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-400 disabled:bg-gray-600 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                {modalLoading ? <Loader2 className="animate-spin" /> : "Access Database"}
                {!modalLoading && <ArrowRight size={20} />}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* END OF MODAL BLOCK */}
    </div>
  );
}
