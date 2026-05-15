"use client";

import { TurkishLira } from "lucide-react";

interface Props {
  budget: number;
  setBudget: (value: number) => void;
}

export default function SearchIntentBar({
  budget,
  setBudget,
}: Props) {

  return (
    <div
      className="
        flex
        flex-wrap
        gap-6

        items-center

        p-6

        rounded-[32px]

        bg-white/5
        border border-white/10
        backdrop-blur-2xl
      "
    >

      {/* SEARCH */}
      <div
        className="
          flex-1
          min-w-[300px]
        "
      >

        <input
          placeholder="Where does your budget want to go?"
          className="
            w-full

            px-6
            py-5

            rounded-full

            bg-[#0D1721]

            border border-white/10

            outline-none

            text-lg
            text-white

            shadow-[0_0_25px_rgba(255,255,255,0.05)]
          "
        />

      </div>

      {/* BUDGET */}
      <div
        className="
          flex
          flex-col
          gap-2

          min-w-[220px]
        "
      >

        <div className="flex items-center gap-2">

          <TurkishLira size={16} />

          <span className="text-sm text-gray-400">
            Budget
          </span>

        </div>

        <input
          type="range"
          min={1000}
          max={20000}
          step={500}
          value={budget}
          onChange={(e) =>
            setBudget(Number(e.target.value))
          }
          className="
            accent-emerald-400
          "
        />

        <span className="text-2xl font-semibold">
          ₺{budget.toLocaleString()}
        </span>

      </div>

      {/* PASSENGERS */}
      <div
        className="
          px-6
          py-5

          rounded-2xl

          bg-white/5
          border border-white/10
        "
      >
        2 Pax
      </div>

      {/* PASSPORT */}
      <div
        className="
          px-6
          py-5

          rounded-2xl

          bg-white/5
          border border-white/10
        "
      >
        🇹🇷 Turkish Passport
      </div>

    </div>
  );
}