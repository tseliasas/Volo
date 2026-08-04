"use client";

import { useTranslation } from "@/context/hooks/useTranslations";
import PortfolioCard from "./PortfolioCard";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

// 1. UPDATED INTERFACE to gracefully handle both backend response formats
interface TripOption {
  destination?: string;
  city?: string;
  country?: string;
  totalCost?: number;
  BasePriceUSD?: number; // Matches our fallback matrix
  match?: number;        // Matches our fallback matrix
  transportMode?: string;
  stayType?: string;
  aiInsight?: string;
  days?: number;
  breakdown?: {
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
  origin: string;
}

// --- The Smart Image Fetcher Component ---
function DynamicTripCard({ trip, index, budget, currency, origin, getThemeColor }: any) { 
  const [bgImage, setBgImage] = useState<string>("");

  // 2. THE CRASH FIX: Bulletproof data extraction
  const rawDestination = trip.destination || "";
  const parts = rawDestination.split(',');
  
  const city = trip.city || (parts[0] ? parts[0].trim() : "Unknown Destination");
  const country = trip.country || (parts[1] ? parts[1].trim() : "");
  
  // Safely grab the price depending on if it came from the AI or our backup matrix
  const activePrice = trip.totalCost || trip.BasePriceUSD || 0;
  const matchPct = trip.match || (activePrice && budget ? Math.round((activePrice / budget) * 100) : 0);

  const fallbackImages = [
    "/Chios.jpg",
    "/Belgrade.jpg",
    "/Cesme.png",
    "/Antalya.jpg",
    "/Kas.jpg",
    "/Serbia.jpg",
  ];

  useEffect(() => {
    if (!city || city === "Unknown Destination") return;

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
          const randomImage = results[Math.floor(Math.random() * results.length)];
          imageUrl = randomImage.urls.regular;
        } 
        // 4. FALLBACK IF NO RESULTS
        else {
          imageUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        }

        // 5. SAVE + SET
        setBgImage(imageUrl);
        localStorage.setItem(cacheKey, imageUrl);

      } catch (error) {
        console.error("Unsplash error:", error);
        // FALLBACK ON ERROR
        const fallback = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
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
      price={activePrice}
      image={bgImage} 
      color={getThemeColor(index)}
      trip={trip} 
      currency={currency}
      origin={origin} 
    />
  );
}

// --- MAIN COMPONENT ---
export default function DestinationRow({ trips = [], loading = false, budget = 5000, currency, origin }: Props) { 
  
  const getThemeColor = (index: number) => {
    const colors = ["emerald"];
    return colors[index % colors.length];
  };

  const tran = useTranslation();

  return (
    <div className="h-full overflow-x-auto overflow-y-auto scrollbar-hide">
      
      {loading && (
        <div className="h-full flex flex-col items-center justify-center text-blue-400 mt-20">
          <Loader2 className="animate-spin mb-4" size={48} />
          <p className="text-xl animate-pulse tracking-widest uppercase font-bold">
            {tran.routeLoading}
          </p>
        </div>
      )}

      {!loading && trips.length === 0 && (
        <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-800/50 rounded-[28px] mx-6 mt-10 p-10 bg-gray-900/20">
          <p className="text-gray-500 text-lg">
            {tran.initialOption}
          </p>
        </div>
      )}

      {!loading && trips.length > 0 && (
        <div className="flex gap-4 pr-2 sm:gap-6 sm:pr-10">
          {trips.map((trip, index) => (
            <DynamicTripCard
              key={index}
              trip={trip}
              index={index}
              budget={budget}
              currency={currency}
              origin={origin} 
              getThemeColor={getThemeColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
