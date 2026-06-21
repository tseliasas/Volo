"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { CircleArrowRightIcon } from "lucide-react";
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
  emerald: "#4ADE80",
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

  const symbol = currencySymbol(currency);

    const { days, breakdown } = trip;
    const transportCost = trip.breakdown.transport;
    const hotelCost = trip.breakdown.accommodation;
    const experiencesCost = trip.breakdown.dailyAllowance;
    // Converted Break down of costs...
    const convertedTransportCost = convertPrice(transportCost, currency);
    const convertedHotelCost = convertPrice(hotelCost, currency);
    const convertedExperiencesCost = convertPrice(experiencesCost, currency);

    const tripDays = trip?.breakdown?.dailyAllowance ? Math.round(trip.breakdown.dailyAllowance / 1000) : 3;

    const savings = convertedBudget - convertedPrice;
    const rawSavings = convertedBudget - convertedPrice;
    const isOverBudget = rawSavings < 0;
    const displaySavings = Math.abs(rawSavings); // Removes the negative sign!

    const AIinsight = "";

  const solid = solidMap.emerald;

  return (

    <motion.div
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      transition={{
        type: "spring",
        stiffness: 220,
      }}
      className="
        relative

        w-[calc(100vw-2rem)]
        max-w-[340px]
        h-[800px]

        rounded-[38px]

        overflow-hidden

        shrink-0
      "
    >

      {/* CARD */}
      <div
        className="
          relative
          z-10

          h-full

          rounded-[38px]

          border border-white/10

          overflow-hidden

          bg-[#0B1520]
        "
      >

        {/* TOP SECTION */}
        <div className="relative h-[48%]">

          {/* IMAGE */}
          <div
            className="
              absolute
              inset-0

              bg-cover
              bg-center
            "
            style={{
              backgroundImage: `url(${image})`,
            }}
          />

          {/* OVERLAY */}
          <div
            className="
              absolute
              inset-0

              bg-black/45
            "
          />

          {/* CONTENT */}
          <div
            className="
              relative
              z-10

              h-full

              p-6

              flex
              flex-col
              justify-between
            "
          >

            {/* TOP BAR */}
            <div className="flex justify-between items-start">

              {/* CATEGORY */}
              <div
                className="
                  px-4
                  py-2

                  rounded-full

                  text-sm
                  font-medium

                "
                style={{
                  background: "#0B1520",
                  border: `1px solid ${solid}`,
                  color: solid,
                }}
              >
                {tran.bestValue}
              </div>

              {/* MATCH */}
              <div className="text-right">

                <h1 className="text-4xl font-bold leading-none">
                  {match}%
                </h1>

                <p className="text-sm text-gray-300 mt-1">
                  {tran.budgetMatch}
                </p>

              </div>

            </div>

            {/* LOCATION */}
            <div>

              <h1
                className="
                  text-[44px]
                  font-semibold

                  leading-none
                "
              >
                {city}
              </h1>

              <p className="
                text-gray-300
                mt-2
                text-lg
              ">
                {country}
              </p>

            </div>

            {/* ESTIMATE */}
            <div>

              <p className="
                text-sm
                text-gray-400
              ">
                {tran.totalEstimate}
              </p>

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

            </div>

          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div
          className="
            h-[52%]

            px-6
            py-6

            flex
            flex-col
            justify-between
          "
        >

          {/* ALLOCATION BAR */}
          {/* ALLOCATION BAR */}
          <div>

            <div
              className="
                h-4
                w-full

                rounded-full
                overflow-hidden

                flex
              "
            >

              <motion.div
              animate={{
                width: `${(convertedTransportCost / convertedPrice) * 100}%`,
              }}
              className="bg-emerald-300"
            />

            <motion.div
              animate={{
                width: `${(convertedHotelCost / convertedPrice) * 100}%`,
              }}
              className="bg-emerald-500"
            />

            <motion.div
              animate={{
                width: `${(convertedExperiencesCost / convertedPrice) * 100}%`,
              }}
              className="bg-emerald-700"
            />

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

              <p className="text-emerald-300 text-sm font-medium">
                {tran.transport}: {symbol}{convertedTransportCost.toLocaleString()}
              </p>

              <p className="text-emerald-400">
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

            "
            style={{
              background: "#0F1B28",
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

            {/* TEXT */}
            <p
              className="
                mt-4
                text-sm
                leading-relaxed
                text-gray-300
                line-clamp-4  {/* <--- THIS PREVENTS OVERFLOW */}
              "
            >
              {trip?.aiInsight}
            </p>

          </div>

          {/* CTA */}
          <Link
            href={`/destination/${city.toLowerCase()}?country=${country}&budget=${convertedBudget}&price=${convertedPrice}&currency=${currency}&days=${days}&origin=${origin}&flight=${convertedTransportCost}&hotel=${convertedHotelCost}&food=${convertedExperiencesCost}`}
            className="
              mt-6
              flex
              items-center
              justify-center
              gap-3
              py-4
              rounded-2xl
              border border-white/10
              bg-white/5
              hover:bg-white/10
              transition-all
            "
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

