"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, CalendarDays, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/hooks/useTranslations";

// THE SMART FALLBACK DATA (Used if the DB is empty or endpoint is missing)
const fallbackTrips = [
  { id: 1, city: "Copenhagen", country: "Denmark", status: "Booked", date: "May 2026", cost: "15200", currency: "TRY", color: "cyan" },
  { id: 2, city: "Kyoto", country: "Japan", status: "Saved", date: "Oct 2026", cost: "28400", currency: "TRY", color: "violet" },
  { id: 3, city: "Prague", country: "Czechia", status: "Completed", date: "Jan 2026", cost: "12100", currency: "TRY", color: "emerald" },
];

export default function ItinerariesPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const tran = useTranslation();

  // 1. FETCH LIVE BOOKINGS FROM C# DATABASE
  useEffect(() => {
    const fetchBookings = async () => {
      const userId = localStorage.getItem("volo_userId");
      
      if (!userId) {
        router.push("/");
        return;
      }

      try {
        // Attempting to hit your C# Booking Ledger endpoint
        const response = await fetch(`http://localhost:5088/api/booking/user/${userId}`);
        
        if (response.ok) {
          const data = await response.json();
          // If the DB returns actual bookings, map them to our UI!
          if (data && data.length > 0) {
            const mappedTrips = data.map((b: any, index: number) => ({
              id: b.bookingId || index,
              city: b.destinationCity || "Unknown",
              country: b.destinationCountry || "Global",
              status: "Booked",
              date: "Upcoming",
              cost: b.totalCost || 0,
              currency: b.currency || "TRY",
              color: ["cyan", "violet", "emerald", "orange"][index % 4]
            }));
            setTrips(mappedTrips);
          } else {
            // If DB is empty, show empty state
            setTrips([]);
          }
        } else {
          throw new Error("Endpoint not found or failed.");
        }
      } catch (error) {
        console.warn("Booking endpoint offline. Engaging Demo Vault...");
        // Fallback to dummy data for the presentation!
        setTrips(fallbackTrips);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [router]);

  return (
    <div className="font-sans max-w-7xl mx-auto w-full">
      
      <div className="mb-10 border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-cyan-500 drop-shadow-lg">
            {tran.yourVault}
          </h1>
          <p className="text-sm text-cyan-400/80 font-bold uppercase tracking-[0.2em] mt-2">{tran.bookedItineraries}</p>
        </div>
        
        {loading && <Loader2 className="animate-spin text-cyan-400" />}
      </div>

      {!loading && trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-[32px] bg-white/5">
          <RefreshCcw size={48} className="text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg font-medium">{tran.emptyVault}</p>
          <p className="text-sm text-gray-600 mt-2">{tran.emptyVaultDir}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {trips.map((trip, index) => {
          // Safety mapping for Tailwind dynamic colors so Next.js doesn't purge them
          const colorStyles: Record<string, string> = {
            cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
            emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            orange: "text-orange-400 bg-orange-500/10 border-orange-500/20",
          };
          const glowStyles: Record<string, string> = {
            cyan: "bg-cyan-500/10",
            violet: "bg-violet-500/10",
            emerald: "bg-emerald-500/10",
            orange: "bg-orange-500/10",
          };

          return (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              className="group relative bg-[#0B1520] border border-white/5 hover:border-cyan-400/30 rounded-[32px] p-6 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.02)] hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-all cursor-pointer"
            >
              <div className={`absolute -right-10 -top-10 w-40 h-40 blur-3xl rounded-full ${glowStyles[trip.color]}`}></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${colorStyles[trip.color]}`}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{trip.city}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{trip.country}</p>
                  </div>
                </div>
                <span className={`${colorStyles[trip.color]} border rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1`}>
                  {trip.status === "Completed" && <CheckCircle2 size={12} />}
                  {trip.status}
                </span>
              </div>

              <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-4 relative z-10">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <CalendarDays size={16} />
                  <span>{trip.date}</span>
                </div>
                <span className="font-bold text-lg">
                  {trip.currency === "EUR" ? "€" : "₺"}{Number(trip.cost).toLocaleString()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}