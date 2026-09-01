"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Plane, LogOut } from "lucide-react";
import { useTranslation } from "@/context/hooks/useTranslations";

const ctaGradient = { background: "linear-gradient(to bottom, #60A5FA, #2563EB)" };

interface HeroNavProps {
  hasProfile: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onDiscoverClick?: () => void;
  language: "en" | "tr";
  setLanguage: (v: "en" | "tr") => void;
}

export default function HeroNav({ hasProfile, onLoginClick, onLogout, onDiscoverClick, language, setLanguage }: HeroNavProps) {
  const pathname = usePathname();
  const tran = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { label: tran.discover, href: "/", onClick: onDiscoverClick },
    { label: tran.itineraries, href: "/itineraries" },
    { label: tran.agents, href: "/agents" },
    { label: tran.profile, href: "/profile" },
    { label: tran.settings, href: "/settings" },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const LangToggle = ({ compact }: { compact?: boolean }) => (
    <div className={`flex items-center gap-1 rounded-full bg-white/10 p-1 backdrop-blur-lg ${compact ? "w-fit" : ""}`}>
      <button
        onClick={() => setLanguage("tr")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${language === "tr" ? "bg-white text-[#0A1929]" : "text-white/70 hover:text-white"}`}
      >
        TR
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${language === "en" ? "bg-white text-[#0A1929]" : "text-white/70 hover:text-white"}`}
      >
        EN
      </button>
    </div>
  );

  return (
    <nav className="relative z-30 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
      <Link href="/" onClick={() => onDiscoverClick?.()} className="flex items-center gap-2 text-white">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-400">
          <Plane className="-ml-0.5 h-4 w-4 -rotate-45 text-[#0A1929]" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-semibold tracking-tight">volo</span>
      </Link>

      {/* DESKTOP NAV */}
      <div className="hidden items-stretch gap-3 md:flex">
        <div className="flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-1.5 backdrop-blur-lg">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={l.onClick}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                pathname === l.href ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <LangToggle />

        {hasProfile ? (
          <button
            onClick={onLogout}
            style={ctaGradient}
            className="flex items-center gap-1.5 self-stretch rounded-full px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <LogOut size={14} /> Logout
          </button>
        ) : (
          <button
            onClick={onLoginClick}
            style={ctaGradient}
            className="self-stretch rounded-full px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Login
          </button>
        )}
      </div>

      {/* MOBILE HAMBURGER */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Toggle menu"
        className="relative z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-lg md:hidden"
      >
        <Menu className={`absolute h-5 w-5 transition-all duration-300 ${isOpen ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
        <X className={`absolute h-5 w-5 transition-all duration-300 ${isOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
      </button>

      {/* MOBILE OVERLAY */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* MOBILE DRAWER */}
      <div
        className={`fixed right-0 top-0 z-40 flex h-full w-72 flex-col bg-black/90 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-2 px-6 pt-24">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => {
                l.onClick?.();
                setIsOpen(false);
              }}
              className="rounded-xl px-4 py-3.5 text-base font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? "translateX(0)" : "translateX(24px)",
                transition: "opacity 400ms, transform 400ms, background-color 150ms, color 150ms",
                transitionDelay: isOpen ? `${(i + 1) * 60}ms` : "0ms",
              }}
            >
              {l.label}
            </Link>
          ))}

          <div className="mt-4 px-4">
            <LangToggle compact />
          </div>
        </div>

        <div
          className="mt-auto px-6 pb-10"
          style={{
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 400ms, transform 400ms",
            transitionDelay: isOpen ? "300ms" : "0ms",
          }}
        >
          {hasProfile ? (
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              style={ctaGradient}
              className="w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setIsOpen(false);
                onLoginClick();
              }}
              style={ctaGradient}
              className="w-full rounded-full px-6 py-3.5 text-sm font-semibold text-white"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
