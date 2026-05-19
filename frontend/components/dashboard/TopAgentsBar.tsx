import { useTranslation } from "@/context/hooks/useTranslations";
import React from "react";

export default function TopAgentsBar() {
  // High-quality professional avatar placeholders representing your "AI Agents"
  const agents = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces"
  ];

  const tran = useTranslation();

  return (
    <div className="flex items-center gap-4 bg-[#0B1520] border border-cyan-400/20 rounded-full pl-5 pr-1.5 py-1.5 shadow-[0_0_20px_rgba(0,255,255,0.05)] transition-all hover:bg-[#0c1825] cursor-default">
      
      {/* The Pulsing Online Indicator & Text */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span className="text-xs font-semibold text-emerald-100/70 tracking-wide">
          {tran.aiMessage}
        </span>
      </div>

      {/* The Overlapping Facepile */}
      <div className="flex -space-x-3">
        {agents.map((src, i) => (
          <div 
            key={i} 
            className="relative w-8 h-8 rounded-full border-2 border-[#0B1520] overflow-hidden shadow-sm hover:-translate-y-1 hover:scale-110 transition-all duration-300 z-10 hover:z-20"
          >
            <img src={src} alt={`AI Agent ${i + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
      
    </div>
  );
}