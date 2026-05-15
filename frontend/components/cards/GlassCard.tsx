"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import AuraRing from "../aura/AuraRing";
import DestinationModal from "../results/DestinationModal";


export default function GlassCard() {

  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div layoutId="destination-card"
        whileHover={{
          rotateX: 6,
          rotateY: -6,
          scale: 1.03,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
        }}
        className="
          relative
          w-[350px]
          h-[450px]
          rounded-3xl
          overflow-hidden
        "
      >

        {/* Aura */}
        <AuraRing />

        {/* Glass Reflection */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-br
            from-white/20
            to-transparent
            opacity-40
            pointer-events-none
            z-20
          "
        />

        {/* Main Card */}
        <div
          className="
            relative
            z-10
            h-full

            rounded-3xl
            overflow-hidden

            backdrop-blur-xl
            bg-white/10
            border border-white/20

            shadow-2xl

            p-6

            flex
            flex-col
            justify-between
          "
        >

          {/* Fake Image Area */}
          <div
            className="
              h-[220px]
              rounded-2xl

              bg-gradient-to-br
              from-cyan-400/30
              via-purple-500/20
              to-emerald-400/20

              border border-white/10
            "
          />

          {/* Content */}
          <div className="mt-6">

            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              Scenic Escape
            </p>

            <h1 className="text-4xl font-bold mt-3">
              Sunset Pier
            </h1>

            <p className="text-gray-300 mt-4">
              Calm coastal atmosphere with vibrant nightlife nearby.
            </p>

          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between mt-6">

            <div className="flex gap-3">

              <div
                className="
                  px-3
                  py-1
                  rounded-full
                  bg-emerald-400/20
                  text-sm
                "
              >
                Safe
              </div>

              <div
                className="
                  px-3
                  py-1
                  rounded-full
                  bg-cyan-400/20
                  text-sm
                "
              >
                Scenic
              </div>

            </div>

            <button
              onClick={() => setOpen(true)}
              className="
                px-5
                py-3

                rounded-2xl

                bg-cyan-400/20
                border border-cyan-300/30

                hover:bg-cyan-300/30

                transition
              "
            >
              Explore
            </button>

          </div>

        </div>

      </motion.div>

      {/* Modal */}
      <DestinationModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}