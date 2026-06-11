"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Instagram, Plus, Link2, CheckCircle, AlertTriangle, RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { accountsApi } from "@/lib/api";
import { formatNumber, formatDate } from "@/lib/utils";

function AccountCard({ account }: { account: any }) {
  const isExpiringSoon =
    account.tokenExpiresAt &&
    new Date(account.tokenExpiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 relative overflow-hidden group hover:border-[#2a4040] hover:-translate-y-1 transition-all duration-300"
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00e599] to-[#00b87a] opacity-60" />
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00e599] rounded-full opacity-5 blur-3xl pointer-events-none group-hover:opacity-10 transition-opacity" />

      <div className="flex items-start gap-4 relative z-10">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#1e3030] flex items-center justify-center bg-[#131c1b]">
          {account.profilePictureUrl ? (
            <Image
              src={account.profilePictureUrl}
              alt={account.igUsername}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <Instagram className="w-6 h-6 text-[#00e599]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-syne font-bold text-white truncate">@{account.igUsername}</p>
            <CheckCircle className="w-4 h-4 text-[#00e599] shrink-0" />
          </div>
          <p className="text-sm text-[#7a9490] truncate">{account.igName}</p>

          {/* Stats row */}
          <div className="flex gap-4 mt-3 text-xs text-[#3a5550]">
            <span>
              <span className="text-white font-semibold font-jetbrains-mono">{formatNumber(account.followersCount ?? 0)}</span>{" "}
              followers
            </span>
            <span>
              <span className="text-white font-semibold font-jetbrains-mono">{account._count?.automations ?? 0}</span>{" "}
              automations
            </span>
          </div>
        </div>

        {isExpiringSoon && (
          <div className="flex items-center gap-1.5 text-[#f0c060] text-xs px-2.5 py-1.5 rounded-lg bg-[#f0c060]/10 border border-[#f0c060]/20 shrink-0">
            <AlertTriangle className="w-3 h-3" />
            Token expiring
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[#1e3030] flex items-center justify-between text-xs text-[#3a5550] relative z-10">
        <span>Connected {formatDate(account.createdAt)}</span>
        <div className="flex items-center gap-1.5 text-[#00e599]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00e599] animate-pulse" />
          Active
        </div>
      </div>
    </motion.div>
  );
}

function AccountCardSkeleton() {
  return (
    <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl h-[160px] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
    </div>
  );
}

export default function AccountsPage() {
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: accountsApi.list,
  });

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
            <h1 className="text-2xl font-syne font-bold text-white tracking-tight">Instagram Accounts</h1>
            <p className="text-sm text-[#7a9490] mt-1">
              {isLoading ? "Loading..." : `${accounts.length} account${accounts.length !== 1 ? "s" : ""} connected`}
            </p>
          </div>
          <button
            onClick={() => signIn("instagram")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00e599] to-[#00b87a] text-[#001a10] font-syne font-bold text-sm hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(0,229,153,0.25)]"
          >
            <Plus className="w-4 h-4" />
            Connect Account
          </button>
        </div>

        <div className="px-8 py-8 relative z-10">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => <AccountCardSkeleton key={n} />)}
            </div>
          ) : accounts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#0d1111] border border-[#1e3030] flex items-center justify-center mb-5 relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#00e599] opacity-0 group-hover:opacity-10 transition-opacity blur-xl" />
                <Instagram className="w-8 h-8 text-[#00e599]" />
              </div>
              <h2 className="text-xl font-syne font-bold text-white mb-2">No accounts connected</h2>
              <p className="text-[#7a9490] mb-6 max-w-sm text-sm">
                Connect your Instagram Business or Creator account to start automating DMs and collecting leads.
              </p>
              <button
                onClick={() => signIn("instagram")}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00e599] to-[#00b87a] text-[#001a10] font-syne font-bold text-sm hover:opacity-90 transition-all shadow-[0_4px_20px_rgba(0,229,153,0.3)]"
              >
                <Instagram className="w-4 h-4" />
                Connect Instagram
              </button>
              <div className="mt-5 flex items-center gap-2 text-xs text-[#3a5550]">
                <Link2 className="w-3.5 h-3.5" />
                Requires Instagram Business or Creator account
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(accounts as any[]).map((account: any) => (
                <AccountCard key={account.id} account={account} />
              ))}

              {/* Add more card */}
              <button
                onClick={() => signIn("instagram")}
                className="bg-[#0d1111] rounded-2xl p-6 border-dashed border-2 border-[#1e3030] hover:border-[#00e599]/40 hover:bg-[#131c1b] transition-all group flex flex-col items-center justify-center gap-3 text-[#3a5550] hover:text-[#7a9490] min-h-[160px]"
              >
                <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover:border-[#00e599]/50 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Add another account</span>
              </button>
            </div>
          )}

          {/* Reconnect reminder */}
          {(accounts as any[]).some((a: any) => a.tokenExpiresAt && new Date(a.tokenExpiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f0c060]/5 border border-[#f0c060]/20 text-sm text-[#f0c060]"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              One or more accounts have tokens expiring soon. Reconnect them to avoid interruptions.
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
