"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Bookmark, ArrowRight } from "lucide-react";
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

const solidMap: Record<string, string> = {
  emerald: "#60A5FA",
};

export default function PortfolioCard({
  city,
  country,
  match,
  budget,
  price,
  image,
  trip,
  currency,
  origin = "ADB",
}: Props) {

  const convertedBudget = convertBudget(budget, currency);
  const convertedPrice = convertPrice(price, currency);
  const tran = useTranslation();
  const [isSaved, setIsSaved] = useState(false);

  const symbol = currencySymbol(currency);

  const { days } = trip;
  const transportCost = trip.breakdown.transport;
  const hotelCost = trip.breakdown.accommodation;
  const experiencesCost = trip.breakdown.dailyAllowance;
  // Converted breakdown of costs...
  const convertedTransportCost = convertPrice(transportCost, currency);
  const convertedHotelCost = convertPrice(hotelCost, currency);
  const convertedExperiencesCost = convertPrice(experiencesCost, currency);

  const rawSavings = convertedBudget - convertedPrice;
  const isOverBudget = rawSavings < 0;
  const displaySavings = Math.abs(rawSavings); // Removes the negative sign!

  const solid = solidMap.emerald;

  const allocation = [
    { label: tran.transport, value: convertedTransportCost, dot: "bg-blue-300" },
    { label: tran.accommodation, value: convertedHotelCost, dot: "bg-blue-500" },
    { label: tran.food, value: convertedExperiencesCost, dot: "bg-blue-700" },
  ];

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 220 }}
      className="relative w-[calc(100vw-2rem)] max-w-[340px] h-[800px] rounded-[32px] overflow-hidden shrink-0 bg-[#102436] border border-white/10 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
    >
      {/* PHOTO BAND */}
      <div className="relative h-[54%] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${image})` }}
        />
        {/* Gradient bed so the caption + panel below blend seamlessly into the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#102436] via-black/25 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

        {/* TOP ROW: pill badge + bookmark */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/25 text-white">
            {tran.bestValue}
          </span>

          <button
            onClick={() => setIsSaved((s) => !s)}
            aria-label="Save destination"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors backdrop-blur-md ${
              isSaved ? "bg-blue-400 text-white" : "bg-white/90 text-[#0A1929] hover:bg-white"
            }`}
          >
            <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* MATCH PILL */}
        <div className="absolute top-20 left-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-xs font-semibold text-white">{match}% {tran.budgetMatch}</span>
          </div>
        </div>

        {/* CITY CAPTION */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-[42px] font-semibold leading-none text-white">{city}</h1>
          <p className="text-white/70 mt-2 text-base tracking-wide">{country}</p>
        </div>
      </div>

      {/* DETAIL SHEET */}
      <div className="relative h-[46%] -mt-8 rounded-t-[32px] bg-[#102436] px-6 pt-7 pb-6 flex flex-col justify-between overflow-hidden">
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">{tran.totalEstimate}</p>
              <h1 className="text-4xl font-bold mt-1 text-white">
                {symbol}{convertedPrice.toLocaleString()}
              </h1>
            </div>
            <p
              className="text-sm font-medium text-right"
              style={{ color: isOverBudget ? "#f87171" : solid }}
            >
              {isOverBudget ? tran.overBudget : tran.underBudget}
              {symbol}{displaySavings.toLocaleString()}
            </p>
          </div>

          {/* ALLOCATION BAR */}
          <div className="mt-5 h-2 w-full rounded-full overflow-hidden flex bg-white/5">
            {allocation.map((a, i) => (
              <motion.div
                key={i}
                animate={{ width: `${(a.value / convertedPrice) * 100}%` }}
                className={a.dot}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {allocation.map((a, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${a.dot}`} />
                {a.label} · {symbol}{a.value.toLocaleString()}
              </span>
            ))}
          </div>
        </div>

        {/* AI INSIGHT */}
        <div className="rounded-2xl p-4 bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles size={16} color={solid} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: solid }}>
              {tran.aiInsight}
            </span>
          </div>
          <p className="mt-2.5 text-sm leading-relaxed text-gray-300 line-clamp-3">
            {trip?.aiInsight}
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/destination/${city.toLowerCase()}?country=${country}&budget=${convertedBudget}&price=${convertedPrice}&currency=${currency}&days=${days}&origin=${origin}&flight=${convertedTransportCost}&hotel=${convertedHotelCost}&food=${convertedExperiencesCost}`}
          className="mt-2 flex items-center justify-between gap-3 pl-6 pr-2 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
        >
          <span className="font-medium text-white text-sm">{tran.prepareBooking}</span>
          <span className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5 shrink-0">
            <ArrowRight size={18} />
          </span>
        </Link>
      </div>
    </motion.div>
  );
}
