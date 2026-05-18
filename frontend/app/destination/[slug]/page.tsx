"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Sparkles, ArrowLeft, Loader2, MapPin, Plane, Building, Utensils, Receipt } from "lucide-react";
import { convertBudget, convertPrice, currencySymbol } from "@/utils/currency";

export default function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unwrappedParams = use(params);
  
  const decodedSlug = decodeURIComponent(unwrappedParams.slug);
  const city = decodedSlug.charAt(0).toUpperCase() + decodedSlug.slice(1);
  const country = searchParams.get("country");
  const budget = searchParams.get("budget") || "0";
  const price = searchParams.get("price") || "0";
  const currency = searchParams.get("currency") || "TRY";
  const days = searchParams.get("days") || "3"; 
  const originCode = searchParams.get("origin") || "ADB"; 
  
  // The C# Backend explicitly passes the 'nights' variable under the URL key 'days'
  const backendNights = Number(searchParams.get("days")) || 3;
  
  // Therefore, nights is exactly what the URL says, and itinerary days is +1!
  const nights = backendNights;
  const itineraryDays = backendNights + 1;
  // --- GRAB THE LIVE BREAKDOWN FROM THE URL ---
  const flightCost = searchParams.get("flight");
  const hotelCost = searchParams.get("hotel");
  const foodCost = searchParams.get("food");

  // Fallbacks just in case the URL misses a parameter during testing
  const displayFlight = flightCost ? Number(flightCost) : Number(price) * 0.12;
  const displayHotel = hotelCost ? Number(hotelCost) : Number(price) * 0.56;
  const displayFood = foodCost ? Number(foodCost) : Number(price) * 0.32;
  const dailyAllowance = Math.round(displayFood / (Number(days) || 1));

  const originCityMap: Record<string, string> = {
    "ADB": "Izmir",
    "IST": "Istanbul"
  };
  const displayOrigin = originCityMap[originCode] || originCode;

  const [itinerary, setItinerary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
            days: itineraryDays 
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
  }, [city, country, budget, currency, days]);

  return (
    <div className="min-h-screen bg-[#07111A] text-white p-10 font-sans">
      
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-4 bg-transparent outline-none"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium uppercase tracking-wider">Back to Terminal</span>
      </button>

      <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-8 w-full">
        <div>
          <h1 className="text-[80px] leading-none font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-cyan-500 drop-shadow-lg">
            {city}
          </h1>
          <p className="text-sm text-cyan-400/80 font-bold uppercase tracking-[0.3em] mt-2 ml-1">
            {country}
          </p>
        </div>
        
        <div className="text-right pb-2">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest font-semibold">Target Budget</p>
          <h2 className="text-4xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            {currency === "EUR" ? "€" : "₺"}{Number(budget).toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-10 w-full">
        
        <div className="flex-1 w-full border border-cyan-400/20 bg-[#0B1520] rounded-[38px] p-10 shadow-[0_0_40px_rgba(0,255,255,0.05)]">
          <div className="flex items-center gap-3 mb-8 text-cyan-400">
            <Sparkles size={24} />
            <h2 className="text-2xl font-semibold">Live AI Itinerary Generation</h2>
          </div>
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl text-emerald-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-lg animate-pulse tracking-wide">Synthesizing local travel data...</p>
            </div>
          )}

          {!loading && itinerary.length > 0 && (
            <div className="relative border-l border-cyan-400/30 ml-4 space-y-10 py-4">
              {itinerary.map((dayPlan, index) => (
                <div key={index} className="relative pl-10">
                  <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-[#07111A] border-2 border-cyan-400 flex items-center justify-center">
                    <MapPin size={14} className="text-cyan-400" />
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1 block">Day {dayPlan.day}</span>
                        <h3 className="text-2xl font-semibold text-white">{dayPlan.title}</h3>
                      </div>
                      <span className="bg-emerald-400/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold border border-emerald-400/20">
                        {currency === "EUR" ? "€" : "₺"}{dailyAllowance.toLocaleString()}
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

        <div className="w-full lg:w-[420px] shrink-0 sticky top-10 flex flex-col gap-6">
            <div className="bg-[#0B1520] border border-cyan-400/20 rounded-[32px] overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Receipt size={20} className="text-cyan-400" />
                        Budget Blueprint
                    </h3>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    <div className="group relative rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-all overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-cyan-900/40 to-transparent"></div>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-3 rounded-full bg-cyan-400/20 text-cyan-400">
                                <Plane size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Roundtrip Flight</p>
                                <p className="font-semibold text-white">{displayOrigin} <span className="text-cyan-400">→</span> {city}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-cyan-400">
                                  {currency === "EUR" ? "€" : "₺"}{displayFlight.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-all overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-violet-900/40 to-transparent"></div>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-3 rounded-full bg-violet-400/20 text-violet-400">
                                <Building size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Accommodation</p>
                                <p className="font-semibold text-white">{nights} Nights</p>
                                <p className="text-xs text-gray-500 mt-1">Boutique Hotel / Airbnb</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-violet-400">
                                  {currency === "EUR" ? "€" : "₺"}{displayHotel.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-all overflow-hidden">
                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-emerald-900/40 to-transparent"></div>
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-3 rounded-full bg-emerald-400/20 text-emerald-400">
                                <Utensils size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Daily Allowance</p>
                                <p className="font-semibold text-white">Food & Local Travel</p>
                                <p className="text-xs text-gray-500 mt-1">~{currency === "EUR" ? "€" : "₺"}{dailyAllowance.toLocaleString()} / Day</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-emerald-400">
                                  {currency === "EUR" ? "€" : "₺"}{displayFood.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-gray-400 font-medium">Total Package</span>
                            <span className="text-4xl font-bold text-white">
                              {currency === "EUR" ? "€" : "₺"}{Number(price).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-400 font-medium">Under Budget By</span>
                            <span className="text-emerald-400 font-bold">
                              {currency === "EUR" ? "€" : "₺"}{(Number(budget) - Number(price)).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <button className="w-full py-5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:-translate-y-1">
                Confirm & Book Trip
            </button>
        </div>
      </div>
    </div>
  );
}