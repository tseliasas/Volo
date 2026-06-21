"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, Zap, Target, Activity } from "lucide-react";
import { useTranslation } from "@/context/hooks/useTranslations";

export default function AgentsPage() {
  // Hackathon trick: Live fluctuating latencies to make the dashboard feel alive!
  const [latencies, setLatencies] = useState([800, 1200, 2100]);

  const tran = useTranslation();

  useEffect(() => {
    const interval = setInterval(() => {
      setLatencies([
        800 + Math.floor(Math.random() * 50) - 25,   // Prime fluctuates slightly
        1200 + Math.floor(Math.random() * 80) - 40,  // Lux fluctuates more
        2100 + Math.floor(Math.random() * 200) - 100 // Hack scrapes heavily
      ]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const agents = [
    { name: "Volo Prime", type: tran.agentGeneralist, successRate: 98, speed: latencies[0], icon: Cpu, color: "emerald" },
    { name: "Volo Lux", type: tran.agentPremium, successRate: 94, speed: latencies[1], icon: Target, color: "emerald" },
    { name: "Volo Hack", type: tran.agentHack, successRate: 91, speed: latencies[2], icon: Zap, color: "emerald" },
  ];

  return (
    <div className="font-sans max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="mb-8 border-b border-white/10 pb-6 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white sm:text-5xl">
            {tran.routingCore}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 animate-pulse text-sm font-bold uppercase tracking-widest">
          <Activity size={16} /> {tran.systemsOnline}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          
          // Safety mappings for Tailwind
          const colorStyles: Record<string, string> = {
            emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          };

          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex flex-col gap-5 bg-[#0B1520] border border-white/5 rounded-2xl p-5 hover:bg-white/5 transition-colors sm:flex-row sm:items-center sm:gap-6 sm:p-6"
            >
              <div className={`p-4 rounded-2xl ${colorStyles[agent.color]} shrink-0`}>
                <Icon size={28} />
              </div>

              <div className="w-full shrink-0 sm:w-48">
                <h3 className="text-xl font-bold">{agent.name}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{agent.type}</p>
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">{tran.targetMatch}</span>
                  <span className={`text-${agent.color}-400 font-bold`}>{agent.successRate}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.successRate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`bg-${agent.color}-400 h-full rounded-full`}
                    style={{ backgroundColor: '#34d399' }}
                  />
                </div>
              </div>

              <div className="w-full shrink-0 text-left sm:w-24 sm:text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{tran.latency}</p>
                <p className={`font-mono text-lg transition-colors duration-300 ${agent.speed > 2000 ? 'text-orange-400' : 'text-white'}`}>
                  {agent.speed}ms
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
