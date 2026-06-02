"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Zap, Pause, Play, Trash2, RefreshCw,
  MessageSquare, Send, Users, Clock, X, Plus, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { automationsApi } from "@/lib/api";
import { formatNumber, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusColor: Record<string, string> = {
  DELIVERED: "text-emerald-400 bg-emerald-500/10",
  SENT: "text-blue-400 bg-blue-500/10",
  PENDING: "text-amber-400 bg-amber-500/10",
  FAILED: "text-red-400 bg-red-500/10",
  SKIPPED: "text-muted-foreground bg-white/5",
};

export default function AutomationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [retriggerPostId, setRetriggerPostId] = useState("");
  const [showRetrigger, setShowRetrigger] = useState(false);

  const { data: automation, isLoading } = useQuery({
    queryKey: ["automations", id],
    queryFn: () => automationsApi.get(id),
  });

  const toggleMutation = useMutation({
    mutationFn: () => automationsApi.toggle(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["automations", id] });
      toast.success(`Automation ${data.status === "ACTIVE" ? "activated" : "paused"}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => automationsApi.delete(id),
    onSuccess: () => {
      toast.success("Automation deleted");
      router.push("/dashboard/automations");
    },
  });

  const retriggerMutation = useMutation({
    mutationFn: () => automationsApi.retrigger(id, retriggerPostId),
    onSuccess: () => {
      toast.success("Retrigger batch started! Check back in a few minutes.");
      setShowRetrigger(false);
      setRetriggerPostId("");
    },
    onError: () => toast.error("Failed to start retrigger"),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
        </main>
      </div>
    );
  }

  if (!automation) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <p>Automation not found.</p>
          <Link href="/dashboard/automations" className="text-brand-400 hover:text-brand-300 text-sm">
            ← Back to automations
          </Link>
        </main>
      </div>
    );
  }

  const isActive = automation.status === "ACTIVE";
  const deliveredCount = automation.dmLogs?.filter((l: any) => l.status === "DELIVERED").length ?? 0;
  const sentCount = automation.dmLogs?.length ?? 0;
  const deliveryRate = sentCount > 0 ? Math.round((deliveredCount / sentCount) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 px-8 py-5 border-b border-border glass-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/automations"
                className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <div className={isActive ? "status-dot-active" : "status-dot-paused"} />
                  <h1 className="text-xl font-bold text-white">{automation.name}</h1>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 capitalize">
                  {automation.type.toLowerCase().replace("_", " ")} automation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRetrigger(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-white hover:border-white/20 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-trigger
              </button>
              <button
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                    : "gradient-bg text-white hover:opacity-90"
                )}
              >
                {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isActive ? "Pause" : "Activate"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this automation?")) deleteMutation.mutate();
                }}
                className="p-2 rounded-xl border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { label: "Total DMs Sent", value: formatNumber(sentCount), icon: Send, color: "text-brand-400" },
              { label: "Delivered", value: formatNumber(deliveredCount), icon: MessageSquare, color: "text-violet-400" },
              { label: "Delivery Rate", value: `${deliveryRate}%`, icon: Zap, color: "text-emerald-400" },
              { label: "Keywords", value: automation.rules?.length ?? 0, icon: Users, color: "text-amber-400" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-dark rounded-2xl p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Config card */}
            <motion.div
              className="glass-dark rounded-2xl p-6 space-y-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-base font-semibold text-white">Configuration</h2>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {automation.rules?.map((r: any) => (
                    <span key={r.id} className="px-2.5 py-1 rounded-lg text-xs gradient-bg-subtle border border-brand-500/20 text-brand-300">
                      {r.keyword}
                    </span>
                  ))}
                  {(!automation.rules || automation.rules.length === 0) && (
                    <span className="text-xs text-muted-foreground italic">No keywords</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">DM Template</p>
                <div className="bg-white/5 rounded-xl p-3 text-sm text-slate-300 whitespace-pre-wrap break-words border border-white/5">
                  {automation.dmTemplate}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="glass rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Send delay</p>
                  <p className="text-white font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {automation.delaySeconds}s
                  </p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Follow gate</p>
                  <p className={cn("font-medium", automation.followGate ? "text-emerald-400" : "text-muted-foreground")}>
                    {automation.followGate ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">AI replies</p>
                  <p className={cn("font-medium", automation.aiEnabled ? "text-violet-400" : "text-muted-foreground")}>
                    {automation.aiEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
                <div className="glass rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Comment reply</p>
                  <p className={cn("font-medium", automation.commentReplyEnabled ? "text-emerald-400" : "text-muted-foreground")}>
                    {automation.commentReplyEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* DM Logs */}
            <motion.div
              className="xl:col-span-2 glass-dark rounded-2xl p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-base font-semibold text-white mb-4">Recent DM Logs</h2>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {automation.dmLogs?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">No DMs sent yet</p>
                    <p className="text-xs mt-1">Logs will appear here when the automation triggers</p>
                  </div>
                )}
                {automation.dmLogs?.map((log: any, i: number) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full gradient-bg-subtle border border-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
                      {(log.igUsername?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        @{log.igUsername ?? log.igUserId}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {log.triggerType} • {formatRelativeTime(log.triggeredAt)}
                      </p>
                    </div>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", statusColor[log.status] ?? "text-muted-foreground")}>
                      {log.status.toLowerCase()}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Re-trigger modal */}
        {showRetrigger && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRetrigger(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative glass-dark rounded-2xl p-6 w-full max-w-md border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Re-trigger on Old Post</h3>
                <button onClick={() => setShowRetrigger(false)} className="text-muted-foreground hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a Post ID to fetch all commenters and DM anyone who hasn&apos;t received this message yet.
              </p>
              <input
                value={retriggerPostId}
                onChange={(e) => setRetriggerPostId(e.target.value)}
                placeholder="Instagram Post ID (e.g. 17841400000000001)"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 mb-4"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRetrigger(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => retriggerMutation.mutate()}
                  disabled={!retriggerPostId || retriggerMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {retriggerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Start Batch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
