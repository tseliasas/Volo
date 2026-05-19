"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, CircleArrowRightIcon } from "lucide-react";
import { convertBudget, convertPrice, currencySymbol } from "@/utils/currency";
import { useTranslation } from "@/context/hooks/useTranslations";

interface Props {
  city: string;
  country: string;
  match: number;
  budget: number;
  price: number;
  image: string;
  color: string;
  trip: any; 
  origin?: string;
  currency: "TRY" | "EUR";
}

const auraMap: Record<string, string> = {
  emerald: "rgba(74,222,128,0.45)",
  violet: "rgba(168,85,247,0.45)",
  cyan: "rgba(34,211,238,0.45)",
  orange: "rgba(251,146,60,0.45)",
};

const solidMap: Record<string, string> = {
  emerald: "#4ADE80",
  violet: "#A855F7",
  cyan: "#22D3EE",
  orange: "#FB923C",
};





export default function PortfolioCard({
  city,
  country,
  match,
  budget,
  price,
  image,
  color,
  trip,
  currency,
  origin = "ADB",
}: Props) {
  
  // 1. THE BULLETPROOF SAFETY NET: Catch the price no matter how C# capitalized it!
  const rawDbPrice = trip?.basePriceUSD || trip?.BasePriceUSD || trip?.PriceUSD || price || 0;
  const safePrice = Number(rawDbPrice); 
  
  const convertedBudget = convertBudget(budget, currency);
  const convertedPrice = convertPrice(price, currency);
  const tran = useTranslation();

  const symbol = currencySymbol(currency);

  // 2. COMBINED SAFE FALLBACKS & CURRENCY CONVERSIONS
  const transportCost = trip?.breakdown?.transport || (safePrice * 0.4);
  const hotelCost = trip?.breakdown?.accommodation || (safePrice * 0.4);
  const experiencesCost = trip?.breakdown?.dailyAllowance || (safePrice * 0.2);
  
  const convertedTransportCost = convertPrice(transportCost, currency);
  const convertedHotelCost = convertPrice(hotelCost, currency);
  const convertedExperiencesCost = convertPrice(experiencesCost, currency);

  const tripDays = trip?.breakdown?.dailyAllowance ? Math.round(trip.breakdown.dailyAllowance / 1000) : (trip?.days || 3);

  const rawSavings = convertedBudget - convertedPrice;
  const isOverBudget = rawSavings < 0;
  const displaySavings = Math.abs(rawSavings);

  const glow = auraMap[color] || auraMap.cyan;
  const solid = solidMap[color] || solidMap.cyan;

  const defaultInsight = `Based on your budget, a ${trip?.transportMode?.toLowerCase() || 'trip'} to ${city} offers great value right now.`;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 220 }}
      className="relative w-[340px] h-[800px] rounded-[38px] overflow-hidden shrink-0"
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[-30px] rounded-[60px] blur-3xl z-0"
        style={{ background: glow }}
      />

      <div className="relative z-10 h-full rounded-[38px] border border-white/10 overflow-hidden bg-[#0B1520]">
        
        <div className="relative h-[48%]">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-25px] rounded-[48px] blur-3xl z-0"
            style={{ background: glow }}
          />
          <div className="absolute inset-0 rounded-[26px] z-[2] pointer-events-none" style={{ boxShadow: `0 0 40px ${glow}` }} />
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-[#0B1520]" />

          <div className="relative z-10 h-full p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div 
                className="px-4 py-2 rounded-full text-sm font-medium backdrop-blur-xl" 
                style={{ background: `${solid}25`, border: `1px solid ${solid}55`, color: solid }}
              >
                {tran.bestValue}
              </div>
              <div className="text-right">

                <h1 className="text-4xl font-bold leading-none">
                  {match}%
                </h1>

                <p className="text-sm text-gray-300 mt-1">
                  {tran.budgetMatch}
                </p>

              </div>
            </div>

            <div>
              <h1 className="text-[44px] font-semibold leading-none">{city}</h1>
              <p className="text-gray-300 mt-2 text-lg">{country}</p>
            </div>

            <div>

              <p className="
                text-sm
                text-gray-400
              ">
                {tran.totalEstimate}
              </p>
<<<<<<< Updated upstream

              <h1 className="
                text-5xl
                font-bold
                mt-2
              ">
                {symbol}{convertedPrice.toLocaleString()}
              </h1>

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                "
                style={{
                  color: isOverBudget ? "#ef4444" : solid, // Turns red if over budget!
                }}
              >
                {isOverBudget ? tran.overBudget : tran.underBudget}
                {symbol}{displaySavings.toLocaleString()}
              </p>

=======
>>>>>>> Stashed changes
            </div>
          </div>
        </div>

        <div className="h-[52%] px-6 py-6 flex flex-col justify-between">
          <div>
            <div className="h-4 w-full rounded-full overflow-hidden flex">
              <motion.div animate={{ width: `${(convertedTransportCost / convertedPrice) * 100}%` }} className="bg-cyan-400" />
              <motion.div animate={{ width: `${(convertedHotelCost / convertedPrice) * 100}%` }} className="bg-violet-400" />
              <motion.div animate={{ width: `${(convertedExperiencesCost / convertedPrice) * 100}%` }} className="bg-emerald-400" />
            </div>

            {/* LABELS */}
            <div
              className="
                flex
                justify-between

                mt-4

                text-sm
                font-medium
              "
            >

              <p className="text-cyan-400 text-sm font-medium">
                {tran.transport}: {symbol}{convertedTransportCost.toLocaleString()}
              </p>

              <p className="text-violet-400">
                {tran.accommodation}: {symbol}{convertedHotelCost.toLocaleString()}
              </p>

              <p className="text-emerald-400">
                {tran.food}: {symbol}{convertedExperiencesCost.toLocaleString()}
              </p>

            </div>
          </div>

          {/* AI INSIGHT */}
          <div
            className="
              mt-6

              rounded-[28px]

              p-5

              border border-white/10

              backdrop-blur-xl
            "
            style={{
              background: `${solid}12`,
            }}
          >

            {/* HEADER */}
            <div className="
              flex
              items-center
              gap-2
            ">

              <Sparkles
                size={18}
                color={solid}
              />

              <span
                className="
                  text-sm
                  font-semibold
                "
                style={{
                  color: solid,
                }}
              >
                {tran.aiInsight}
              </span>

            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-300 line-clamp-4">
              {trip?.aiInsight || defaultInsight}
            </p>
          </div>

          <Link
            href={`/destination/${city.toLowerCase()}?country=${country}&budget=${convertedBudget}&price=${convertedPrice}&currency=${currency}&days=${tripDays}&origin=${origin}&flight=${convertedTransportCost}&hotel=${convertedHotelCost}&food=${convertedExperiencesCost}`}
            className="mt-6 flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
          >
            <span>
              {tran.prepareBooking}
            </span>
            <CircleArrowRightIcon
              size={25}
              color={solid}
            />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}





