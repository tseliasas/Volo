"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Globe, Wallet, Loader2, AlertTriangle } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState("");

  // 1. FETCH LIVE USER DATA ON MOUNT
  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("volo_userId");
      
      if (!userId) {
        router.push("/");
        return;
      }

      try {
        console.log(`Pinging C# Database for User ID: ${userId}...`);
        
        const response = await fetch(`http://localhost:5088/api/user/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Database Connection Established!", data);
          setUserData(data);
          setNetworkError(""); 
        } else {
          throw new Error(`Database responded with status: ${response.status}`);
        }
      } catch (error: any) {
        console.error("CRITICAL NETWORK FAULT:", error);
        
        // This will print exactly what went wrong to the screen
        setNetworkError(error.message.includes("Failed to fetch") 
          ? "CORS BLOCK: C# is rejecting port 3000. See Step 2 to fix!" 
          : "C# Server Offline. Did you run 'dotnet run'?");
        
        // Fallback so the UI still renders
        setUserData({
          username: localStorage.getItem("volo_username") || "Unknown Operative",
          passportTier: "Ordinary",
          baseCurrency: "TRY",
          nationalityCode: "TUR"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-cyan-400">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="font-sans max-w-6xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* ERROR DIAGNOSTICS BANNER */}
      {networkError && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/40 rounded-2xl flex items-center gap-3 text-red-400">
          <AlertTriangle size={24} />
          <div>
            <p className="font-bold">Database Connection Failed</p>
            <p className="text-sm text-red-400/80">{networkError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: LIVE Identity Card */}
        <div className="w-full lg:w-[400px] shrink-0 bg-[#0B1520] border border-cyan-400/20 rounded-[32px] p-8 shadow-[0_0_40px_rgba(0,255,255,0.05)] relative overflow-hidden">
          
          {/* Green Glow if connected, Red if fallback */}
          <div className={`absolute -right-20 -top-20 w-64 h-64 blur-3xl rounded-full opacity-20 ${networkError ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr ${networkError ? 'from-red-500 to-orange-500' : 'from-cyan-500 to-emerald-500'} p-1`}>
              <div className="w-full h-full rounded-full bg-[#07111A] flex items-center justify-center">
                <Fingerprint className={networkError ? "text-red-400" : "text-cyan-400"} size={32} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userData?.username || userData?.fullName || "Operative"}</h2>
              <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest">
                {userData?.passportTier || "Standard Matrix"}
              </p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
              <Wallet className="text-emerald-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Base Currency</p>
                <p className="text-xl font-bold uppercase">
                  {userData?.baseCurrency || "TRY"} 
                </p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
              <Globe className="text-violet-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Nationality Code</p>
                <p className="text-xl font-bold uppercase">{userData?.nationalityCode || "TUR"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Preferences */}
        <div className="flex-1 bg-[#0B1520] border border-white/5 rounded-[32px] p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              AI Routing Parameters
          </h3>
          
          <div className="space-y-8 mt-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Pace of Travel</span>
                <span className="text-white font-bold">Fast / Aggressive</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full w-[80%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Accommodation Priority</span>
                <span className="text-white font-bold">Location &gt; Luxury</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2 rounded-full w-[30%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}