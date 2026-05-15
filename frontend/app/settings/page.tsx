"use client";

import { useState } from "react";
import { ShieldAlert, KeyRound, BellRing } from "lucide-react";

export default function SettingsPage() {
  const [notifs, setNotifs] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  return (
    <div className="font-sans max-w-3xl mx-auto w-full">
      
      <h1 className="text-4xl font-black tracking-tighter mb-8">System Configuration</h1>

      {/* SECTION 1: Preferences */}
      <div className="bg-[#0B1520] border border-white/5 rounded-[28px] overflow-hidden mb-8">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
           <BellRing size={20} className="text-cyan-400" />
           <h2 className="font-bold text-lg">Alerts & Notifications</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Price Drop Alerts</p>
            <p className="text-sm text-gray-500">Get notified when AI finds a cheaper route.</p>
          </div>
          <button 
            onClick={() => setNotifs(!notifs)}
            className={`w-12 h-6 rounded-full transition-colors relative ${notifs ? 'bg-cyan-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifs ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      {/* SECTION 2: Security */}
      <div className="bg-[#0B1520] border border-white/5 rounded-[28px] overflow-hidden mb-8">
        <div className="p-6 border-b border-white/5 bg-white/5 flex items-center gap-3">
           <KeyRound size={20} className="text-emerald-400" />
           <h2 className="font-bold text-lg">Security & Data</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Share Booking Data with AI</p>
            <p className="text-sm text-gray-500">Helps Volo learn your preferences faster.</p>
          </div>
          <button 
            onClick={() => setDataSharing(!dataSharing)}
            className={`w-12 h-6 rounded-full transition-colors relative ${dataSharing ? 'bg-emerald-500' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${dataSharing ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      {/* SECTION 3: THE DANGER ZONE */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-[28px] overflow-hidden">
        <div className="p-6 border-b border-red-500/10 flex items-center gap-3">
           <ShieldAlert size={20} className="text-red-400" />
           <h2 className="font-bold text-lg text-red-400">Danger Zone</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">Wipe Profile Data</p>
            <p className="text-sm text-gray-500">Permanently delete your routing history.</p>
          </div>
          <button className="px-6 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/20 transition-all rounded-xl font-bold text-sm">
            Delete Account
          </button>
        </div>
      </div>

    </div>
  );
}