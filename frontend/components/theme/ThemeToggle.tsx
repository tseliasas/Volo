"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {

  const [dark, setDark] = useState(true);

  useEffect(() => {

    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="
        fixed
        top-6
        right-6
        z-50

        p-3

        rounded-full

        bg-white/10
        border border-white/20
        backdrop-blur-xl
      "
    >

      {dark ? <Sun size={18} /> : <Moon size={18} />}

    </button>
  );
}