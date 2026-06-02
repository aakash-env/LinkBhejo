"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Instagram, Plus, Link2, Zap, Users, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { accountsApi } from "@/lib/api";
import { formatNumber, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

function AccountCard({ account }: { account: any }) {
  const isExpiringSoon =
    account.tokenExpiresAt &&
    new Date(account.tokenExpiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-2xl p-6 relative overflow-hidden"
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 gradient-bg" />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 gradient-bg-subtle border border-brand-500/20 flex items-center justify-center">
          {account.profilePictureUrl ? (
            <img src={account.profilePictureUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Instagram className="w-6 h-6 text-brand-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-white truncate">@{account.igUsername}</p>
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <p className="text-sm text-muted-foreground truncate">{account.igName}</p>

          {/* Stats row */}
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span>
              <span className="text-white font-semibold">
                {formatNumber(account.followersCount)}
              </span>{" "}
              followers
            </span>
            <span>
              <span className="text-white font-semibold">
                {account._count?.automations ?? 0}
              </span>{" "}
              automations
            </span>
          </div>
        </div>

        {isExpiringSoon && (
          <div className="flex items-center gap-1.5 text-amber-400 text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            Token expiring
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Connected {formatDate(account.createdAt)}</span>
        <div className="flex items-center gap-1 text-emerald-400">
          <div className="status-dot-active" />
          Active
        </div>
      </div>
    </motion.div>
  );
}

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-8 py-5 border-b border-border glass-dark">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Instagram Accounts</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {accounts.length} account{accounts.length !== 1 ? "s" : ""} connected
              </p>
            </div>
            <button
              onClick={() => signIn("instagram")}
              className="flex items-center gap-2 gradient-bg text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all glow-brand-sm"
            >
              <Plus className="w-4 h-4" />
              Connect Account
            </button>
          </div>
        </div>

        <div className="px-8 py-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="glass-dark rounded-2xl h-40 shimmer" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl gradient-bg-subtle border border-brand-500/20 flex items-center justify-center mb-4 animate-float">
                <Instagram className="w-8 h-8 text-brand-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No accounts connected</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Connect your Instagram Business or Creator account to start automating DMs.
              </p>
              <button
                onClick={() => signIn("instagram")}
                className="flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all glow-brand-sm"
              >
                <Instagram className="w-4 h-4" />
                Connect Instagram
              </button>
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Link2 className="w-3 h-3" />
                Requires Instagram Business or Creator account
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {accounts.map((account: any) => (
                <AccountCard key={account.id} account={account} />
              ))}

              {/* Add more card */}
              <button
                onClick={() => signIn("instagram")}
                className="glass rounded-2xl p-6 border-dashed border-2 border-border hover:border-brand-500/40 transition-all group flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-white min-h-[160px]"
              >
                <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:border-brand-400 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Add another account</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
