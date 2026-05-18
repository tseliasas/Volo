"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Briefcase,
  Sparkles,
  User,
  Settings,
} from "lucide-react";
import { useTranslation } from "@/context/hooks/useTranslations";





export default function Sidebar() {
  // 2. THE SMART HOOK: This tells us exactly what URL the user is currently on!
  const pathname = usePathname();

  const tran = useTranslation();

  // 1. ADDED hrefs to tell the links where to go
const items = [
  {
    icon: Compass,
    label: tran.discover,
    href: "/", 
  },
  {
    icon: Briefcase,
    label: tran.itineraries,
    href: "/itineraries",
  },
  {
    icon: Sparkles,
    label: tran.agents,
    href: "/agents",
  },
  {
    icon: User,
    label: tran.profile,
    href: "/profile",
  },
  {
    icon: Settings,
    label: tran.settings,
    href: "/settings",
  },
];


  return (
    <div
      className="
        fixed
        left-0
        top-0
        h-screen
        w-[120px]
        border-r
        border-white/5
        flex
        flex-col
        justify-between
        py-8
        bg-[#07111A]
        z-50
      "
    >
      {/* NAV */}
      <div className="flex flex-col gap-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          
          // 3. CHECK ACTIVE STATE: If the URL matches the link, it's active!
          const isActive = pathname === item.href;

          return (
            // 4. CHANGED <button> TO <Link>
            <Link
              key={index}
              href={item.href}
              className={`
                mx-4
                flex
                flex-col
                items-center
                gap-3
                py-4
                rounded-2xl
                transition-all
                border

                ${
                  isActive
                    ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                    : "border-transparent text-gray-500 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div />
    </div>
  );
}