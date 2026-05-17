"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { CircleArrowRightIcon } from "lucide-react";
import { convertBudget, convertPrice, currencySymbol } from "@/utils/currency";

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

  const convertedBudget = convertBudget(budget, currency);
  const convertedPrice = convertPrice(price, currency);

  const symbol = currencySymbol(currency);

    // These values will be dynamically generated from database...
    // Delete the old fake math (e.g., price * 0.12) and use the real data!
    const transportCost = trip.breakdown.transport;
    const hotelCost = trip.breakdown.accommodation;
    const experiencesCost = trip.breakdown.dailyAllowance;
    const tripDays = trip?.breakdown?.dailyAllowance ? Math.round(trip.breakdown.dailyAllowance / 1000) : 3;

    const savings = convertedBudget - convertedPrice;
    const rawSavings = convertedBudget - convertedPrice;
    const isOverBudget = rawSavings < 0;
    const displaySavings = Math.abs(rawSavings); // Removes the negative sign!

    const AIinsight = "";

  const glow = auraMap[color];
  const solid = solidMap[color];

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

        w-[340px]
        h-[800px]

        rounded-[38px]

        overflow-hidden

        shrink-0
      "
    >

      {/* AURA */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.5, 0.85, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          absolute
          inset-[-30px]

          rounded-[60px]

          blur-3xl

          z-0
        "
        style={{
          background: glow,
        }}
      />

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

            {/* AURA HALO */}
         <motion.div
            animate={{
                scale: [1, 1.08, 1],
                opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
            }}
            className="
                absolute

                inset-[-25px]

                rounded-[48px]

                blur-3xl

                z-0
            "
            style={{
                background: glow,
            }}
        />

        {/* EDGE GLOW */}
        <div
        className="
            absolute
            inset-0

            rounded-[26px]

            z-[2]

            pointer-events-none
        "
        style={{
            boxShadow: `0 0 40px ${glow}`,
        }}
        />

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

              bg-gradient-to-b
              from-black/10
              via-black/30
              to-[#0B1520]
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

                  backdrop-blur-xl
                "
                style={{
                  background: `${solid}25`,
                  border: `1px solid ${solid}55`,
                  color: solid,
                }}
              >
                Best Value
              </div>

              {/* MATCH */}
              <div className="text-right">

                <h1 className="text-4xl font-bold leading-none">
                  {match}%
                </h1>

                <p className="text-sm text-gray-300 mt-1">
                  Budget Match
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
                Total Estimate
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
                {isOverBudget ? "Over budget by " : "Under budget by "}
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
                width: `${(transportCost / convertedPrice) * 100}%`,
              }}
              className="bg-cyan-400"
            />

            <motion.div
              animate={{
                width: `${(hotelCost / convertedPrice) * 100}%`,
              }}
              className="bg-violet-400"
            />

            <motion.div
              animate={{
                width: `${(experiencesCost / convertedPrice) * 100}%`,
              }}
              className="bg-emerald-400"
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

              <p className="text-cyan-400 text-sm font-medium">
                Transport: {symbol}{Math.round(transportCost).toLocaleString()}
              </p>

              <p className="text-violet-400">
                Stay: {symbol}{Math.round(hotelCost).toLocaleString()}
              </p>

              <p className="text-emerald-400">
                Food & Fun: {symbol}{Math.round(experiencesCost).toLocaleString()}
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
                AI Insight
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
            href={`/destination/${city.toLowerCase()}?country=${country}&budget=${budget}&price=${price}&currency=${currency}&days=${tripDays}&origin=${origin}&flight=${transportCost}&hotel=${hotelCost}&food=${experiencesCost}`}
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
              Prepare Booking
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







// "use client";

// import { motion } from "framer-motion";

// interface Props {
//   city: string;
//   country: string;
//   match: number;
//   budget: number;
//   image: string;
//   color: string;
// }

// const auraMap: Record<string, string> = {
//   emerald: "rgba(74, 222, 128, 0.45)",
//   violet: "rgba(168, 85, 247, 0.45)",
//   cyan: "rgba(34, 211, 238, 0.45)",
//   orange: "rgba(251, 146, 60, 0.45)",
// };

// export default function PortfolioCard({
//   city,
//   country,
//   match,
//   budget,
//   image,
//   color,
// }: Props) {

//   const transport = budget * 0.12;
//   const stay = budget * 0.56;
//   const activities = budget * 0.32;

//   const glow = auraMap[color] || auraMap.cyan;

//   return (
//     <motion.div
//       whileHover={{
//         y: -8,
//         scale: 1.015,
//       }}
//       className="
//         relative

//             w-[300px]
//             h-[620px]

//             rounded-[36px]

//             overflow-hidden

//             border border-white/10

//             bg-[#0B1520]

//             shrink-0
//         "
//     >

//       {/* AURA HALO */}
//         <motion.div
//             animate={{
//                 scale: [1, 1.08, 1],
//                 opacity: [0.5, 0.8, 0.5],
//             }}
//             transition={{
//                 duration: 4,
//                 repeat: Infinity,
//                 ease: "easeInOut",
//             }}
//             className="
//                 absolute

//                 inset-[-25px]

//                 rounded-[48px]

//                 blur-3xl

//                 z-0
//             "
//             style={{
//                 background: glow,
//             }}
//         />

//         {/* EDGE GLOW */}
//         <div
//         className="
//             absolute
//             inset-0

//             rounded-[46px]

//             z-[2]

//             pointer-events-none
//         "
//         style={{
//             boxShadow: `0 0 40px ${glow}`,
//         }}
//         />

//       {/* IMAGE */}
//       <div
//         className="
//           absolute
//           inset-0

//           bg-cover
//           bg-center
//         "
//         style={{
//           backgroundImage: `url(${image})`,
//         }}
//       />

//       {/* OVERLAY */}
//       <div
//         className="
//           absolute
//           inset-0

//           bg-gradient-to-b
//           from-black/10
//           via-black/20
//           to-black/90
//         "
//       />

//       {/* GLASS REFLECTION */}
//         <div
//         className="
//             absolute

//             top-0
//             left-[-40%]

//             w-[60%]
//             h-full

//             bg-gradient-to-r
//             from-transparent
//             via-white/10
//             to-transparent

//             rotate-12

//             z-[2]

//             pointer-events-none
//         "
//         />

//       {/* CONTENT */}
//       <div
//         className="
//           relative
//           z-10

//           h-full

//           flex
//           flex-col
//           justify-end

//           5
//         "
//       >

//         {/* MATCH */}
//         <div
//           className="
//             inline-block
//             px-4
//             py-2

//             rounded-full

//             bg-emerald-400/20
//             border border-emerald-400/20

//             text-sm
//           "
//         >
//           {match}% Budget Match
//         </div>

//         {/* TITLE */}
//         <h1 className="text-[42px] leading-none font-semibold mt-5">
//           {city}
//         </h1>

//         <p className="text-gray-300 mt-2">
//           {country}
//         </p>

//         {/* AI INSIGHT */}
//         <div
//           className="
//             mt-5

//             p-5

//             rounded-2xl

//             bg-white/10
//             backdrop-blur-xl
//           "
//         >
//           <p className="text-sm text-gray-200 leading-relaxed">
//             Skip the flight. A 2-hour bus ride
//             keeps you under budget while leaving
//             enough room for a premium dinner.
//           </p>
//         </div>

//         {/* BUDGET BAR */}
//         <div className="mt-5">

//           <div className="
//             h-4
//             w-full

//             rounded-full
//             overflow-hidden

//             flex
//           ">

//             <motion.div
//               animate={{
//                 width: `${(transport / budget) * 100}%`,
//               }}
//               className="bg-cyan-400"
//             />

//             <motion.div
//               animate={{
//                 width: `${(stay / budget) * 100}%`,
//               }}
//               className="bg-violet-400"
//             />

//             <motion.div
//               animate={{
//                 width: `${(activities / budget) * 100}%`,
//               }}
//               className="bg-emerald-400"
//             />

//           </div>

//           <div
//             className="
//               flex
//               justify-between
//               mt-4

//               text-sm
//               text-gray-400
//             "
//           >
//             <span>Transport</span>
//             <span>Stay</span>
//             <span>Experiences</span>
//           </div>

//         </div>

//         {/* CTA */}
//         <button
//           className="
//             mt-5

//             py-4

//             rounded-2xl

//             bg-white/10
//             hover:bg-white/20

//             border border-white/10

//             transition
//           "
//         >
//           Prepare Booking
//         </button>

//       </div>

//     </motion.div>
//   );
// }