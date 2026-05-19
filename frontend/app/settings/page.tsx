"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, KeyRound, BellRing, Loader2 } from "lucide-react";
import { useTranslation } from "@/context/hooks/useTranslations";

export default function SettingsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const tran = useTranslation();

  // 1. LOAD PREFERENCES ON STARTUP
  useEffect(() => {
    const savedNotifs = localStorage.getItem("volo_pref_notifs");
    const savedData = localStorage.getItem("volo_pref_data");
    
    if (savedNotifs !== null) setNotifs(savedNotifs === "true");
    if (savedData !== null) setDataSharing(savedData === "true");
  }, []);

  // 2. TOGGLE HANDLERS (Saves state)
  const handleToggleNotifs = () => {
    const newVal = !notifs;
    setNotifs(newVal);
    localStorage.setItem("volo_pref_notifs", newVal.toString());
  };

  const handleToggleData = () => {
    const newVal = !dataSharing;
    setDataSharing(newVal);
    localStorage.setItem("volo_pref_data", newVal.toString());
  };

  // 3. TRUE DATABASE DELETE
  const handleDeleteAccount = async () => {
    const confirmWipe = window.confirm("CRITICAL WARNING: This will permanently purge your operative profile and all secured flight ledgers from the database. Do you wish to proceed?");
    if (!confirmWipe) return; 

    setIsDeleting(true);
    const userId = localStorage.getItem("volo_userId");
    const apiUrl = process.env.NEXT_PUBLIC_DB_API_URL || "http://localhost:5088";

    try {
      if (userId) {
        // Send execution order to C# Engine
        await fetch(`${apiUrl}/api/user/${userId}`, { method: "DELETE" });
      }
    } catch (error) {
      console.warn("C# Engine Offline. Proceeding with local memory wipe.");
    } finally {
      // Wipe session data
      localStorage.removeItem("volo_userId");
      localStorage.removeItem("volo_username");
      
      // Kick them to the matrix (home page)
      router.push("/");
    }
  };

  return (
    <div className="font-sans max-w-3xl mx-auto w-full animate-in fade-in duration-500">
      
      <h1 className="text-4xl font-black tracking-tighter mb-8">{tran.systemConfig}</h1>

      {/* SECTION 1: Preferences */}
      <div className="bg-[#0B1520] border border-white/5 rounded-[28px] overflow-hidden mb-8 shadow-[0_0_20px_rgba(34,211,238,0.02)]">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
           <BellRing size={20} className="text-cyan-400" />
           <h2 className="font-bold text-lg">{tran.alerts}</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">{tran.priceDrop}</p>
            <p className="text-sm text-gray-500">{tran.getNotified}</p>
          </div>
          <button 
            onClick={handleToggleNotifs}
            className={`w-12 h-6 rounded-full transition-colors relative ${notifs ? 'bg-cyan-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      {/* SECTION 2: Security */}
      <div className="bg-[#0B1520] border border-white/5 rounded-[28px] overflow-hidden mb-8 shadow-[0_0_20px_rgba(16,185,129,0.02)]">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
           <KeyRound size={20} className="text-emerald-400" />
           <h2 className="font-bold text-lg">{tran.security}</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">{tran.share}</p>
            <p className="text-sm text-gray-500">{tran.helpVolo}</p>
          </div>
          <button 
            onClick={handleToggleData}
            className={`w-12 h-6 rounded-full transition-colors relative ${dataSharing ? 'bg-emerald-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${dataSharing ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      {/* SECTION 3: THE DANGER ZONE */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-[28px] overflow-hidden">
        <div className="p-6 border-b border-red-500/10 flex items-center gap-3">
           <ShieldAlert size={20} className="text-red-400" />
           <h2 className="font-bold text-lg text-red-400">{tran.dangerZone}</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">{tran.wipe}</p>
            <p className="text-sm text-gray-500">{tran.permanently}</p>
          </div>
          <button 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="flex items-center gap-2 px-6 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black disabled:bg-gray-800 disabled:text-gray-500 border border-red-500/20 transition-all rounded-xl font-bold text-sm"
          >
            {isDeleting ? <Loader2 className="animate-spin" size={16} /> : tran.deleteButton}
          </button>
        </div>
      </div>

    </div>
  );
}