"use client";

import { useTranslation } from "@/context/hooks/useTranslations";

export default function TopAgentsBar() {
  const tran = useTranslation();

  return (
    <div
      className="
        flex
        justify-end

      "
    >

      <div
        className="
          flex
          items-center
          gap-4

          px-6
          py-4

          rounded-4xl

          bg-white/5
          border border-white/10

          backdrop-blur-xl
        "
      >

        <div className="
          w-3
          h-3
          rounded-full
          bg-emerald-400
        " />

        <span className="text-sm text-gray-300">
          {tran.aiMessage}
        </span>

        <div className="flex -space-x-3">

          {[1, 2, 3].map((i) => (

            <div
              key={i}
              className="
                w-10
                h-10

                rounded-full

                border-2 border-[#07111A]

                bg-gradient-to-br
                from-violet-400
                to-cyan-400
              "
            />

          ))}

        </div>

      </div>

    </div>
  );
}