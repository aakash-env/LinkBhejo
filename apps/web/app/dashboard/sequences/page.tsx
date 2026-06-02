"use client";

import { motion } from "framer-motion";
import { GitBranch, Plus, ArrowRight, Clock, CheckCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import Link from "next/link";

// Placeholder sequences page — full builder in Phase 2
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-8 py-5 border-b border-border glass-dark">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Sequences</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Multi-step DM drip campaigns
              </p>
            </div>
            <button className="flex items-center gap-2 gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all glow-brand-sm opacity-50 cursor-not-allowed" title="Coming in Phase 2">
              <Plus className="w-4 h-4" />
              New Sequence
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Phase 2 banner */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-[#00e599]/20 bg-[#00e599]/5"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#00e599]/10 flex items-center justify-center shrink-0">
                <GitBranch className="w-5 h-5 text-[#00e599]" />
              </div>
              <div>
                <h2 className="font-bold text-white">Drip Sequences — Phase 2 Feature</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                  Build multi-step DM campaigns that automatically send messages on Day 1, Day 3, Day 7 and beyond.
                  Sequences are fully configured in the database and will be unlocked in the next release.
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Backend workers ready
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Database schema done
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    UI builder in progress
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sample sequences */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Your Sequences
            </h2>
            <div className="grid gap-3">
              {SAMPLE_SEQUENCES.map((seq, i) => (
                <motion.div
                  key={seq.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-dark rounded-2xl p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00e599]/10 flex items-center justify-center shrink-0">
                      <GitBranch className="w-5 h-5 text-[#00e599]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{seq.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {seq.steps} steps • attached to &quot;{seq.automation}&quot;
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-right">
                      <div>
                        <p className="text-white font-semibold">{seq.enrolled}</p>
                        <p className="text-xs text-muted-foreground">Enrolled</p>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{seq.completed}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#00e599]"
                          style={{ width: `${Math.round((seq.completed / seq.enrolled) * 100)}%` }}
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
            className="glass-dark rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-base font-semibold text-white mb-5">How Sequences Work</h2>
            <div className="flex items-start gap-0 relative">
              {[
                { day: "Day 0", action: "User triggers automation", desc: "Comments keyword on your post" },
                { day: "Day 1", action: "First follow-up DM", desc: "Share your main resource or offer" },
                { day: "Day 3", action: "Value check-in", desc: "Ask if they had any questions" },
                { day: "Day 7", action: "Final CTA", desc: "Last call for your offer" },
              ].map((step, i) => (
                <div key={step.day} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white z-10 relative">
                      {i + 1}
                    </div>
                    {i < 3 && (
                      <div className="absolute top-4 left-1/2 w-full h-px bg-gradient-to-r from-brand-500/50 to-brand-500/10" />
                    )}
                  </div>
                  <div className="mt-3 px-2 text-center">
                    <p className="text-xs font-semibold text-brand-400">{step.day}</p>
                    <p className="text-sm text-white font-medium mt-1">{step.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
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
