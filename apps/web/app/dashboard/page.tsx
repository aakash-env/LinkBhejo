"use client";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Send, Users, Zap, ArrowUpRight,
  MessageSquare, Activity, Plus,
  ChevronDown, Download, Calendar, Info
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { analyticsApi, automationsApi, billingApi, leadsApi } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4 },
  }),
};

// Skeletons for Loading States
function StatCardSkeleton() {
  return (
    <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 h-[130px] shimmer overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="xl:col-span-2 bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 h-[400px] shimmer relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

function RightPanelSkeleton() {
  return (
    <div className="space-y-5 h-[400px]">
      <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 h-[160px] shimmer relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 flex-1 shimmer relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
      </div>
    </div>
  );
}

function StatCard({
  title, value, change, icon: Icon, colorHex, index, tooltip
}: {
  title: string; value: string | number; change?: string;
  icon: any; colorHex: string; index: number; tooltip?: string;
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 group hover:-translate-y-1 hover:border-[#2a4040] hover:bg-[#131c1b] transition-all duration-300"
    >
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl pointer-events-none transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: colorHex }}
      />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-[#7a9490]">{title}</p>
            {tooltip && (
              <div className="relative group/tooltip">
                <Info className="w-3.5 h-3.5 text-[#3a5550] cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1e3030] text-[#e8f0ee] text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <p className="text-3xl font-syne font-bold text-white mt-2 tracking-tight">
            {typeof value === "number" ? formatNumber(value) : value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#00e599]" />
              <span className="text-xs font-medium text-[#00e599]">{change}</span>
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ 
            backgroundColor: `${colorHex}15`, 
            borderColor: `${colorHex}30`,
            boxShadow: `inset 0 0 10px ${colorHex}10` 
          }}
        >
          <Icon className="w-5 h-5" style={{ color: colorHex }} />
        </div>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#080c0c]/90 backdrop-blur-md border border-[#1e3030] rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-xs font-jetbrains-mono text-[#7a9490] mb-2 uppercase tracking-wider">{label}</p>
      <div className="space-y-1">
        {payload.map((p: any) => (
          <p key={p.name} className="text-sm flex items-center justify-between gap-4">
            <span className="text-white font-medium">{p.name}</span>
            <span className="font-syne font-bold" style={{ color: p.color }}>{p.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [chartMetric, setChartMetric] = useState<"volume" | "delivery" | "replies">("volume");
  const [days, setDays] = useState(30);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const dateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
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

  const { data: automations, isLoading: automationsLoading } = useQuery({
    queryKey: ["automations"],
    queryFn: automationsApi.list,
  });

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: billingApi.usage,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await leadsApi.exportCsv({ days });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `linkbhejo-leads-${days}d.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  const dateRanges = [
    { label: "Last 7 Days", value: 7 },
    { label: "Last 14 Days", value: 14 },
    { label: "Last 30 Days", value: 30 },
    { label: "Last 90 Days", value: 90 },
  ];

  const stats = [
    {
      title: "DMs Sent",
      value: overview?.dmsSent ?? 0,
      icon: Send,
      colorHex: "#00e599",
      tooltip: "Total number of direct messages initiated.",
    },
    {
      title: "Delivered",
      value: overview?.dmsDelivered ?? 0,
      icon: MessageSquare,
      colorHex: "#00b87a",
      tooltip: "Messages successfully delivered to the recipient's inbox.",
    },
    {
      title: "Leads Collected",
      value: overview?.leadsCollected ?? 0,
      icon: Users,
      colorHex: "#f0c060",
      tooltip: "Unique users who have interacted with your automations.",
    },
    {
      title: "Active Automations",
      value: overview?.activeAutomations ?? 0,
      icon: Zap,
      colorHex: "#3b82f6",
      tooltip: "Number of automations currently running.",
    },
  ];

  const planLimits = usage?.limits?.dmsPerMonth ?? 50;
  const planUsed = usage?.usage?.dmsSent ?? 0;
  const usagePct = planLimits === -1 ? 0 : Math.min((planUsed / planLimits) * 100, 100);

  const isLoading = overviewLoading || timelineLoading || automationsLoading || usageLoading;

  return (
    <div className="flex h-screen overflow-hidden theme-luxury bg-[#080c0c] text-white font-dm-sans selection:bg-[#00e599]/30">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative z-0">
        {/* Ambient Glows */}
        <div
          className="absolute z-0 pointer-events-none w-[500px] h-[500px] top-[-150px] right-[-150px] opacity-40"
          style={{ background: "radial-gradient(circle at center, rgba(0,200,140,0.08) 0%, transparent 70%)" }}
        />
        <div
          className="absolute z-0 pointer-events-none w-[600px] h-[600px] bottom-[-200px] left-[-200px] opacity-40"
          style={{ background: "radial-gradient(circle at center, rgba(180,80,0,0.05) 0%, transparent 70%)" }}
        />

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-6 border-b border-[#1e3030] bg-[#080c0c]/80 backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-syne font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-[#7a9490] mt-1">
              Your automation overview
            </p>
          </div>
          
          <div className="flex items-center gap-3 relative z-40">
            {/* Date Range Picker */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0d1111] border border-[#1e3030] hover:border-[#2a4040] hover:bg-[#131c1b] transition-all text-sm font-medium text-[#e8f0ee]"
              >
                <Calendar className="w-4 h-4 text-[#7a9490]" />
                Last {days} Days
                <ChevronDown className={`w-4 h-4 text-[#7a9490] transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
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
                        onClick={() => {
                          setDays(range.value);
                          setIsDatePickerOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          days === range.value 
                            ? "bg-[#131c1b] text-[#00e599] font-medium" 
                            : "text-[#7a9490] hover:bg-[#131c1b] hover:text-[#e8f0ee]"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-syne font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export
            </button>
          </div>
        </div>

        <div className="px-8 py-8 space-y-8 relative z-10">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {overviewLoading ? (
              Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
            ) : (
              stats.map((s, i) => <StatCard key={s.title} {...s} index={i} />)
            )}
          </div>

          {/* Chart + Usage meter */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Timeline chart */}
            {timelineLoading ? (
              <ChartSkeleton />
            ) : (
              <motion.div
                className="xl:col-span-2 bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-syne font-semibold text-white tracking-tight">Performance Trends</h2>
                      <div className="relative group/tooltip">
                        <Info className="w-3.5 h-3.5 text-[#3a5550] cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1e3030] text-[#e8f0ee] text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                          Daily volume of messages sent and delivered.
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#7a9490] mt-1 font-medium">
                      Last {days} days
                    </p>
                  </div>
                  
                  {/* Chart Toggles */}
                  <div className="flex items-center p-1 bg-[#131c1b] border border-[#1e3030] rounded-xl hidden sm:flex">
                    {(["volume", "delivery", "replies"] as const).map((metric) => (
                      <button
                        key={metric}
                        onClick={() => setChartMetric(metric)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                          chartMetric === metric
                            ? "bg-[#0d1111] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] border border-[#1e3030]"
                            : "text-[#7a9490] hover:text-[#e8f0ee] border border-transparent"
                        }`}
                      >
                        {metric}
                      </button>
                    ))}
                  </div>
                </div>
                {(overview?.dmsSent === 0 && (!automations || automations.length === 0)) ? (
                  <div className="flex flex-col items-center justify-center h-[260px] border border-dashed border-[#1e3030] rounded-xl bg-[#080c0c]/50 relative overflow-hidden group">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#00e599] opacity-5 blur-[60px] rounded-full pointer-events-none" />
                    
                    <div className="w-12 h-12 rounded-xl bg-[#131c1b] border border-[#1e3030] flex items-center justify-center mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                      <Activity className="w-6 h-6 text-[#7a9490]" />
                    </div>
                    
                    <h3 className="text-lg font-syne font-bold text-white mb-2 relative z-10">Waiting for Data</h3>
                    <p className="text-sm text-[#7a9490] max-w-[280px] text-center mb-6 relative z-10">
                      Create your first automation to start collecting leads and sending DMs automatically.
                    </p>
                    
                    <Link 
                      href="/dashboard/automations/new"
                      className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00e599] text-[#001a10] font-syne font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                      Create Automation
                    </Link>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={timeline ?? []}>
                      <CartesianGrid stroke="#1e3030" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#7a9490", fontSize: 11, fontFamily: "var(--font-jetbrains-mono, monospace)" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v.slice(5)}
                        dy={10}
                      />
                      <YAxis
                        tick={{ fill: "#7a9490", fontSize: 11, fontFamily: "var(--font-jetbrains-mono, monospace)" }}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#1e3030", strokeWidth: 1, strokeDasharray: "4 4" }} />
                      
                      {chartMetric === "volume" && (
                        <>
                          <Line
                            type="monotone"
                            dataKey="dmsSent"
                            name="Sent"
                            stroke="#00e599"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 5, fill: "#080c0c", stroke: "#00e599", strokeWidth: 2 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="dmsDelivered"
                            name="Delivered"
                            stroke="#00b87a"
                            strokeWidth={2}
                            dot={false}
                            strokeDasharray="4 4"
                            opacity={0.6}
                          />
                        </>
                      )}
                      
                      {chartMetric === "delivery" && (
                        <Line
                          type="monotone"
                          dataKey="dmsDelivered"
                          name="Delivered"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 5, fill: "#080c0c", stroke: "#3b82f6", strokeWidth: 2 }}
                        />
                      )}
                      
                      {chartMetric === "replies" && (
                        <Line
                          type="monotone"
                          dataKey="dmsReplied"
                          name="Replies"
                          stroke="#f0c060"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 5, fill: "#080c0c", stroke: "#f0c060", strokeWidth: 2 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </motion.div>
            )}

            {/* Right column */}
            {isLoading ? (
              <RightPanelSkeleton />
            ) : (
              <div className="space-y-5">
                {/* Usage meter */}
                <motion.div
                  className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 relative overflow-hidden shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e599] rounded-full opacity-5 blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-syne font-semibold text-white tracking-tight">
                        Monthly Usage
                      </h3>
                      <div className="relative group/tooltip">
                        <Info className="w-3.5 h-3.5 text-[#3a5550] cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1e3030] text-[#e8f0ee] text-xs rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                          Your limits reset on the 1st of every month.
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r from-[#00e599]/20 to-[#00b87a]/20 border border-[#00e599]/30 text-[#00e599] font-bold">
                      {usage?.plan ?? "FREE"}
                    </span>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#7a9490] font-medium">DMs sent</span>
                      <span className="text-white font-jetbrains-mono text-xs mt-0.5">
                        <span className="font-bold text-[#e8f0ee]">{formatNumber(planUsed)}</span>
                        {planLimits !== -1 && <span className="text-[#3a5550]"> / {formatNumber(planLimits)}</span>}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#131c1b] border border-[#1e3030] overflow-hidden p-[1px]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#00e599] to-[#00b87a]"
                        initial={{ width: 0 }}
                        animate={{ width: `${usagePct}%` }}
                        transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    {usagePct >= 80 && planLimits !== -1 && (
                      <p className="text-[11px] text-[#f0c060] font-medium mt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f0c060] animate-pulse" />
                        Approaching monthly limit
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Active automations */}
                <motion.div
                  className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 shadow-sm flex-1 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-base font-syne font-semibold text-white mb-5 tracking-tight flex-shrink-0">
                    Active Automations
                  </h3>
                  <div className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                    {(automations ?? [])
                      .filter((a: any) => a.status === "ACTIVE")
                      .slice(0, 4)
                      .map((a: any) => (
                        <Link href={`/dashboard/automations/${a.id}`} key={a.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#131c1b] transition-colors border border-transparent hover:border-[#1e3030] group">
                          <div className="w-2 h-2 rounded-full bg-[#00e599] shadow-[0_0_8px_rgba(0,229,153,0.5)] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#e8f0ee] truncate group-hover:text-white transition-colors">{a.name}</p>
                            <p className="text-[11px] text-[#7a9490] mt-0.5 font-jetbrains-mono">
                              {formatNumber(a._count?.dmLogs ?? 0)} DMs
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-[#3a5550] shrink-0 uppercase tracking-widest bg-[#0a1412] px-2 py-1 rounded-md border border-[#1e3030]">
                            {a.type}
                          </span>
                        </Link>
                      ))}
                    {(!automations || automations.length === 0) && (
                      <div className="flex flex-col items-center justify-center py-6 text-center h-full">
                        <div className="w-10 h-10 rounded-full bg-[#131c1b] border border-[#1e3030] flex items-center justify-center mb-3">
                          <Zap className="w-4 h-4 text-[#3a5550]" />
                        </div>
                        <p className="text-sm font-medium text-[#7a9490]">No active automations</p>
                        <Link href="/dashboard/automations/new" className="text-xs text-[#00e599] mt-1 hover:underline">
                          Create one to get started
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
