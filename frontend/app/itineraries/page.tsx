"use client";

import { motion } from "framer-motion";
import { MapPin, CalendarDays, CheckCircle2 } from "lucide-react";

// DUMMY DATA
const pastTrips = [
  { id: 1, city: "Copenhagen", country: "Denmark", status: "Booked", date: "May 2026", cost: "₺15,200", color: "cyan" },
  { id: 2, city: "Kyoto", country: "Japan", status: "Saved", date: "Oct 2026", cost: "₺28,400", color: "violet" },
  { id: 3, city: "Prague", country: "Czechia", status: "Completed", date: "Jan 2026", cost: "₺12,100", color: "emerald" },
];

export default function ItinerariesPage() {
  return (
    <div className="font-sans max-w-7xl mx-auto w-full">
      
      <div className="mb-10 border-b border-white/10 pb-6">
        <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-cyan-500 drop-shadow-lg">
          Your Vault
        </h1>
        <p className="text-sm text-cyan-400/80 font-bold uppercase tracking-[0.2em] mt-2">Saved & Booked Itineraries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pastTrips.map((trip, index) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
            className="group relative bg-[#0B1520] border border-white/5 hover:border-cyan-400/30 rounded-[32px] p-6 overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.02)] hover:shadow-[0_0_40px_rgba(34,211,238,0.1)] transition-all cursor-pointer"
          >
            <div className={`absolute -right-10 -top-10 w-40 h-40 bg-${trip.color}-500/10 blur-3xl rounded-full`}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full bg-white/5 text-${trip.color}-400`}>
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{trip.city}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{trip.country}</p>
                </div>
              </div>
              <span className={`bg-${trip.color}-500/10 text-${trip.color}-400 border border-${trip.color}-500/20 rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1`}>
                {trip.status === "Completed" && <CheckCircle2 size={12} />}
                {trip.status}
              </span>
            </div>

            <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-4 relative z-10">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <CalendarDays size={16} />
                <span>{trip.date}</span>
              </div>
              <span className="font-bold text-lg">{trip.cost}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}