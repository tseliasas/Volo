"use client";

import { image } from "framer-motion/client";
import { ImagePlus } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onAnalyze: (hasImage: boolean) => void;
}

export default function SearchBar({
  onAnalyze,
}: SearchBarProps) {

const [image, setImage] = useState<File | null>(null);
  return (
    <div
      className="
        flex
        items-center
        gap-3

        w-full
        max-w-4xl

        p-3

        rounded-full

        bg-white/10
        backdrop-blur-xl

        border border-white/20
      "
    >

      {/* TEXT INPUT */}
      <input
        type="text"
        placeholder="Describe your ideal travel vibe..."
        className="
          flex-1
          bg-transparent
          outline-none
          px-4
          py-4

          text-white
          placeholder:text-gray-400
        "
      />

      {/* IMAGE UPLOAD */}
      <label
        className="
          cursor-pointer

          p-4

          rounded-full

          bg-white/10
          hover:bg-white/20

          transition
        "
      >

        <ImagePlus size={20} />

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
                setImage(e.target.files[0]);
                }
            }}
        />

      </label>

      {/* ANALYZE BUTTON */}
      <button
        onClick={() => onAnalyze(!!image)}
        className="
          px-6
          py-4

          rounded-full

          bg-cyan-400/20
          border border-cyan-300/30

          hover:bg-cyan-300/30

          transition
        "
      >
        Analyze
      </button>

    </div>
  );
}