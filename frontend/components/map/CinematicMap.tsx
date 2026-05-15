"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function CinematicMap() {
  const [activeRoute, setActiveRoute] = useState("optimal");

  return (
    <div className="relative mt-8">

      {/* AI NARRATION LAYER */}
      <div className="
        absolute top-4 left-4 z-20
        px-4 py-2
        rounded-xl
        bg-black/40
        border border-white/10
        backdrop-blur-xl
        text-sm text-white/80
      ">
        {activeRoute === "fast" && "AI: Optimizing for minimum travel time..."}
        {activeRoute === "scenic" && "AI: Enhancing visual experience via scenic corridors..."}
        {activeRoute === "optimal" && "AI: Balancing safety, speed, and experience..."}
      </div>

      {/* MAP */}
      <div className="
        relative
        w-full
        h-[420px]
        rounded-3xl
        overflow-hidden

        bg-gradient-to-br
        from-slate-900
        via-slate-800
        to-black

        border border-white/10
      ">

        {/* BACKGROUND GRID */}
        <div className="
          absolute inset-0
          opacity-20
          bg-[radial-gradient(circle,_rgba(0,255,255,0.15)_1px,_transparent_1px)]
          [background-size:22px_22px]
        " />

        {/* FLOATING PARTICLES */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * 600,
              y: Math.random() * 400,
              opacity: 0.2,
            }}
            animate={{
              y: [null, Math.random() * 400],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* ROUTES SVG */}
        <svg className="absolute inset-0 w-full h-full">

          {/* FAST */}
          <motion.path
            d="M 60 320 C 160 120, 320 120, 500 260"
            stroke={activeRoute === "fast" ? "#00F5FF" : "#00F5FF33"}
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 6"
            animate={{
                strokeDashoffset: [0, -40],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
            }}
          />

          {/* SCENIC */}
          <motion.path
            d="M 60 340 C 200 220, 340 180, 500 300"
            stroke={activeRoute === "scenic" ? "#00FFAE" : "#00FFAE33"}
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 6"
            animate={{
                strokeDashoffset: [0, -40],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
            }}
          />

          {/* OPTIMAL */}
          <motion.path
            d="M 60 300 C 220 140, 360 140, 500 240"
            stroke={activeRoute === "optimal" ? "#ffffff" : "#ffffff33"}
            strokeWidth="2"
            fill="none"
            strokeDasharray="8 6"
            animate={{
                strokeDashoffset: [0, -40],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
            }}
          />

        </svg>

        {/* ENERGY LIGHTNING DOT */}
        <motion.div
          className="
            absolute
            w-3 h-3
            rounded-full
            bg-white
            shadow-[0_0_25px_white]
          "
          animate={{
            x:
              activeRoute === "fast"
                ? 460
                : activeRoute === "scenic"
                ? 440
                : 480,

            y:
              activeRoute === "fast"
                ? 120
                : activeRoute === "scenic"
                ? 200
                : 160,
          }}
          transition={{ duration: 1 }}
        />

      </div>

      {/* ROUTE BUTTONS */}
      <div className="flex gap-3 mt-5">

        {["fast", "scenic", "optimal"].map((route) => (
          <button
            key={route}
            onClick={() => setActiveRoute(route)}
            className={`
              px-4 py-2
              rounded-full
              border border-white/20
              backdrop-blur-xl
              transition

              ${
                activeRoute === route
                  ? "bg-white/20"
                  : "bg-white/5"
              }
            `}
          >
            {route.toUpperCase()}
          </button>
        ))}

      </div>

    </div>
  );
}