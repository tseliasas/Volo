import { Fingerprint, Globe, Wallet } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="font-sans max-w-6xl mx-auto w-full">
      
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* LEFT COLUMN: Identity Card */}
        <div className="w-full lg:w-[400px] shrink-0 bg-[#0B1520] border border-cyan-400/20 rounded-[32px] p-8 shadow-[0_0_40px_rgba(0,255,255,0.05)]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 p-1">
              <div className="w-full h-full rounded-full bg-[#07111A] flex items-center justify-center">
                <Fingerprint className="text-cyan-400" size={32} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Alex Demo</h2>
              <p className="text-cyan-400 text-sm font-medium uppercase tracking-widest">Thrifty Explorer</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
              <Wallet className="text-emerald-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Saved by AI</p>
                <p className="text-xl font-bold">₺12,450</p>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
              <Globe className="text-violet-400" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Countries Explored</p>
                <p className="text-xl font-bold">4</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Preferences */}
        <div className="flex-1 bg-[#0B1520] border border-white/5 rounded-[32px] p-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
             AI Routing Parameters
          </h3>
          
          <div className="space-y-8 mt-8">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Pace of Travel</span>
                <span className="text-white font-bold">Fast / Aggressive</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full w-[80%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Accommodation Priority</span>
                {/* Syntax perfectly fixed here using &gt; */}
                <span className="text-white font-bold">Location &gt; Luxury</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2 rounded-full w-[30%]"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}