"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Zap,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Instagram,
  GitBranch,
  ChevronRight,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";


const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/automations", icon: Zap, label: "Automations" },
  { href: "/dashboard/sequences", icon: GitBranch, label: "Sequences" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/leads", icon: Users, label: "Leads" },
  { href: "/dashboard/accounts", icon: Instagram, label: "Accounts" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="flex flex-col w-64 h-full border-r border-[#1e3030] bg-[#080c0c] shrink-0 font-dm-sans relative z-20">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-3 px-6 py-6 border-b border-[#1e3030]">
        <div className="flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="44" height="44" rx="10" stroke="#00e599" strokeWidth="2" />
            <path d="M16 14V34H32" stroke="#00e599" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-xl font-syne font-bold text-white tracking-tight">LinkBhejo</span>
      </Link>

      {/* Nav items */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "text-white"
                  : "text-[#7a9490] hover:text-white hover:bg-[#131c1b]"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-gradient-to-r from-[#00e599]/10 to-[#00b87a]/5 border border-[#00e599]/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon
                className={cn(
                  "w-4 h-4 relative z-10 transition-colors",
                  isActive ? "text-[#00e599]" : "group-hover:text-white"
                )}
              />
              <span className="relative z-10">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#00e599] relative z-10 opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-5 border-t border-[#1e3030] space-y-1 bg-[#080c0c]">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#7a9490] hover:text-white hover:bg-[#131c1b] w-full transition-all group">
          <Bell className="w-4 h-4 group-hover:text-white transition-colors" />
          Notifications
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#7a9490] hover:text-white hover:bg-[#131c1b] w-full transition-all group"
        >
          <LogOut className="w-4 h-4 group-hover:text-white transition-colors" />
          Sign out
        </button>

        {/* User avatar container */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-3 rounded-xl bg-[#0d1111] border border-[#1e3030]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e599] to-[#00b87a] flex items-center justify-center text-sm font-bold text-[#080c0c] shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-[#e8f0ee] truncate">
              {session?.user?.name ?? "Creator"}
            </p>
            <p className="text-xs font-jetbrains-mono text-[#7a9490] truncate mt-0.5">
              {session?.user?.email ?? ""}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
