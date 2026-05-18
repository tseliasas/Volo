"use client";

import PortfolioCard from "./PortfolioCard";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface TripOption {
  destination: string;
  totalCost: number;
  transportMode: string;
  stayType: string;
  aiInsight: string;
  days: number;
  breakdown: {
    transport: number;
    accommodation: number;
    dailyAllowance: number;
  };
}

interface Props {
  trips?: TripOption[];
  loading?: boolean;
  budget?: number;
  currency: "TRY" | "EUR";
  origin: string; // <-- 1. ADDED ORIGIN HERE
}

// --- NEW: The Smart Image Fetcher Component ---
// We wrap each card in this so they can individually fetch their own Unsplash photos!
function DynamicTripCard({ trip, index, budget, currency, origin, getThemeColor }: any) { // <-- 2. ADDED ORIGIN HERE
  const [bgImage, setBgImage] = useState<string>("");

  const parts = trip.destination.split(',');
  const city = parts[0] ? parts[0].trim() : trip.destination;
  const country = parts[1] ? parts[1].trim() : "";
  const matchPct = Math.round((trip.totalCost / budget) * 100);

  const fallbackImages = [
    "/Chios.jpg",
    "/Belgrade.jpg",
    "/Cesme.png",
    "/Antalya.jpg",
    "/Kas.jpg",
    "/Serbia.jpg",
  ];


useEffect(() => {
  if (!city) return;

  const fetchCityPhoto = async () => {
    const cacheKey = `city-image-${city.toLowerCase()}`;

    try {
      // 1. CHECK CACHE FIRST
      const cachedImage = localStorage.getItem(cacheKey);

      if (cachedImage) {
        setBgImage(cachedImage);
        return;
      }

      // 2. FETCH FROM UNSPLASH
      const response = await fetch(
        `https://api.unsplash.com/search/photos?` +
          new URLSearchParams({
            page: "1",
            per_page: "30",
            query: `${city} travel`,
            orientation: "landscape",
            content_filter: "high",
            client_id: process.env.NEXT_PUBLIC_UNSPLASH_KEY!,
          })
      );

      const data = await response.json();

      const results = data.results || [];

      let imageUrl = "";

      // 3. USE UNSPLASH IMAGE
      if (results.length > 0) {
        const randomImage =
          results[Math.floor(Math.random() * results.length)];

        imageUrl = randomImage.urls.regular;
      }

      // 4. FALLBACK IF NO RESULTS
      else {
        imageUrl =
          fallbackImages[
            Math.floor(Math.random() * fallbackImages.length)
          ];
      }

      // 5. SAVE + SET
      setBgImage(imageUrl);

      localStorage.setItem(cacheKey, imageUrl);
    } catch (error) {
      console.error("Unsplash error:", error);

      // FALLBACK ON ERROR
      const fallback =
        fallbackImages[
          Math.floor(Math.random() * fallbackImages.length)
        ];

      setBgImage(fallback);

      localStorage.setItem(cacheKey, fallback);
    }
  };

  fetchCityPhoto();
}, [city]);

  return (
    <PortfolioCard
      city={city}
      country={country}
      match={matchPct}
      budget={budget} 
      price={trip.totalCost}
      // If Unsplash is loading or fails, fallback to your teammate's default image
      image={bgImage } 
      color={getThemeColor(index)}
      trip={trip} 
      currency={currency}
      origin={origin} // <-- 3. PASSED ORIGIN TO THE CARD
    />
  );
}

// --- MAIN COMPONENT ---
export default function DestinationRow({ trips = [], loading = false, budget = 5000, currency, origin }: Props) { // <-- 4. ADDED ORIGIN HERE
  
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
          {trips.map((trip, index) => (
            <DynamicTripCard
              key={index}
              trip={trip}
              index={index}
              budget={budget}
              currency={currency}
              origin={origin} // <-- 5. PASSED ORIGIN TO THE CARD WRAPPER
              getThemeColor={getThemeColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}