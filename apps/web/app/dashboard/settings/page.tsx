"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-screen overflow-hidden theme-luxury bg-[#080c0c] text-white font-dm-sans selection:bg-[#00e599]/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        <div className="px-8 py-6 border-b border-[#1e3030] bg-[#080c0c]/80 backdrop-blur-xl">
          <h1 className="text-2xl font-syne font-bold text-white tracking-tight">Settings</h1>
          <p className="text-sm text-[#7a9490] mt-1">Manage your account preferences</p>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[60vh] px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-md text-center p-8 bg-[#0d1111] border border-[#1e3030] rounded-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#131c1b] border border-[#1e3030] flex items-center justify-center mb-6 relative overflow-hidden group">
               <div className="absolute inset-0 bg-[#00e599] opacity-0 group-hover:opacity-10 transition-opacity blur-xl" />
               <Settings className="w-8 h-8 text-[#7a9490] group-hover:text-white transition-colors group-hover:rotate-45 duration-500" />
            </div>
            <h2 className="text-xl font-syne font-bold text-white mb-3">Settings Coming Soon</h2>
            <p className="text-[#7a9490] text-sm leading-relaxed">
              We're currently building out the settings panel where you'll be able to manage your profile, team members, and notification preferences.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
