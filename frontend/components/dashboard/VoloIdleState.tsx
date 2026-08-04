import { Globe2, Plane, Wallet, Sparkles, MapPin } from "lucide-react";

export default function VoloIdleState() {
  return (
    <div className="w-full min-h-[420px] flex flex-col items-center justify-center rounded-[32px] border border-white/10 bg-[#0E2130] relative overflow-hidden mt-8 px-4">
      
      <div className="relative z-10 flex flex-col items-center justify-center w-full mt-4">
        
        <div className="relative flex items-center justify-center w-52 h-52 mb-8 shrink-0 sm:w-64 sm:h-64">
          
          <div className="absolute inset-0 border-[1.5px] border-blue-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]">
            <div className="absolute top-1/2 -right-5 -translate-y-1/2 bg-[#0A1B29] p-2.5 rounded-full border border-blue-400">
              <Wallet className="w-5 h-5 text-blue-300" />
            </div>
            <div className="absolute bottom-2 left-8 bg-[#0A1B29] p-2 rounded-full border border-blue-400">
              <MapPin className="w-4 h-4 text-blue-300" />
            </div>
          </div>

          <div className="absolute w-36 h-36 border-[1.5px] border-blue-400/50 rounded-full animate-[spin_8s_linear_infinite] border-dashed sm:w-44 sm:h-44">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#0A1B29] p-2.5 rounded-full border border-blue-400">
              <Plane className="w-5 h-5 text-blue-300" />
            </div>
          </div>

          <div className="absolute w-28 h-28 border-2 border-blue-400/60 rounded-full animate-ping opacity-30" />
          <div className="w-20 h-20 bg-[#102436] border-2 border-blue-400 rounded-full flex items-center justify-center z-10 relative overflow-hidden">
            <Globe2 className="text-blue-300 w-10 h-10 animate-pulse relative z-10" />
          </div>
        </div>

        <div className="text-center relative z-10 flex flex-col items-center px-4">
          <h3 className="text-2xl font-black tracking-wide flex items-center gap-3 text-white pb-1 sm:text-3xl">
            <Sparkles className="text-blue-400 w-6 h-6" />
            Volo Engine Idle
          </h3>
          <p className="text-blue-100/60 text-sm mt-3 max-w-md leading-relaxed font-medium">
            Awaiting financial parameters. Input your budget and intent above to initialize the predictive routing sequence.
          </p>
        </div>
        
      </div>
    </div>
  );
}
