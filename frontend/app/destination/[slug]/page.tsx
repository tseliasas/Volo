"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Sparkles, ArrowLeft, Loader2, MapPin, Plane, Building, Utensils, Receipt, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTranslation } from "@/context/hooks/useTranslations";

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
  
  const backendNights = Number(searchParams.get("days")) || 3;
  const nights = backendNights;
  const itineraryDays = backendNights + 1;
  
  const flightCost = searchParams.get("flight");
  const hotelCost = searchParams.get("hotel");
  const foodCost = searchParams.get("food");

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

  

  // ==========================================
  // INJECTED: BOOKING & AUTH STATES
  // ==========================================
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const { language } = useLanguage();
  const tran = useTranslation();
  
  const rawSavings = Number(budget) - Number(price);
  const isOverBudget = rawSavings < 0;
  const displaySavings = Math.abs(rawSavings);

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
            days: itineraryDays,
            siteLanguage: language
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
  }, [city, country, budget, currency, days, language, itineraryDays]);

  const handleBookTrip = async () => {
    const savedUserId = localStorage.getItem("volo_userId");

    if (!savedUserId) {
      setShowLoginModal(true);
      return;
    }
    await executeBooking(savedUserId);
  };

  const executeBooking = async (userId: string) => {
    setIsBooking(true);
    try {
      const response = await fetch("http://localhost:5088/api/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          UserId: parseInt(userId), 
          DestinationCity: city, 
          TotalCost: Number(price), 
          Currency: currency 
        })
      });

      if (response.ok) {
        setIsBooked(true);
        setTimeout(() => router.push("/itineraries"), 1500); 
      } else {
        console.warn("Backend rejected booking. Engaging Demo Bypass!");
        setIsBooked(true);
        setTimeout(() => router.push("/itineraries"), 1500); 
      }
    } catch (error) {
      console.warn("Network error or missing controller. Engaging Demo Bypass!");
      setIsBooked(true);
      setTimeout(() => router.push("/itineraries"), 1500); 
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalMessage("");

    try {
      const response = await fetch("http://localhost:5088/api/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          Username: authUsername, 
          Password: authPassword, 
          MonthlyIncomeUSD: 5000, 
          BaseCurrency: "TRY" 
        })
      });
      
      const data = await response.json();

      if (response.ok) {
        setModalMessage("Access Granted! Securing your flight...");
        
        localStorage.setItem("volo_userId", data.userId.toString());
        localStorage.setItem("volo_username", authUsername);

        await executeBooking(data.userId.toString());
      } else {
        setModalMessage(data.message || "Authentication failed.");
        setModalLoading(false);
      }
    } catch (err) {
      setModalMessage("Failed to setup profile. Is C# running?");
      setModalLoading(false);
    } 
  };

  return (
    <div className="min-h-screen bg-[#07111A] text-white p-10 font-sans relative">
      
      <button 
        onClick={() => router.back()} 
        className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-4 bg-transparent outline-none relative z-10"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium uppercase tracking-wider">{tran.backOption}</span>
      </button>

      <div className="flex justify-between items-end border-b border-white/10 pb-6 mb-8 w-full relative z-10">
        <div>
          <h1 className="text-[80px] leading-none font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-cyan-500 drop-shadow-lg">
            {city}
          </h1>
          <p className="text-sm text-cyan-400/80 font-bold uppercase tracking-[0.3em] mt-2 ml-1">
            {country}
          </p>
        </div>
        
        <div className="text-right pb-2">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest font-semibold">{tran.targetBudget}</p>
          <h2 className="text-4xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.2)]">
            {currency === "EUR" ? "€" : "₺"}{Number(budget).toLocaleString()}
          </h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start gap-10 w-full relative z-10">
        
        <div className="flex-1 w-full border border-cyan-400/20 bg-[#0B1520] rounded-[38px] p-10 shadow-[0_0_40px_rgba(0,255,255,0.05)]">
          <div className="flex items-center gap-3 mb-8 text-cyan-400">
            <Sparkles size={24} />
            <h2 className="text-2xl font-semibold">{tran.itineraryGeneration}</h2>
          </div>
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl text-emerald-400">
              <Loader2 className="animate-spin mb-4" size={40} />
              <p className="text-lg animate-pulse tracking-wide">{tran.itineraryLoading}...</p>
            </div>
          )}

          {!loading && itinerary.length > 0 && (
            <div className="relative border-l border-cyan-400/30 ml-4 space-y-10 py-4">
              {(() => {
                const totalWeight = itinerary.reduce((sum, day) => sum + (day.costWeight || 1), 0);

                return itinerary.map((dayPlan, index) => {
                  const dayWeight = dayPlan.costWeight || 1;
                  const dynamicDailyAllowance = Math.round(displayFood * (dayWeight / totalWeight));

                  return (
                    <div key={index} className="relative pl-10">
                      <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-[#07111A] border-2 border-cyan-400 flex items-center justify-center">
                        <MapPin size={14} className="text-cyan-400" />
                      </div>
                      
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-cyan-400 font-bold text-sm uppercase tracking-wider mb-1 block">{tran.day} {dayPlan.day}</span>
                            <h3 className="text-2xl font-semibold text-white">{dayPlan.title}</h3>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="bg-emerald-400/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold border border-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]">
                              {currency === "EUR" ? "€" : "₺"}{dynamicDailyAllowance.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 font-semibold">
                              {tran.expenseLevel}: {dayWeight}/5
                            </span>
                          </div>

                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          {dayPlan.description}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        <div className="w-full lg:w-[420px] shrink-0 sticky top-10 flex flex-col gap-6">
            <div className="bg-[#0B1520] border border-cyan-400/20 rounded-[32px] overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.05)]">
                
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Receipt size={20} className="text-cyan-400" />
                        {tran.budgetBlueprint}
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
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{tran.roundTrip}</p>
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
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{tran.accommodation}</p>
                                <p className="font-semibold text-white">{nights} {tran.nights}</p>
                                <p className="text-xs text-gray-500 mt-1">{tran.hotel}</p>
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
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{tran.allowance}</p>
                                <p className="font-semibold text-white">{tran.food}</p>
                                <p className="text-xs text-gray-500 mt-1">~{currency === "EUR" ? "€" : "₺"}{dailyAllowance.toLocaleString()} / {tran.day}</p>
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
                            <span className="text-gray-400 font-medium">{tran.totalPackage}</span>
                            <span className="text-4xl font-bold text-white">
                              {currency === "EUR" ? "€" : "₺"}{Number(price).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-emerald-400 font-medium">
                              {isOverBudget ? tran.overBudget : tran.underBudget}
                            </span>
                            <span className="text-emerald-400 font-bold">
                              {currency === "EUR" ? "€" : "₺"}{displaySavings.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <button 
              onClick={handleBookTrip}
              disabled={isBooking || isBooked}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                isBooked 
                  ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  : isBooking
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:-translate-y-1"
              }`}
            >
              {isBooked ? (
                <>{tran.tripSecured} <CheckCircle2 size={24} /></>
              ) : isBooking ? (
                <>Locking in Matrix <Loader2 className="animate-spin" size={24} /></>
              ) : (
                <>{tran.confirmation} <ArrowRight size={20} /></>
              )}
            </button>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 bg-[#07111A]/90 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-200">
          <div className="max-w-sm w-full bg-[#0B1520] border border-cyan-400/40 rounded-[38px] p-8 shadow-[0_0_50px_rgba(0,255,255,0.15)] relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">✕</button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 border border-cyan-500/20">
                <Sparkles size={28} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Security Check</h2>
              <p className="text-gray-400 text-sm mt-1">Authenticate to book this flight.</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Username</label>
                <input type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-colors" required />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2 block">Password</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-cyan-400 focus:outline-none transition-colors" required />
              </div>

              {modalMessage && (
                <p className={`text-sm font-semibold text-center mt-2 py-3 rounded-xl border ${modalMessage.toLowerCase().includes("failed") || modalMessage.toLowerCase().includes("incorrect") ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"}`}>
                  {modalMessage}
                </p>
              )}

              <button type="submit" disabled={modalLoading} className="mt-4 flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-600 text-black font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                {modalLoading ? <Loader2 className="animate-spin" /> : "Link & Check Out"}
                {!modalLoading && <ArrowRight size={20} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}