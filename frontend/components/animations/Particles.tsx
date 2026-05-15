"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
}

export default function Particles() {

  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {

    const generated = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 14 + 6,
      duration: Math.random() * 10 + 6,
    }));

    setParticles(generated);

  }, []);

  return (
    <div
      className="
        fixed
        inset-0
        z-[1]
        overflow-hidden
        pointer-events-none
      "
    >

      {particles.map((particle) => (

        <motion.div
          key={particle.id}
          className="
            absolute
            rounded-full

            bg-white/30

            blur-md
          "
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -80, 0],
            opacity: [0.15, 0.6, 0.15],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

      ))}

    </div>
  );
}


// "use client";

// export default function Particles() {

//   return (
//     <div className="absolute inset-0 overflow-hidden">

//       {[...Array(40)].map((_, i) => (

//         <div
//           key={i}
//           className="
//             absolute
//             w-1
//             h-1
//             bg-white/20
//             rounded-full
//             animate-pulse
//           "
//           style={{
//             left: `${Math.random() * 100}%`,
//             top: `${Math.random() * 100}%`,
//             animationDelay: `${Math.random() * 5}s`,
//           }}
//         />

//       ))}

//     </div>
//   );
// }