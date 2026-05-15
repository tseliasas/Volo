"use client";

import { useSearchParams } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Sparkles, ArrowLeft, CalendarDays, Loader2, MapPin } from "lucide-react";
import Link from "next/link";

export default function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams();
  const unwrappedParams = use(params);
  
  const city = unwrappedParams.slug.charAt(0).toUpperCase() + unwrappedParams.slug.slice(1);
  const country = searchParams.get("country");
  const budget = searchParams.get("budget");
  const price = searchParams.get("price");
  const currency = searchParams.get("currency");
  const days = searchParams.get("days") || "3"; // <-- ADD THIS LINE
  // --- NEW STATE ---
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: THE FETCH HOOK ---
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const response = await fetch("http://localhost:5133/api/generate-itinerary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            city: city, 
            country: country, 
            budget: budget, 
            currency: currency,
            days: Number(days) // <-- ADD THIS TO THE PAYLOAD!
          }),
        });
        
        const data = await response.json();
        setItinerary(data);
      } catch (error) {
        console.error("Failed to generate itinerary:", error);
      } finally {
        setLoading(false);
      }
    };

    if (city) fetchItinerary();
  }, [city, country, budget, currency]);

  return (
    <div className="min-h-screen bg-[#07111A] text-white p-10 font-sans">
      
      {/* HEADER */}
      <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-8">
        <ArrowLeft size={20} />
        <span>Back to Terminal</span>
      </Link>

      <div className="flex justify-between items-end border-b border-white/10 pb-8 mb-10 max-w-4xl">
        <div>
          <h1 className="text-6xl font-bold mb-2">{city}</h1>
          <p className="text-2xl text-gray-400">{country}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 mb-1">Target Budget</p>
          <h2 className="text-4xl font-bold text-emerald-400">
            {currency === "EUR" ? "€" : "₺"}{Number(budget).toLocaleString()}
          </h2>
        </div>
      </div>

      {/* ITINERARY CONTAINER */}
      <div className="max-w-4xl border border-cyan-400/20 bg-[#0B1520] rounded-[38px] p-10 shadow-[0_0_40px_rgba(0,255,255,0.05)]">
        <div className="flex items-center gap-3 mb-8 text-cyan-400">
          <Sparkles size={24} />
          <h2 className="text-2xl font-semibold">Live AI Itinerary Generation</h2>
        </div>
        
        {/* LOADING STATE */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl text-emerald-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-lg animate-pulse tracking-wide">Synthesizing local travel data...</p>
          </div>
        )}

        {/* LOADED TIMELINE */}
        {!loading && itinerary.length > 0 && (
          <div className="relative border-l border-cyan-400/30 ml-4 space-y-10 py-4">
            {itinerary.map((dayPlan, index) => (
              <div key={index} className="relative pl-10">
                {/* Timeline Dot */}
                <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-[#07111A] border-2 border-cyan-400 flex items-center justify-center">
                  <MapPin size={14} className="text-cyan-400" />
                </div>
                
                {/* Content Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1 block">Day {dayPlan.day}</span>
                      <h3 className="text-2xl font-semibold text-white">{dayPlan.title}</h3>
                    </div>
                    <span className="bg-emerald-400/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold border border-emerald-400/20">
                      {dayPlan.cost}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {dayPlan.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}