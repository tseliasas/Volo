"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, UserCircle, LogOut, Plane } from "lucide-react";
import TopAgentsBar from "@/components/dashboard/TopAgentsBar";
import SearchTerminal from "@/components/dashboard/SearchTerminal";
import DestinationRow from "@/components/dashboard/DestinationRow";
import VoloIdleState from "@/components/dashboard/VoloIdleState"; // <-- 1. IMPORT ADDED HERE!
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
    // Changed ADB to IST!
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

  // ==========================================
  // AUTHENTICATION STATE (Simplified)
  // ==========================================
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
          EndDate: endDate,
          Language: language,
        }),
      });

      if (!response.ok) throw new Error("API error or budget too low");
      
      const data = await response.json();
      setLiveTrips(data); 
    } catch (error) {
      console.warn("Volo AI Engine (Port 5133) offline. Loading SMART backup matrix...");
      
      setLiveTrips([
        { 
          city: "Antalya", 
          country: "Türkiye", 
          match: 98, 
          totalCost: budget * 0.45, 
          transportMode: "Direct Flight", 
          stayType: "Resort", 
          days: 5, 
          breakdown: { transport: budget * 0.15, accommodation: budget * 0.20, dailyAllowance: budget * 0.10 }, 
          aiInsight: "Perfect match for your parameters. The Mediterranean coast offers incredible weather perfectly within budget." 
        },
        { 
          city: "Rome", 
          country: "Italy", 
          match: 96, 
          totalCost: budget * 0.75, 
          transportMode: "Direct Flight", 
          stayType: "Boutique", 
          days: 4, 
          breakdown: { transport: budget * 0.25, accommodation: budget * 0.35, dailyAllowance: budget * 0.15 }, 
          aiInsight: "Excellent alignment with your budget. Favorable exchange rates this week make this a prime opportunity." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage("");

    try {
      const response = await fetch("http://localhost:5088/api/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Passing safe defaults in the background so auto-register doesn't crash!
        body: JSON.stringify({ 
          Username: authUsername, 
          Password: authPassword, 
          MonthlyIncomeUSD: 5000, 
          BaseCurrency: "TRY" 
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        setModalMessage(data.message || "Access Granted!");
        localStorage.setItem("volo_userId", data.userId.toString());
        localStorage.setItem("volo_username", authUsername);
        
        setHasProfile(true);
        setStoredUsername(authUsername);
        setTimeout(() => setShowLoginModal(false), 1200);
      } else {
        setModalMessage(data.message || "Authentication failed.");
      }
    } catch (err) {
      setModalMessage("Failed to connect to the server.");
    } finally {
      setModalLoading(false);
    } 
  };

  const handleLogout = () => {
    localStorage.removeItem("volo_userId");
    localStorage.removeItem("volo_username");
    setHasProfile(false);
    setStoredUsername("");
  };

  if (!mounted) {
    return null; 
  }

  return (
    <div className="flex flex-col h-full relative">
      <header className="shrink-0 flex items-center justify-between pb-6 border-b border-white/5 mb-8">
        
        {/* 1. THE ULTRA-PREMIUM VOLO BRANDING */}
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            
            {/* Upgraded App Icon: Slightly larger, rounded-2xl, inner glass reflection */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.4)] border border-emerald-300/30 relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-transparent to-white/30" />
              <Plane className="w-7 h-7 text-[#07111A] -rotate-45 ml-1 relative z-10" strokeWidth={2.5} />
            </div>
            
            {/* Upgraded Text: Uppercase, custom tracking, metallic sheen, and a subtle glowing drop shadow */}
            <h1 className="text-[44px] font-black uppercase tracking-[0.08em] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-cyan-300/70 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)] leading-none mt-1">
              VOLO
            </h1>
          </div>
          
          {/* Upgraded Motto: Capitalized with massive tracking to match the aerospace/luxury vibe */}
          <p className="text-[11px] font-bold text-emerald-200/40 tracking-[0.25em] uppercase mt-2.5 ml-[66px]">
            {tran.slogan}
          </p>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-5 rounded-full bg-white/5">
            <button
              onClick={() => setLanguage("tr")}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${language === "tr" ? "bg-emerald-400 text-black" : "bg-white/5 text-gray-400"}`}
            >
              TR
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${language === "en" ? "bg-emerald-400 text-black" : "bg-white/5 text-gray-400"}`}
            >
              EN
            </button>
          </div>

          <TopAgentsBar />
          
          <div className="h-8 w-px bg-white/10 mx-2"></div>

          {hasProfile ? (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push("/profile")} 
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.1)]"
              >
                <UserCircle size={20} />
                {storedUsername}
              </button>
              <button 
                onClick={handleLogout}
                title="Log Out"
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors border border-white/10"
            >
              <Sparkles size={18} />
              Login
            </button>
          )}

          
        </div>
      </header>

      <div className="shrink-0 relative">
        <SearchTerminal 
          onOptimize={runVoloEngine}
          currency={currency}
          setCurrency={setCurrency}
          loading={loading} 
          language={language}
          setLanguage={setLanguage}
        />
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/30 rounded-[28px]">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-400/20 border-t-emerald-400 animate-spin mx-auto" />
              <p className="mt-4 text-sm font-bold tracking-widest uppercase text-emerald-400">
                {tran.loadingMessage}...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. THE CONDITIONAL RENDER LOGIC ADDED HERE! */}
      <div className="flex-1 mt-8 min-h-0">
        {liveTrips.length > 0 ? (
          <DestinationRow 
            trips={liveTrips} 
            loading={loading} 
            budget={activeBudget} 
            currency={currency} 
            origin={activeOrigin} 
          />
        ) : (
          <VoloIdleState />
        )}
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-[#07111A]/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-[#0B1520] border border-cyan-400/40 rounded-[38px] p-8 shadow-[0_0_50px_rgba(0,255,255,0.15)] relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">✕</button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
                <Sparkles size={28} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Welcome Back</h2>
              <p className="text-gray-400 text-sm mt-1">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Username</label>
                <input type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Password</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-colors" required />
              </div>

              {modalMessage && (
                <p className={`text-sm font-semibold text-center mt-2 py-3 rounded-xl border ${modalMessage.toLowerCase().includes("failed") || modalMessage.toLowerCase().includes("incorrect") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"}`}>
                  {modalMessage}
                </p>
              )}
              <button type="submit" disabled={modalLoading} className="mt-4 flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-black font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                {modalLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                {!modalLoading && <ArrowRight size={20} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}