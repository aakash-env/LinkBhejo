"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList,
} from "recharts";
import { Sidebar } from "@/components/layout/Sidebar";
import { analyticsApi } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { TrendingUp, MessageSquare, Users, Send } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-dark rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-muted-foreground mb-1 text-xs">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{formatNumber(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { data: overview } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsApi.overview({ days: 30 }),
  });

  const { data: timeline } = useQuery({
    queryKey: ["analytics", "timeline", 30],
    queryFn: () => analyticsApi.timeline({ days: 30 }),
  });

  const { data: byAutomation } = useQuery({
    queryKey: ["analytics", "automations"],
    queryFn: () => analyticsApi.automations(),
  });

  const funnelData = [
    { name: "Comments Triggered", value: overview?.totalCommentTriggers ?? 0, fill: "#00e599" },
    { name: "DMs Sent", value: overview?.dmsSent ?? 0, fill: "#00cc88" },
    { name: "DMs Delivered", value: overview?.dmsDelivered ?? 0, fill: "#00b377" },
    { name: "Leads Collected", value: overview?.leadsCollected ?? 0, fill: "#009966" },
  ];

  const kpis = [
    { label: "Total DMs Sent", value: overview?.dmsSent ?? 0, icon: Send, color: "text-[#00e599]" },
    { label: "Delivered", value: overview?.dmsDelivered ?? 0, icon: MessageSquare, color: "text-[#00cc88]" },
    { label: "Leads Collected", value: overview?.leadsCollected ?? 0, icon: Users, color: "text-[#00b377]" },
    { label: "Conversion Rate", value: `${overview?.conversionRate ?? 0}%`, icon: TrendingUp, color: "text-[#009966]" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-8 py-5 border-b border-border glass-dark">
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Last 30 days performance</p>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {kpis.map((k, i) => (
              <motion.div
                key={k.label}
                className="glass-dark rounded-2xl p-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <k.icon className={`w-4 h-4 ${k.color}`} />
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {typeof k.value === "number" ? formatNumber(k.value) : k.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Timeline chart */}
          <motion.div
            className="glass-dark rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-base font-semibold text-white mb-6">DM Volume Over Time</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={timeline ?? []}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="dmsSent" name="Sent" stroke="#00e599" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="dmsDelivered" name="Delivered" stroke="#00664a" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Per-automation bar chart */}
            <motion.div
              className="glass-dark rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-base font-semibold text-white mb-6">By Automation</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={(byAutomation as any[]) ?? []} layout="vertical">
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="automationName" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="dmsSent" name="DMs Sent" fill="#00e599" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Conversion funnel */}
            <motion.div
              className="glass-dark rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-base font-semibold text-white mb-6">Conversion Funnel</h2>
              <div className="space-y-3">
                {funnelData.map((item, i) => {
                  const maxVal = funnelData[0].value || 1;
                  const pct = Math.max(5, (item.value / maxVal) * 100);
                  return (
                    <div key={item.name}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="text-white font-medium">{formatNumber(item.value)}</span>
                      </div>
                      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: item.fill }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.6, ease: "easeOut" }}
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
