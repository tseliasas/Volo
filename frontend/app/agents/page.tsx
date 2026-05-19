"use client";

<<<<<<< Updated upstream
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
    { name: "Volo Prime", type: tran.agentGeneralist, successRate: 98, speed: latencies[0], icon: Cpu, color: "cyan" },
    { name: "Volo Lux", type: tran.agentPremium, successRate: 94, speed: latencies[1], icon: Target, color: "violet" },
    { name: "Volo Hack", type: tran.agentHack, successRate: 91, speed: latencies[2], icon: Zap, color: "emerald" },
  ];

=======
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Zap, Target, Server } from "lucide-react";

// Base Stats for the AI Models
const coreAgents = [
  { 
    name: "Volo Prime", 
    type: "Generalist AI", 
    baseSuccess: 98, 
    baseSpeed: 0.8, 
    icon: Cpu, 
    theme: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", bar: "bg-cyan-400" } 
  },
  { 
    name: "Volo Lux", 
    type: "Premium/Comfort Specialist", 
    baseSuccess: 94, 
    baseSpeed: 1.2, 
    icon: Target, 
    theme: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", bar: "bg-violet-400" } 
  },
  { 
    name: "Volo Hack", 
    type: "Extreme Budget Scraper", 
    baseSuccess: 91, 
    baseSpeed: 2.1, 
    icon: Zap, 
    theme: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-400" } 
  },
];

export default function AgentsPage() {
  const [totalMissions, setTotalMissions] = useState(0);
  const [serverStatus, setServerStatus] = useState("Connecting...");
  
  // 🧠 LIVE TELEMETRY STATE
  const [telemetry, setTelemetry] = useState(
    coreAgents.map(agent => ({ speed: `${agent.baseSpeed}0s`, success: agent.baseSuccess }))
  );

  useEffect(() => {
    // 1. Fetch DB Stats
    const fetchAgentStats = async () => {
      const savedUserId = localStorage.getItem("volo_userId");
      
      if (!savedUserId) {
        setServerStatus("Offline (Not Authenticated)");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5088/api/booking/user/${savedUserId}`);
        if (!response.ok) throw new Error("DB Offline");
        
        const trips = await response.json();
        setTotalMissions(trips.length);
        setServerStatus("Online & Synchronized");
      } catch (error) {
        console.warn("Server offline. Loading Mock Agent Stats...");
        setTotalMissions(3); 
        setServerStatus("Local Fallback Mode");
      }
    };

    fetchAgentStats();

    // 2. 📡 START LIVE TELEMETRY PING (Hackathon Magic!)
    // This makes the Latency and Match Rate fluctuate slightly every 2.5 seconds
    const pingInterval = setInterval(() => {
      setTelemetry(coreAgents.map(agent => {
        // Randomize speed by +/- 0.05 seconds
        const speedJitter = (agent.baseSpeed + (Math.random() * 0.1 - 0.05)).toFixed(2);
        // Randomize success rate occasionally by -0.1 to -0.5%
        const successJitter = (agent.baseSuccess - (Math.random() * 0.5)).toFixed(1);
        
        return { speed: `${speedJitter}s`, success: Number(successJitter) };
      }));
    }, 2500);

    return () => clearInterval(pingInterval); // Cleanup when leaving the page
  }, []);

>>>>>>> Stashed changes
  return (
    <div className="font-sans max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      
      <div className="mb-10 border-b border-white/10 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-violet-500 drop-shadow-lg">
<<<<<<< Updated upstream
            {tran.routingCore}
          </h1>
          <p className="text-sm text-violet-400/80 font-bold uppercase tracking-[0.2em] mt-2">{tran.active}</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-400 animate-pulse text-sm font-bold uppercase tracking-widest">
          <Activity size={16} /> {tran.systemsOnline}
=======
            Routing Core
          </h1>
          <p className="text-sm text-violet-400/80 font-bold uppercase tracking-[0.2em] mt-2">Active AI Agent Models</p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-gray-500 justify-end mb-1">
            <Server size={14} className={serverStatus.includes("Online") ? "animate-pulse text-emerald-400" : ""} /> 
            Matrix Link
          </div>
          <p className={`font-semibold ${serverStatus.includes("Online") ? "text-emerald-400" : "text-orange-400"}`}>
            {serverStatus}
          </p>
>>>>>>> Stashed changes
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {coreAgents.map((agent, index) => {
          const Icon = agent.icon;
<<<<<<< Updated upstream
          
          // Safety mappings for Tailwind
          const colorStyles: Record<string, string> = {
            cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
            violet: "text-violet-400 bg-violet-500/10 border-violet-500/20",
            emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          };
=======
          const liveData = telemetry[index];
          
          let assignedMissions = 0;
          if (index === 0) assignedMissions = Math.ceil(totalMissions * 0.6); 
          else if (index === 1) assignedMissions = Math.floor(totalMissions * 0.3); 
          else assignedMissions = totalMissions - Math.ceil(totalMissions * 0.6) - Math.floor(totalMissions * 0.3); 
>>>>>>> Stashed changes

          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center gap-6 bg-[#0B1520] border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group"
            >
<<<<<<< Updated upstream
              <div className={`p-4 rounded-2xl ${colorStyles[agent.color]} shrink-0`}>
=======
              <div className={`p-4 rounded-2xl ${agent.theme.bg} ${agent.theme.text} ${agent.theme.border} border shrink-0 transition-transform group-hover:scale-110`}>
>>>>>>> Stashed changes
                <Icon size={28} />
              </div>

              <div className="w-48 shrink-0">
                <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{agent.type}</p>
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Target Match Rate</span>
                  {/* LIVE MATCH RATE */}
                  <span className={`${agent.theme.text} font-bold transition-all duration-500`}>{liveData.success}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mb-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${liveData.success}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
<<<<<<< Updated upstream
                    className={`bg-${agent.color}-400 h-full rounded-full`}
                    style={{ backgroundColor: agent.color === 'cyan' ? '#22d3ee' : agent.color === 'violet' ? '#a78bfa' : '#34d399' }}
=======
                    className={`${agent.theme.bar} h-full rounded-full`}
>>>>>>> Stashed changes
                  />
                </div>
                
                <p className="text-xs text-gray-500 font-semibold">
                  Missions Routed for You: <span className="text-white">{assignedMissions}</span>
                </p>
              </div>

              <div className="w-24 shrink-0 text-right">
<<<<<<< Updated upstream
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{tran.latency}</p>
                <p className={`font-mono text-lg transition-colors duration-300 ${agent.speed > 2000 ? 'text-orange-400' : 'text-white'}`}>
                  {agent.speed}ms
=======
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Latency</p>
                {/* LIVE LATENCY PING */}
                <p className={`font-mono text-lg text-white transition-opacity duration-300 ${Number(liveData.speed.replace('s','')) > agent.baseSpeed ? 'text-red-400/80' : 'text-emerald-400/80'}`}>
                  {liveData.speed}
>>>>>>> Stashed changes
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}