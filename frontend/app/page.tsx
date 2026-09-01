"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Loader2, UserCircle, Sparkles, Cpu } from "lucide-react";
import SearchTerminal from "@/components/dashboard/SearchTerminal";
import DestinationRow from "@/components/dashboard/DestinationRow";
import HeroNav from "@/components/dashboard/HeroNav";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/context/hooks/useTranslations";

export default function Home() {
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

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (!mounted) return null;

  const showHero = !loading && liveTrips.length === 0;

  return (
    <div className="relative min-h-full w-full">
      {showHero ? (
        <>
          {/* FULL-BLEED BACKGROUND PHOTO */}
          <div className="fixed inset-0 z-0 overflow-hidden">
            <img
              src="/Chios.jpg"
              alt=""
              className="h-full w-full object-cover animate-[kenburns_25s_ease-in-out_infinite_alternate]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#0A1929]/35 to-black/10" />
          </div>

          <div className="relative z-10 flex min-h-full flex-col">
            <HeroNav
              hasProfile={hasProfile}
              onLoginClick={() => setShowLoginModal(true)}
              onLogout={handleLogout}
              language={language}
              setLanguage={setLanguage}
            />

            <main className="mt-auto flex flex-col gap-6 px-5 pb-8 sm:gap-8 sm:px-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-16">
              {/* LEFT: HEADLINE + SEARCH */}
              <div>
                <h1 className="max-w-xl text-3xl font-semibold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[3.5rem]">
                  Travel further on the budget you already have.
                </h1>
                <div className="mt-6 sm:mt-8">
                  <SearchTerminal
                    onOptimize={runVoloEngine}
                    currency={currency}
                    setCurrency={setCurrency}
                    loading={loading}
                    language={language}
                    setLanguage={setLanguage}
                  />
                </div>
              </div>

              {/* RIGHT: GLASS CARDS */}
              <div className="flex flex-col gap-4 sm:flex-row lg:w-auto lg:gap-5">
                <div className="flex flex-col justify-between rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:w-64 sm:p-6">
                  <span
                    style={{ fontFamily: "var(--font-silkscreen), cursive" }}
                    className="text-3xl font-normal tracking-tight text-white sm:text-4xl"
                  >
                    40+
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-white/70 sm:mt-4">
                    Destinations mapped across Volo&apos;s routing engine.
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-lg sm:w-64 sm:p-6">
                  <div className="mb-3 flex items-center gap-2 sm:mb-4">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-400">
                      <Sparkles size={13} className="text-[#0A1929]" />
                    </div>
                    <span className="text-sm font-semibold text-white">Volo AI</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/80">
                    &quot;Tell us your budget — our agents route flights, stays, and daily spend to match it in seconds.&quot;
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-white/60 sm:mt-5">
                    <Cpu size={14} /> Prime · Lux · Hack agents
                  </div>
                </div>
              </div>
            </main>
          </div>
        </>
      ) : (
        <div className="relative z-10 flex h-full flex-col overflow-y-auto bg-[#0A1929]">
          <HeroNav
            hasProfile={hasProfile}
            onLoginClick={() => setShowLoginModal(true)}
            onLogout={handleLogout}
            onDiscoverClick={() => setLiveTrips([])}
            language={language}
            setLanguage={setLanguage}
          />

          <div className="px-5 pb-16 sm:px-8 lg:px-12">
            <button
              onClick={() => setLiveTrips([])}
              className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft size={16} /> {tran.backOption}
            </button>

            <DestinationRow trips={liveTrips} loading={loading} budget={activeBudget} currency={currency} origin={activeOrigin} />
          </div>
        </div>
      )}

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
    </div>
  );
}
