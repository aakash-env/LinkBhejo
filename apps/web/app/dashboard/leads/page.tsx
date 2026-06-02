"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, Download, Trash2, Mail, Instagram, Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { leadsApi } from "@/lib/api";
import { formatDate, downloadBlob } from "@/lib/utils";

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["leads", search],
    queryFn: () => leadsApi.list({ search, pageSize: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: leadsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted");
    },
  });

  async function handleExport() {
    const loadingToast = toast.loading("Preparing CSV export...");
    try {
      const res = await leadsApi.exportCsv();
      downloadBlob(res.data, `leads-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.dismiss(loadingToast);
      toast.success("CSV downloaded!");
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Export failed");
    }
  }

  const leads = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 px-8 py-5 border-b border-border glass-dark">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Leads</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {total} leads collected
              </p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-white hover:border-white/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or handle..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all"
            />
          </div>

          {/* Table */}
          <div className="glass-dark rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Handle", "Name", "Email", "Source", "Date", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  [1, 2, 3, 4, 5].map((n) => (
                    <tr key={n} className="border-b border-border/50">
                      {[1, 2, 3, 4, 5, 6].map((c) => (
                        <td key={c} className="px-6 py-4">
                          <div className="h-4 rounded shimmer" />
                        </td>
                      ))}
                    </tr>
                  ))}
                {!isLoading && leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      No leads found
                    </td>
                  </tr>
                )}
                {leads.map((lead: any, i: number) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/30 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-white font-medium">
                          @{lead.igUsername ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{lead.name ?? "—"}</td>
                    <td className="px-6 py-4">
                      {lead.email ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          {lead.email}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-xs">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteMutation.mutate(lead.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
