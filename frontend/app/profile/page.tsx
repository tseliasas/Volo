"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Globe, Wallet, Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/context/hooks/useTranslations";

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState("");

  const tran = useTranslation();

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
        const apiUrl = process.env.NEXT_PUBLIC_DB_API_URL || "http://localhost:5088";
        
        const response = await fetch(`${apiUrl}/api/user/${userId}`, {
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
      <div className="flex h-[60vh] items-center justify-center text-blue-400">
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
            <p className="font-bold">{tran.failedDatabase}</p>
            <p className="text-sm text-red-400/80">{networkError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: LIVE Identity Card */}
        <div className="w-full lg:w-[400px] shrink-0 bg-white/[0.04] border border-white/10 rounded-[28px] p-8 relative overflow-hidden">
          
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className={`w-20 h-20 rounded-full ${networkError ? 'bg-red-500' : 'bg-blue-500'} p-1`}>
              <div className="w-full h-full rounded-full bg-[#0A1929] flex items-center justify-center">
                <Fingerprint className={networkError ? "text-red-400" : "text-blue-400"} size={32} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{userData?.username || userData?.fullName || "Operative"}</h2>
              <p className="text-blue-400 text-sm font-medium uppercase tracking-widest">
                {userData?.passportTier || "Standard Matrix"}
              </p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
              <Wallet className="text-blue-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{tran.baseCurrency}</p>
                <p className="text-xl font-bold uppercase">
                  {userData?.baseCurrency || "TRY"} 
                </p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
              <Globe className="text-blue-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{tran.nationalityCode}</p>
                <p className="text-xl font-bold uppercase">{userData?.nationalityCode || "TUR"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Preferences */}
        <div className="flex-1 bg-white/[0.04] border border-white/10 rounded-[28px] p-8">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              {tran.routingParameters}
          </h3>

          <div className="space-y-8 mt-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{tran.pace}</span>
                <span className="text-white font-bold">{tran.paceDetails}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="h-2 rounded-full w-[80%]" style={{ background: "linear-gradient(to right, #60A5FA, #2563EB)" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">{tran.accomPriority}</span>
                <span className="text-white font-bold">{tran.accomPriorityDetail1} &gt; {tran.accomPriorityDetail2}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="h-2 rounded-full w-[30%]" style={{ background: "linear-gradient(to right, #60A5FA, #2563EB)" }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
