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
        bottom-0
        left-0
        right-0
        h-20
        border-t
        border-white/5
        flex
        items-center
        bg-[#0A1929]
        z-50
        lg:top-0
        lg:bottom-auto
        lg:right-auto
        lg:h-screen
        lg:w-[120px]
        lg:border-r
        lg:border-t-0
        lg:flex-col
        lg:justify-between
        lg:py-8
      "
    >
      {/* NAV */}
      <div className="flex w-full items-center justify-around gap-1 px-2 lg:flex-col lg:gap-6 lg:px-0">
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
                flex
                flex-col
                items-center
                justify-center
                gap-1
                rounded-2xl
                px-2
                py-2
                transition-all
                min-w-0
                flex-1
                lg:mx-4
                lg:w-auto
                lg:gap-2
                lg:py-3.5
                lg:rounded-full

                ${
                  isActive
                    ? "bg-blue-400 text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.6)]"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Icon size={20} className="lg:h-[22px] lg:w-[22px]" />
              <span className="max-w-full truncate text-[10px] font-medium sm:text-xs">
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
