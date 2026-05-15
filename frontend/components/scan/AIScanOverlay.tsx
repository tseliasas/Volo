"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  active: boolean;
}

export default function AIScanOverlay({
  active,
}: Props) {

  return (
    <AnimatePresence>

      {active && (

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="
            fixed
            inset-0
            z-[100]

            bg-black/80
            backdrop-blur-2xl

            flex
            items-center
            justify-center
          "
        >

          <div className="relative">

            {/* MAIN SCAN BOX */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="
                relative

                w-[320px]
                h-[320px]

                rounded-3xl

                border border-cyan-400/30

                overflow-hidden

                bg-white/5
                backdrop-blur-xl
              "
            >

              {/* SCANNING LINE */}
              <motion.div
                animate={{
                  y: [0, 300, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="
                  absolute
                  left-0

                  w-full
                  h-1

                  bg-cyan-300

                  shadow-[0_0_20px_#00F5FF]
                "
              />

              {/* CENTER GLOW */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="
                  absolute
                  inset-0

                  bg-cyan-400/10
                  blur-3xl
                "
              />

              {/* AI GRID */}
              <div
                className="
                  absolute
                  inset-0

                  opacity-20

                  bg-[radial-gradient(circle,_rgba(0,255,255,0.2)_1px,_transparent_1px)]
                  [background-size:20px_20px]
                "
              />

            </motion.div>

            {/* AI TEXT */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="
                mt-10
                text-center
              "
            >

              <h2 className="text-2xl font-semibold">
                AI Vibe Analysis
              </h2>

              <p className="text-gray-400 mt-3">
                Extracting emotional atmosphere...
              </p>

              <div className="flex justify-center gap-2 mt-6">

                {[1, 2, 3].map((dot) => (

                  <motion.div
                    key={dot}
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: dot * 0.2,
                    }}
                    className="
                      w-3
                      h-3
                      rounded-full
                      bg-cyan-300
                    "
                  />

                ))}

              </div>

            </motion.div>

          </div>

        </motion.div>

      )}

    </AnimatePresence>
  );
}