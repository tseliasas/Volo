"use client";

import { motion, AnimatePresence } from "framer-motion";

import RouteSelector from "../routes/RouteSelector";
import GuardianPulse from "../guardian/GuardianPulse";
import CinematicMap from "../map/CinematicMap";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DestinationModal({
  open,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed inset-0 z-50
            bg-black/70
            backdrop-blur-xl
            flex items-center justify-center
            p-6
          "
        >
          <motion.div
            layoutId="destination-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="
              relative
              w-full max-w-6xl
              h-[85vh]

              rounded-3xl
              overflow-y-auto

              bg-white/10
              border border-white/20
              backdrop-blur-2xl

              p-8
            "
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold">
                Sunset Pier
              </h1>

              <button
                onClick={onClose}
                className="text-gray-300 hover:text-white"
              >
                Close
              </button>
            </div>

            {/* ROUTE + GUARDIAN */}
            <div className="mt-8">
              <RouteSelector />
              <GuardianPulse />
            </div>

            {/* MAP SECTION */}
            <div className="mt-10">
              <CinematicMap />
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}