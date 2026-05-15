"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const routes = [
  {
    name: "Fastest",
    color: "bg-cyan-400",
    description: "Shortest travel duration.",
  },
  {
    name: "Scenic",
    color: "bg-emerald-400",
    description: "Most visually beautiful route.",
  },
  {
    name: "Optimal",
    color: "bg-white",
    description:
      "Balanced using Bayesian scoring.",
  },
];

export default function RouteSelector() {

  const [active, setActive] = useState("Optimal");

  return (
    <div className="mt-12">

      <div className="flex gap-4">

        {routes.map((route) => (

          <motion.button
            key={route.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActive(route.name)}
            className={`
              relative
              px-6
              py-4
              rounded-2xl

              backdrop-blur-xl
              border border-white/20

              transition

              ${
                active === route.name
                  ? "bg-white/20"
                  : "bg-white/5"
              }
            `}
          >

            <div className="flex items-center gap-3">

              <div
                className={`
                  w-3
                  h-3
                  rounded-full
                  ${route.color}
                `}
              />

              <span>{route.name}</span>

            </div>

          </motion.button>

        ))}

      </div>

      {/* Route Details */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          mt-8

          p-8

          rounded-3xl

          bg-white/10
          border border-white/20
          backdrop-blur-xl
        "
      >

        <h2 className="text-3xl font-bold">
          {active} Route
        </h2>

        <p className="text-gray-300 mt-4">
          {
            routes.find(
              (r) => r.name === active
            )?.description
          }
        </p>

        <div className="mt-6 flex gap-4">

          <div className="px-4 py-2 rounded-full bg-white/10">
            24 mins
          </div>

          <div className="px-4 py-2 rounded-full bg-white/10">
            Safety 92%
          </div>

          <div className="px-4 py-2 rounded-full bg-white/10">
            Scenic 88%
          </div>

        </div>

      </motion.div>

    </div>
  );
}