"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Zap, Pause, Play, Trash2, MessageSquare, Video, Radio, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { automationsApi } from "@/lib/api";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  COMMENT: MessageSquare,
  STORY: Video,
  LIVE: Radio,
  DM_REPLY: Zap,
};

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  COMMENT: { bg: "#00e599", text: "#00e599", border: "#00e599" },
  STORY: { bg: "#00cc88", text: "#00cc88", border: "#00cc88" },
  LIVE: { bg: "#f0c060", text: "#f0c060", border: "#f0c060" },
  DM_REPLY: { bg: "#3b82f6", text: "#3b82f6", border: "#3b82f6" },
};

function AutomationCard({ automation, onToggle, onDelete }: any) {
  const Icon = typeIcons[automation.type] ?? Zap;
  const color = typeColors[automation.type] ?? typeColors.COMMENT;
  const isActive = automation.status === "ACTIVE";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-5 hover:border-[#2a4040] hover:bg-[#131c1b] transition-all duration-200 group"
    >
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ backgroundColor: `${color.bg}15`, borderColor: `${color.border}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: color.text }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0",
              isActive ? "bg-[#00e599] shadow-[0_0_6px_rgba(0,229,153,0.6)]" : "bg-[#3a5550]"
            )} />
            <h3 className="font-syne font-semibold text-white truncate">{automation.name}</h3>
          </div>
          <p className="text-xs text-[#3a5550] mb-3 line-clamp-1 font-jetbrains-mono">
            {automation.rules?.length ?? 0} keywords •{" "}
            {automation.dmTemplate?.slice(0, 60)}...
          </p>

          <div className="flex items-center gap-4 text-xs text-[#3a5550]">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {formatNumber(automation._count?.dmLogs ?? 0)} DMs
            </span>
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
              style={{ color: color.text, backgroundColor: `${color.bg}10`, borderColor: `${color.border}20` }}
            >
              {automation.type.replace("_", " ")}
            </span>
            <span>{formatRelativeTime(automation.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(automation.id)}
            title={isActive ? "Pause" : "Activate"}
            className="p-2 rounded-lg hover:bg-[#1e3030] text-[#3a5550] hover:text-white transition-all"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(automation.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-[#3a5550] hover:text-red-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link
            href={`/dashboard/automations/${automation.id}`}
            className="p-2 rounded-lg hover:bg-[#1e3030] text-[#3a5550] hover:text-white transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl h-[88px] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

export default function AutomationsPage() {
  const queryClient = useQueryClient();

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ["automations"],
    queryFn: automationsApi.list,
  });

  const toggleMutation = useMutation({
    mutationFn: automationsApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automation updated");
    },
    onError: () => toast.error("Failed to update automation"),
  });

  const deleteMutation = useMutation({
    mutationFn: automationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automation deleted");
    },
    onError: () => toast.error("Failed to delete automation"),
  });

  const active = (automations as any[]).filter((a: any) => a.status === "ACTIVE");
  const paused = (automations as any[]).filter((a: any) => a.status !== "ACTIVE");

  return (
    <div className="flex h-screen overflow-hidden theme-luxury bg-[#080c0c] text-white font-dm-sans selection:bg-[#00e599]/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        {/* Ambient glow */}
        <div className="absolute z-0 pointer-events-none w-[500px] h-[500px] top-[-150px] right-[-100px] opacity-30"
          style={{ background: "radial-gradient(circle at center, rgba(0,229,153,0.06) 0%, transparent 70%)" }} />

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-6 border-b border-[#1e3030] bg-[#080c0c]/80 backdrop-blur-xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-syne font-bold text-white tracking-tight">Automations</h1>
            <p className="text-sm text-[#7a9490] mt-1">
              {isLoading ? "Loading..." : `${(automations as any[]).length} total · ${active.length} active`}
            </p>
          </div>
          <Link
            href="/dashboard/automations/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00e599] to-[#00b87a] text-[#001a10] font-syne font-bold text-sm hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(0,229,153,0.25)]"
          >
            <Plus className="w-4 h-4" />
            New Automation
          </Link>
        </div>

        <div className="px-8 py-8 space-y-8 relative z-10">
          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((n) => <CardSkeleton key={n} />)}
            </div>
          ) : (automations as any[]).length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#0d1111] border border-[#1e3030] flex items-center justify-center mb-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#00e599] opacity-0 group-hover:opacity-10 transition-opacity blur-xl" />
                <Zap className="w-8 h-8 text-[#00e599]" />
              </div>
              <h2 className="text-xl font-syne font-bold text-white mb-2">No automations yet</h2>
              <p className="text-[#7a9490] mb-6 max-w-sm text-sm">
                Create your first automation to start sending DMs automatically when someone comments a keyword on your posts.
              </p>
              <Link
                href="/dashboard/automations/new"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00e599] to-[#00b87a] text-[#001a10] font-syne font-bold text-sm hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(0,229,153,0.3)]"
              >
                <Plus className="w-4 h-4" />
                Create First Automation
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Active section */}
              {active.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-[#3a5550] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e599] inline-block shadow-[0_0_6px_rgba(0,229,153,0.6)]" />
                    Active ({active.length})
                  </h2>
                  <div className="grid gap-3">
                    <AnimatePresence>
                      {active.map((a: any) => (
                        <AutomationCard
                          key={a.id}
                          automation={a}
                          onToggle={(id: string) => toggleMutation.mutate(id)}
                          onDelete={(id: string) => deleteMutation.mutate(id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {/* Paused section */}
              {paused.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-[#3a5550] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3a5550] inline-block" />
                    Paused / Draft ({paused.length})
                  </h2>
                  <div className="grid gap-3 opacity-60">
                    <AnimatePresence>
                      {paused.map((a: any) => (
                        <AutomationCard
                          key={a.id}
                          automation={a}
                          onToggle={(id: string) => toggleMutation.mutate(id)}
                          onDelete={(id: string) => deleteMutation.mutate(id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
