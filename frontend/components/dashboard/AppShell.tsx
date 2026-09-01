"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, Loader2, UserCircle } from "lucide-react";
import HeroNav from "./HeroNav";
import { useLanguage } from "@/context/LanguageContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHero = pathname === "/";
  const { language, setLanguage } = useLanguage();

  const [mounted, setMounted] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUserId = localStorage.getItem("volo_userId");
    if (savedUserId) setHasProfile(true);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
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

  return (
    <div className="min-h-screen w-full">
      {mounted && (
        <HeroNav
          hasProfile={hasProfile}
          onLoginClick={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          language={language}
          setLanguage={setLanguage}
        />
      )}

      {isHero ? (
        children
      ) : (
        <main className="w-full px-4 pb-16 pt-24 sm:px-8 sm:pt-28 lg:px-12 lg:pt-32">
          {children}
        </main>
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
