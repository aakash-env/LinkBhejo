"use client";

import { motion } from "framer-motion";
import { GitBranch, Plus, Clock, CheckCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";

// Phase 2 — sequences UI builder in progress. Backend is ready.
const SAMPLE_SEQUENCES = [
  {
    id: "1",
    name: "Welcome Drip",
    steps: 3,
    enrolled: 47,
    completed: 12,
    automation: "Free Guide Giveaway",
  },
];

export default function SequencesPage() {
  return (
    <div className="flex h-screen overflow-hidden theme-luxury bg-[#080c0c] text-white font-dm-sans selection:bg-[#00e599]/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        {/* Ambient glow */}
        <div className="absolute z-0 pointer-events-none w-[500px] h-[500px] top-[-150px] right-[-100px] opacity-30"
          style={{ background: "radial-gradient(circle at center, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-6 border-b border-[#1e3030] bg-[#080c0c]/80 backdrop-blur-xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-syne font-bold text-white tracking-tight">Sequences</h1>
            <p className="text-sm text-[#7a9490] mt-1">Multi-step DM drip campaigns</p>
          </div>
          <button
            disabled
            title="Coming in Phase 2"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00e599] to-[#00b87a] text-[#001a10] font-syne font-bold text-sm opacity-40 cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            New Sequence
          </button>
        </div>

        <div className="px-8 py-8 space-y-6 relative z-10">
          {/* Phase 2 banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#00e599]/5 border border-[#00e599]/20 rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00e599]/10 border border-[#00e599]/20 flex items-center justify-center shrink-0">
                <GitBranch className="w-5 h-5 text-[#00e599]" />
              </div>
              <div>
                <h2 className="font-syne font-bold text-white">Drip Sequences — Phase 2 Feature</h2>
                <p className="text-sm text-[#7a9490] mt-1 max-w-lg">
                  Build multi-step DM campaigns that automatically send messages on Day 1, Day 3, Day 7 and beyond.
                  Sequences are fully configured in the database and will be unlocked in the next release.
                </p>
                <div className="flex items-center gap-5 mt-3 text-xs">
                  <span className="flex items-center gap-1.5 text-[#00e599]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Backend workers ready
                  </span>
                  <span className="flex items-center gap-1.5 text-[#00e599]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Database schema done
                  </span>
                  <span className="flex items-center gap-1.5 text-[#f0c060]">
                    <Clock className="w-3.5 h-3.5" />
                    UI builder in progress
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sample sequences */}
          <div>
            <h2 className="text-xs font-bold text-[#3a5550] uppercase tracking-widest mb-3">Your Sequences</h2>
            <div className="grid gap-3">
              {SAMPLE_SEQUENCES.map((seq, i) => (
                <motion.div
                  key={seq.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-5 hover:border-[#2a4040] hover:bg-[#131c1b] transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00e599]/10 border border-[#00e599]/20 flex items-center justify-center shrink-0">
                      <GitBranch className="w-5 h-5 text-[#00e599]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-syne font-semibold text-white">{seq.name}</h3>
                      <p className="text-xs text-[#3a5550] mt-0.5 font-jetbrains-mono">
                        {seq.steps} steps · attached to &quot;{seq.automation}&quot;
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-right">
                      <div>
                        <p className="text-white font-syne font-semibold">{seq.enrolled}</p>
                        <p className="text-xs text-[#3a5550]">Enrolled</p>
                      </div>
                      <div>
                        <p className="text-white font-syne font-semibold">{seq.completed}</p>
                        <p className="text-xs text-[#3a5550]">Completed</p>
                      </div>
                      <div className="w-24 h-2 bg-[#131c1b] border border-[#1e3030] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-[#00e599] to-[#00b87a]"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((seq.completed / seq.enrolled) * 100)}%` }}
                          transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <motion.div
            className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-base font-syne font-semibold text-white mb-6 tracking-tight">How Sequences Work</h2>
            <div className="flex items-start gap-0 relative">
              {[
                { day: "Day 0", action: "User triggers automation", desc: "Comments keyword on your post" },
                { day: "Day 1", action: "First follow-up DM", desc: "Share your main resource or offer" },
                { day: "Day 3", action: "Value check-in", desc: "Ask if they had any questions" },
                { day: "Day 7", action: "Final CTA", desc: "Last call for your offer" },
              ].map((step, i) => (
                <div key={step.day} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00e599] to-[#00b87a] flex items-center justify-center text-xs font-syne font-bold text-[#001a10] z-10 relative shadow-[0_0_12px_rgba(0,229,153,0.3)]">
                      {i + 1}
                    </div>
                    {i < 3 && (
                      <div className="absolute top-4 left-1/2 w-full h-px bg-gradient-to-r from-[#00e599]/40 to-[#00e599]/10" />
                    )}
                  </div>
                  <div className="mt-3 px-2 text-center">
                    <p className="text-xs font-bold text-[#00e599] font-jetbrains-mono">{step.day}</p>
                    <p className="text-sm text-white font-medium mt-1">{step.action}</p>
                    <p className="text-xs text-[#3a5550] mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
