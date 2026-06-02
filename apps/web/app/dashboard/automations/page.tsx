"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
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

const typeColors: Record<string, string> = {
  COMMENT: "text-[#00e599] bg-[#00e599]/10",
  STORY: "text-emerald-400 bg-emerald-500/10",
  LIVE: "text-teal-400 bg-teal-500/10",
  DM_REPLY: "text-[#00cc88] bg-[#00cc88]/10",
};

function AutomationCard({ automation, onToggle, onDelete }: any) {
  const Icon = typeIcons[automation.type] ?? Zap;
  const colorClass = typeColors[automation.type] ?? "text-[#00e599] bg-[#00e599]/10";
  const isActive = automation.status === "ACTIVE";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-dark rounded-2xl p-5 hover:border-white/15 transition-all duration-200 group"
    >
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", colorClass)}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className={isActive ? "status-dot-active" : "status-dot-paused"} />
            <h3 className="font-semibold text-white truncate">{automation.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
            {automation.rules?.length ?? 0} keywords •{" "}
            {automation.dmTemplate?.slice(0, 60)}...
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {formatNumber(automation._count?.dmLogs ?? 0)} DMs
            </span>
            <span className="capitalize">{automation.type.toLowerCase().replace("_", " ")}</span>
            <span>{formatRelativeTime(automation.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onToggle(automation.id)}
            title={isActive ? "Pause" : "Activate"}
            className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDelete(automation.id)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link
            href={`/dashboard/automations/${automation.id}`}
            className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
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
  });

  const deleteMutation = useMutation({
    mutationFn: automationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automation deleted");
    },
  });

  const active = automations.filter((a: any) => a.status === "ACTIVE");
  const paused = automations.filter((a: any) => a.status !== "ACTIVE");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 px-8 py-5 border-b border-border glass-dark">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Automations</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {automations.length} total • {active.length} active
              </p>
            </div>
            <Link
              href="/dashboard/automations/new"
              className="flex items-center gap-2 gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all glow-brand-sm"
            >
              <Plus className="w-4 h-4" />
              New Automation
            </Link>
          </div>
        </div>

        <div className="px-8 py-6 space-y-8">
          {isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-dark rounded-2xl h-24 shimmer" />
              ))}
            </div>
          ) : automations.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl gradient-bg-subtle border border-[#00e599]/20 flex items-center justify-center mb-4 animate-float">
                <Zap className="w-8 h-8 text-[#00e599]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No automations yet
              </h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Create your first automation to start sending DMs automatically
                when someone comments a keyword.
              </p>
              <Link
                href="/dashboard/automations/new"
                className="gradient-bg text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all glow-brand-sm"
              >
                Create First Automation
              </Link>
            </motion.div>
          ) : (
            <>
              {/* Active */}
              {active.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Active ({active.length})
                  </h2>
                  <div className="grid gap-3">
                    {active.map((a: any) => (
                      <AutomationCard
                        key={a.id}
                        automation={a}
                        onToggle={(id: string) => toggleMutation.mutate(id)}
                        onDelete={(id: string) => deleteMutation.mutate(id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Paused */}
              {paused.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Paused / Draft ({paused.length})
                  </h2>
                  <div className="grid gap-3 opacity-70">
                    {paused.map((a: any) => (
                      <AutomationCard
                        key={a.id}
                        automation={a}
                        onToggle={(id: string) => toggleMutation.mutate(id)}
                        onDelete={(id: string) => deleteMutation.mutate(id)}
                      />
                    ))}
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
