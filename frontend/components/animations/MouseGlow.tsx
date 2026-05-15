"use client";

import { useEffect, useState } from "react";

export default function MouseGlow() {

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {

    const updateMouse = (e: MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", updateMouse);

    return () =>
      window.removeEventListener(
        "mousemove",
        updateMouse
      );

  }, []);

  return (
    <div
      className="
        pointer-events-none
        fixed
        inset-0
        z-0
      "
    >
      <div
        className="
          absolute
          w-[500px]
          h-[500px]
          rounded-full
          blur-3xl
          opacity-20
          bg-cyan-400
          transition-all
          duration-300
        "
        style={{
          left: position.x - 250,
          top: position.y - 250,
        }}
      />
    </div>
  );
}