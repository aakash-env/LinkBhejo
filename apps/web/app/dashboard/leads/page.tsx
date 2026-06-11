"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search, Download, Trash2, Mail, Instagram, Users,
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
    onError: () => toast.error("Failed to delete lead"),
  });

  async function handleExport() {
    const loadingToast = toast.loading("Preparing CSV export...");
    try {
      const blob = await leadsApi.exportCsv();
      downloadBlob(blob, `leads-${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="flex h-screen overflow-hidden theme-luxury bg-[#080c0c] text-white font-dm-sans selection:bg-[#00e599]/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        {/* Ambient glow */}
        <div className="absolute z-0 pointer-events-none w-[500px] h-[500px] top-[-150px] right-[-100px] opacity-30"
          style={{ background: "radial-gradient(circle at center, rgba(240,192,96,0.06) 0%, transparent 70%)" }} />

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-6 border-b border-[#1e3030] bg-[#080c0c]/80 backdrop-blur-xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-syne font-bold text-white tracking-tight">Leads</h1>
            <p className="text-sm text-[#7a9490] mt-1">
              {isLoading ? "Loading..." : `${total.toLocaleString()} leads collected`}
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black font-syne font-bold text-sm hover:opacity-90 transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        <div className="px-8 py-8 space-y-5 relative z-10">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a5550]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or handle..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0d1111] border border-[#1e3030] text-white text-sm placeholder:text-[#3a5550] focus:outline-none focus:border-[#00e599]/40 focus:ring-1 focus:ring-[#00e599]/20 transition-all"
            />
          </div>

          {/* Table */}
          <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e3030]">
                  {["Handle", "Name", "Email", "Source", "Date", ""].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-left text-xs font-semibold text-[#3a5550] uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  [1, 2, 3, 4, 5].map((n) => (
                    <tr key={n} className="border-b border-[#1e3030]/50">
                      {[1, 2, 3, 4, 5, 6].map((c) => (
                        <td key={c} className="px-6 py-4">
                          <div className="h-4 rounded-lg bg-[#131c1b] animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!isLoading && leads.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#131c1b] border border-[#1e3030] flex items-center justify-center mb-4">
                          <Users className="w-7 h-7 text-[#3a5550]" />
                        </div>
                        <p className="text-[#7a9490] font-medium">
                          {search ? "No leads match your search" : "No leads collected yet"}
                        </p>
                        <p className="text-[#3a5550] text-xs mt-1 max-w-[220px]">
                          {search ? "Try a different search term" : "Leads appear here when users interact with your automations"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {leads.map((lead: any, i: number) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[#1e3030]/40 hover:bg-[#131c1b]/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-3.5 h-3.5 text-[#3a5550] shrink-0" />
                        <span className="text-white font-medium">@{lead.igUsername ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#7a9490]">{lead.name ?? "—"}</td>
                    <td className="px-6 py-4">
                      {lead.email ? (
                        <div className="flex items-center gap-1.5 text-[#7a9490]">
                          <Mail className="w-3.5 h-3.5 text-[#3a5550]" />
                          {lead.email}
                        </div>
                      ) : (
                        <span className="text-[#3a5550]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#00e599]/10 text-[#00e599] border border-[#00e599]/20">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#3a5550] text-xs font-jetbrains-mono">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteMutation.mutate(lead.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#3a5550] hover:text-red-400 transition-all disabled:opacity-50"
                        title="Delete lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {/* Footer / pagination hint */}
            {leads.length > 0 && (
              <div className="px-6 py-3 border-t border-[#1e3030] flex items-center justify-between text-xs text-[#3a5550]">
                <span>Showing {leads.length} of {total} leads</span>
                {total > 50 && (
                  <span className="text-[#7a9490]">Export CSV to see all records</span>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
