"use client";

import { motion } from "framer-motion";

export default function FloatingOrbs() {
  return (
    <>
      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="
          absolute
          top-32
          left-1/2
          w-72
          h-72
          bg-cyan-400/20
          blur-3xl
          rounded-full
        "
      />

      <motion.div
        animate={{
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
        className="
          absolute
          top-20
          right-32
          w-56
          h-56
          bg-purple-500/20
          blur-3xl
          rounded-full
        "
      />
    </>
  );
}