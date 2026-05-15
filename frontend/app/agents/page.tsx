"use client";

import { motion } from "framer-motion";
import { Cpu, Zap, Target } from "lucide-react";

const agents = [
  { name: "Volo Prime", type: "Generalist AI", successRate: 98, speed: "0.8s", icon: Cpu, color: "cyan" },
  { name: "Volo Lux", type: "Premium/Comfort Specialist", successRate: 94, speed: "1.2s", icon: Target, color: "violet" },
  { name: "Volo Hack", type: "Extreme Budget Scraper", successRate: 91, speed: "2.1s", icon: Zap, color: "emerald" },
];

export default function AgentsPage() {
  return (
    <div className="font-sans max-w-4xl mx-auto w-full">
      
      <div className="mb-10 border-b border-white/10 pb-6">
        <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-violet-500 drop-shadow-lg">
          Routing Core
        </h1>
        <p className="text-sm text-violet-400/80 font-bold uppercase tracking-[0.2em] mt-2">Active AI Agent Models</p>
      </div>

      <div className="flex flex-col gap-4">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center gap-6 bg-[#0B1520] border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors"
            >
              <div className={`p-4 rounded-2xl bg-${agent.color}-500/10 text-${agent.color}-400 border border-${agent.color}-500/20 shrink-0`}>
                <Icon size={28} />
              </div>

              <div className="w-48 shrink-0">
                <h3 className="text-xl font-bold">{agent.name}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{agent.type}</p>
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Target Match Rate</span>
                  <span className={`text-${agent.color}-400 font-bold`}>{agent.successRate}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.successRate}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`bg-${agent.color}-400 h-full rounded-full`}
                  />
                </div>
              </div>

              <div className="w-24 shrink-0 text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Latency</p>
                <p className="font-mono text-lg text-white">{agent.speed}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}