import { Globe2, Plane, Wallet, Sparkles, MapPin } from "lucide-react";

export default function VoloIdleState() {
  return (
    <div className="w-full h-[450px] flex flex-col items-center justify-center rounded-[28px] border border-emerald-500/20 bg-[#0B1120] relative overflow-hidden mt-8 shadow-[inset_0_0_100px_rgba(16,185,129,0.05)]">
      
      {/* 1. THE HACKER GRID (Cranked up opacity from 0.05 to 0.15) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.15)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)]" />

      {/* 2. THE ATMOSPHERIC GLOW (New! Adds a massive soft neon backlight) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center w-full mt-4">
        
        {/* 3. THE ANIMATED AI CORE (Added w-64 h-64 to create a strict bounding box to prevent text overlap!) */}
        <div className="relative flex items-center justify-center w-64 h-64 mb-8 shrink-0">
          
          {/* Outer Reverse-Spinning Finance Ring (Brighter borders) */}
          <div className="absolute inset-0 border-[1.5px] border-emerald-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]">
            <div className="absolute top-1/2 -right-5 -translate-y-1/2 bg-[#050B14] p-2.5 rounded-full border border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.8)]">
              <Wallet className="w-5 h-5 text-purple-300" />
            </div>
            <div className="absolute bottom-2 left-8 bg-[#050B14] p-2 rounded-full border border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)]">
              <MapPin className="w-4 h-4 text-emerald-300" />
            </div>
          </div>

          {/* Inner Spinning Travel Ring (Brighter cyan integration) */}
          <div className="absolute w-44 h-44 border-[1.5px] border-emerald-400/50 rounded-full animate-[spin_8s_linear_infinite] border-dashed">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#050B14] p-2.5 rounded-full border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]">
              <Plane className="w-5 h-5 text-cyan-300" />
            </div>
          </div>

          {/* Core Pulsing Orb (Cranked up the shadow from 40px to 60px) */}
          <div className="absolute w-28 h-28 border-2 border-emerald-400/60 rounded-full animate-ping opacity-30" />
          <div className="w-20 h-20 bg-emerald-950 border-2 border-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(52,211,153,0.8)] z-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent" />
            <Globe2 className="text-emerald-300 w-10 h-10 animate-pulse relative z-10" />
          </div>
        </div>

        {/* 4. THE TYPOGRAPHY (Added glowing text gradients) */}
        <div className="text-center relative z-10 flex flex-col items-center px-4">
          <h3 className="text-3xl font-black tracking-wide flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300 pb-1">
            <Sparkles className="text-emerald-400 w-6 h-6" />
            Volo Engine Idle
          </h3>
          <p className="text-emerald-100/60 text-sm mt-3 max-w-md leading-relaxed font-medium">
            Awaiting financial parameters. Input your budget and intent above to initialize the predictive routing sequence.
          </p>
        </div>
        
      </div>
    </div>
  );
}