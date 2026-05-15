"use client";

import { motion } from "framer-motion";

import GlassCard from "../cards/GlassCard";

const destinations = [1, 2, 3];

export default function ResultsGrid() {

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-10
        mt-24
      "
    >

      {destinations.map((item) => (

        <motion.div
          key={item}
          variants={{
            hidden: {
              opacity: 0,
              y: 100,
            },
            visible: {
              opacity: 1,
              y: 0,
            },
          }}
          transition={{
            duration: 1,
            type: "spring",
          }}
        >
          <GlassCard />
        </motion.div>

      ))}

    </motion.div>
  );
}