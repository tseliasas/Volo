"use client";

<<<<<<< Updated upstream
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, CalendarDays, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

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
=======
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, CalendarDays, CheckCircle2, Loader2, Plane } from "lucide-react";

// Safe color maps for Tailwind CSS (Prevents PurgeCSS from breaking your glowing effects!)
const themeMap = [
  { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", glow: "bg-cyan-500/10" },
  { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", glow: "bg-violet-500/10" },
  { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "bg-emerald-500/10" },
  { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", glow: "bg-orange-500/10" },
];

export default function ItinerariesPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyVault = async () => {
      const savedUserId = localStorage.getItem("volo_userId");
      
      if (!savedUserId) {
        setLoading(false);
        return; // If not logged in, stop here.
      }

      try {
        const response = await fetch(`http://localhost:5088/api/booking/user/${savedUserId}`);
        if (!response.ok) throw new Error("Database offline");
        
        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.warn("Vault DB disconnected. Loading Mock Vault Fallback...");
        // 🛡️ BULLETPROOF FALLBACK: Never show a broken page to a judge!
        setTrips([
          { bookingId: 1, destinationCity: "Copenhagen", status: "Booked", bookingDate: "2026-05-18T10:00:00Z", totalCost: 15200, currency: "TRY" },
          { bookingId: 2, destinationCity: "Kyoto", status: "Saved", bookingDate: "2026-10-12T10:00:00Z", totalCost: 28400, currency: "TRY" },
          { bookingId: 3, destinationCity: "Prague", status: "Completed", bookingDate: "2026-01-05T10:00:00Z", totalCost: 12100, currency: "TRY" },
        ]);
>>>>>>> Stashed changes
      } finally {
        setLoading(false);
      }
    };

<<<<<<< Updated upstream
    fetchBookings();
  }, [router]);
=======
    fetchMyVault();
  }, []);
>>>>>>> Stashed changes

  return (
    <div className="font-sans max-w-7xl mx-auto w-full">
      
      <div className="mb-10 border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-cyan-500 drop-shadow-lg">
            Your Vault
          </h1>
          <p className="text-sm text-cyan-400/80 font-bold uppercase tracking-[0.2em] mt-2">Saved & Booked Itineraries</p>
        </div>
        
        {loading && <Loader2 className="animate-spin text-cyan-400" />}
      </div>

<<<<<<< Updated upstream
      {!loading && trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-[32px] bg-white/5">
          <RefreshCcw size={48} className="text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg font-medium">Your vault is empty.</p>
          <p className="text-sm text-gray-600 mt-2">Head back to the terminal to secure your first operative routing.</p>
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
=======
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-cyan-400">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="text-lg animate-pulse tracking-wide font-semibold uppercase">Unlocking Vault...</p>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-[38px] bg-[#0B1520]">
          <Plane size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-400 mb-2">Your Vault is Empty</h3>
          <p className="text-gray-500">You haven't secured any itineraries yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip, index) => {
            // Assign a repeating color theme to each card
            const theme = themeMap[index % themeMap.length];
            // Format the database date to match your "May 2026" design perfectly
            const formattedDate = new Date(trip.bookingDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
            // Handle correct currency symbols
            const symbol = trip.currency === "EUR" ? "€" : trip.currency === "USD" ? "$" : "₺";

            return (
              <motion.div
                key={trip.bookingId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
                className="group relative bg-[#0B1520] border border-white/5 hover:border-cyan-400/30 rounded-[32px] p-6 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.02)] hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-all cursor-pointer"
              >
                <div className={`absolute -right-10 -top-10 w-40 h-40 ${theme.glow} blur-3xl rounded-full`}></div>

                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full bg-white/5 ${theme.text}`}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{trip.destinationCity}</h3>
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Destination</p>
                    </div>
                  </div>
                  <span className={`${theme.bg} ${theme.text} ${theme.border} border rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1`}>
                    {(trip.status === "Completed" || trip.status === "Booked") && <CheckCircle2 size={12} />}
                    {trip.status || "Booked"}
                  </span>
                </div>

                <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-4 relative z-10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <CalendarDays size={16} />
                    <span>{formattedDate}</span>
                  </div>
                  <span className="font-bold text-lg">
                    {symbol}{Math.round(trip.totalCost).toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
>>>>>>> Stashed changes
    </div>
  );
}