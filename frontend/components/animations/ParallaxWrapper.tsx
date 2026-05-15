"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function ParallaxWrapper({
  children,
}: {
  children: React.ReactNode;
}) {

  const { scrollY } = useScroll();

  const y = useTransform(
    scrollY,
    [0, 500],
    [0, -80]
  );

  return (
    <motion.div style={{ y }}>
      {children}
    </motion.div>
  );
}