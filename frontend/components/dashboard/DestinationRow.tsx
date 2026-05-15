"use client";

import PortfolioCard from "./PortfolioCard";
import { Loader2 } from "lucide-react";

interface TripOption {
  destination: string;
  totalCost: number;
  transportMode: string;
  stayType: string;
  aiInsight: string;
  breakdown: {
    transport: number;
    accommodation: number;
    dailyAllowance: number;
  };
}

interface Props {
  trips?: TripOption[];
  loading?: boolean;
  budget?: number; // Prop defined here
  currency: "TRY" | "EUR";
}

// 1. CRITICAL FIX: Add `budget = 5000` into these parentheses to actually accept the prop!
export default function DestinationRow({ trips = [], loading = false, budget = 5000, currency }: Props) {
  
  const getImage = (dest: string) => {
    const lower = dest.toLowerCase();
    if (lower.includes("çeşme") || lower.includes("cesme")) return "/Cesme.png";
    if (lower.includes("chios")) return "/Chios.jpg";
    if (lower.includes("belgrade")) return "/Belgrade.jpg";
    if (lower.includes("kaş") || lower.includes("kas")) return "/Kas.jpg";
    if (lower.includes("bursa")) return "/Bursa.jpg";
    return "/Chios.jpg"; 
  };

  const getThemeColor = (index: number) => {
    const colors = ["emerald", "violet", "cyan", "orange"];
    return colors[index % colors.length];
  };

  return (
    <div className="h-full overflow-x-auto overflow-y-auto scrollbar-hide">
      
      {loading && (
        <div className="h-full flex flex-col items-center justify-center text-emerald-400 mt-20">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-xl animate-pulse tracking-widest uppercase font-bold">
            Routing Live Financial Data...
          </p>
        </div>
      )}

      {!loading && trips.length === 0 && (
        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-800/50 rounded-[28px] mx-6 mt-10 p-10 bg-gray-900/20">
          <p className="text-gray-500 text-lg">
            System ready. Set your parameters above and click Optimize to begin routing.
          </p>
        </div>
      )}

      {!loading && trips.length > 0 && (
        <div className="flex gap-6 min-w-max pr-10">
          {trips.map((trip, index) => {
            const parts = trip.destination.split(',');
            const city = parts[0] ? parts[0].trim() : trip.destination;
            const country = parts[1] ? parts[1].trim() : "";

            // 2. CRITICAL FIX: Deleted the hardcoded 5000 line and use `budget` instead!
            const matchPct = Math.round((trip.totalCost / budget) * 100);

            return (
              <PortfolioCard
                key={index}
                city={city}
                country={country}
                match={matchPct}
                budget={budget} // Pass the dynamic budget
                price={trip.totalCost}
                image={getImage(city)}
                color={getThemeColor(index)}
                trip={trip} 
                currency={currency}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}