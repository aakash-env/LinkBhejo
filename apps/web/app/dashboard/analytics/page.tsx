"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Sidebar } from "@/components/layout/Sidebar";
import { analyticsApi } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { TrendingUp, MessageSquare, Users, Send, Calendar, ChevronDown, Info } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#080c0c]/95 backdrop-blur-md border border-[#1e3030] rounded-xl px-4 py-3 text-sm shadow-2xl">
      <p className="text-[#7a9490] mb-2 text-xs font-jetbrains-mono uppercase tracking-wider">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="flex items-center justify-between gap-4">
          <span className="text-white font-medium">{p.name}</span>
          <span className="font-syne font-bold" style={{ color: p.color }}>{formatNumber(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

function KpiSkeleton() {
  return (
    <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-5 h-[96px] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

function ChartSkeleton({ height = 280 }: { height?: number }) {
  return (
    <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 relative overflow-hidden" style={{ height }}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

const dateRanges = [
  { label: "Last 7 Days", value: 7 },
  { label: "Last 14 Days", value: 14 },
  { label: "Last 30 Days", value: 30 },
  { label: "Last 90 Days", value: 90 },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const dateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["analytics", "overview", days],
    queryFn: () => analyticsApi.overview({ days }),
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ["analytics", "timeline", days],
    queryFn: () => analyticsApi.timeline({ days }),
  });

  const { data: byAutomation, isLoading: byAutomationLoading } = useQuery({
    queryKey: ["analytics", "automations"],
    queryFn: () => analyticsApi.automations(),
  });

  const kpis = [
    { label: "Total DMs Sent", value: overview?.dmsSent ?? 0, icon: Send, color: "#00e599" },
    { label: "Delivered", value: overview?.dmsDelivered ?? 0, icon: MessageSquare, color: "#00b87a" },
    { label: "Leads Collected", value: overview?.leadsCollected ?? 0, icon: Users, color: "#f0c060" },
    { label: "Conversion Rate", value: `${overview?.conversionRate ?? 0}%`, icon: TrendingUp, color: "#3b82f6" },
  ];

  const funnelData = [
    { name: "Comments Triggered", value: overview?.totalCommentTriggers ?? 0, fill: "#00e599" },
    { name: "DMs Sent", value: overview?.dmsSent ?? 0, fill: "#00cc88" },
    { name: "DMs Delivered", value: overview?.dmsDelivered ?? 0, fill: "#00b377" },
    { name: "Leads Collected", value: overview?.leadsCollected ?? 0, fill: "#f0c060" },
  ];

  return (
    <div className="flex h-screen overflow-hidden theme-luxury bg-[#080c0c] text-white font-dm-sans selection:bg-[#00e599]/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        {/* Ambient glow */}
        <div className="absolute z-0 pointer-events-none w-[500px] h-[500px] top-[-150px] right-[-150px] opacity-30"
          style={{ background: "radial-gradient(circle at center, rgba(0,200,140,0.08) 0%, transparent 70%)" }} />

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-6 border-b border-[#1e3030] bg-[#080c0c]/80 backdrop-blur-xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-syne font-bold text-white tracking-tight">Analytics</h1>
            <p className="text-sm text-[#7a9490] mt-1">Last {days} days performance</p>
          </div>

          {/* Date picker */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d1111] border border-[#1e3030] hover:border-[#2a4040] hover:bg-[#131c1b] transition-all text-sm font-medium text-[#e8f0ee]"
            >
              <Calendar className="w-4 h-4 text-[#7a9490]" />
              Last {days} Days
              <ChevronDown className={`w-4 h-4 text-[#7a9490] transition-transform ${isDatePickerOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isDatePickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-[#080c0c]/95 backdrop-blur-xl border border-[#1e3030] rounded-xl shadow-2xl overflow-hidden py-1 z-50"
                >
                  {dateRanges.map((range) => (
                    <button
                      key={range.value}
                      onClick={() => { setDays(range.value); setIsDatePickerOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${days === range.value
                        ? "bg-[#131c1b] text-[#00e599] font-medium"
                        : "text-[#7a9490] hover:bg-[#131c1b] hover:text-[#e8f0ee]"}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="px-8 py-8 space-y-6 relative z-10">
          {/* KPI row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {overviewLoading
              ? Array(4).fill(0).map((_, i) => <KpiSkeleton key={i} />)
              : kpis.map((k, i) => (
                <motion.div
                  key={k.label}
                  className="relative overflow-hidden bg-[#0d1111] border border-[#1e3030] rounded-2xl p-5 group hover:-translate-y-1 hover:border-[#2a4040] hover:bg-[#131c1b] transition-all duration-300"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-3xl pointer-events-none group-hover:opacity-20 transition-opacity"
                    style={{ backgroundColor: k.color }} />
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <k.icon className="w-4 h-4" style={{ color: k.color }} />
                    <p className="text-xs text-[#7a9490] font-medium">{k.label}</p>
                  </div>
                  <p className="text-2xl font-syne font-bold text-white relative z-10">
                    {typeof k.value === "number" ? formatNumber(k.value) : k.value}
                  </p>
                </motion.div>
              ))}
          </div>

          {/* Timeline chart */}
          {timelineLoading ? <ChartSkeleton height={340} /> : (
            <motion.div
              className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            >
              <div className="flex items-center gap-1.5 mb-6">
                <h2 className="text-base font-syne font-semibold text-white tracking-tight">DM Volume Over Time</h2>
                <div className="relative group/tooltip">
                  <Info className="w-3.5 h-3.5 text-[#3a5550] cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1e3030] text-[#e8f0ee] text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                    Daily messages sent and delivered over the selected period.
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={timeline ?? []}>
                  <CartesianGrid stroke="#1e3030" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#7a9490", fontSize: 11, fontFamily: "var(--font-jetbrains-mono, monospace)" }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} dy={10} />
                  <YAxis tick={{ fill: "#7a9490", fontSize: 11, fontFamily: "var(--font-jetbrains-mono, monospace)" }} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#1e3030", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Line type="monotone" dataKey="dmsSent" name="Sent" stroke="#00e599" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: "#080c0c", stroke: "#00e599", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="dmsDelivered" name="Delivered" stroke="#00b87a" strokeWidth={2} dot={false} strokeDasharray="4 4" opacity={0.7} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Per-automation bar chart */}
            {byAutomationLoading ? <ChartSkeleton height={280} /> : (
              <motion.div
                className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              >
                <h2 className="text-base font-syne font-semibold text-white mb-6 tracking-tight">By Automation</h2>
                {(byAutomation as any[])?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={(byAutomation as any[]) ?? []} layout="vertical">
                      <CartesianGrid stroke="#1e3030" strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "#7a9490", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="automationName" tick={{ fill: "#e8f0ee", fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="dmsSent" name="DMs Sent" fill="#00e599" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[200px] text-[#3a5550] text-sm">
                    No automation data yet
                  </div>
                )}
              </motion.div>
            )}

            {/* Conversion funnel */}
            <motion.div
              className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            >
              <h2 className="text-base font-syne font-semibold text-white mb-6 tracking-tight">Conversion Funnel</h2>
              <div className="space-y-4">
                {funnelData.map((item, i) => {
                  const maxVal = funnelData[0].value || 1;
                  const pct = Math.max(5, (item.value / maxVal) * 100);
                  const dropoff = i > 0 ? funnelData[i - 1].value > 0
                    ? (((funnelData[i - 1].value - item.value) / funnelData[i - 1].value) * 100).toFixed(0)
                    : null : null;
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-[#7a9490] font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          {dropoff && (
                            <span className="text-[10px] text-[#3a5550] font-jetbrains-mono">-{dropoff}%</span>
                          )}
                          <span className="text-white font-medium font-jetbrains-mono">{formatNumber(item.value)}</span>
                        </div>
                      </div>
                      <div className="h-2.5 bg-[#131c1b] rounded-full overflow-hidden border border-[#1e3030]">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.fill }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
