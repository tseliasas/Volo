"use client";

import {
  Compass,
  Briefcase,
  Sparkles,
  User,
  Settings,
} from "lucide-react";

const items = [
  {
    icon: Compass,
    label: "Discover",
    active: true,
  },
  {
    icon: Briefcase,
    label: "Itineraries",
  },
  {
    icon: Sparkles,
    label: "Agents",
  },
  {
    icon: User,
    label: "Profile",
  },
  {
    icon: Settings,
    label: "Settings",
  },
];

export default function Sidebar() {

  return (
    <div
      className="
        w-[120px]

        border-r border-white/5

        flex
        flex-col
        justify-between

        py-8
      "
    >

      {/* LOGO */}
      {/* <div className="px-6">

        <h1 className="text-4xl font-bold">
          Volo
        </h1>

        <p className="text-gray-500 text-sm mt-2">
          Travel your budget.
        </p>

      </div> */}

      {/* NAV */}
      <div className="flex flex-col gap-6">

        {items.map((item, index) => {

          const Icon = item.icon;

          return (
            <button
              key={index}
              className={`
                mx-4

                flex
                flex-col
                items-center
                gap-3

                py-4

                rounded-2xl

                transition

                ${
                  item.active
                    ? "bg-emerald-400/10 border border-emerald-400/20"
                    : "hover:bg-white/5"
                }
              `}
            >

              <Icon size={22} />

              <span className="text-xs">
                {item.label}
              </span>

            </button>
          );
        })}

      </div>

      <div />

    </div>
  );
}