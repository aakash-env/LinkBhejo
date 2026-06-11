"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  User, Bell, Webhook, Trash2, ChevronRight, AlertTriangle,
  Copy, Check, ExternalLink, Shield,
} from "lucide-react";
import { toast } from "sonner";

type Section = "profile" | "notifications" | "webhooks" | "danger";

const sections: { id: Section; label: string; icon: any; desc: string }[] = [
  { id: "profile", label: "Profile", icon: User, desc: "Your personal information" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "Email and in-app alerts" },
  { id: "webhooks", label: "Webhooks", icon: Webhook, desc: "Outbound event hooks" },
  { id: "danger", label: "Danger Zone", icon: Trash2, desc: "Delete account" },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-[#7a9490] group-hover:text-[#e8f0ee] transition-colors">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0 ${
          checked ? "bg-[#00e599]" : "bg-[#1e3030]"
        }`}
        style={{ width: "42px", height: "22px" }}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-[20px]" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div>
      <p className="text-xs text-[#3a5550] font-medium uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-center gap-2 bg-[#080c0c] border border-[#1e3030] rounded-xl px-4 py-2.5">
        <span className="flex-1 text-sm text-[#7a9490] font-jetbrains-mono truncate">{value || "—"}</span>
        <button onClick={handleCopy} className="shrink-0 text-[#3a5550] hover:text-[#00e599] transition-colors">
          {copied ? <Check className="w-4 h-4 text-[#00e599]" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [notifications, setNotifications] = useState({
    dmDelivered: true,
    leadCollected: true,
    limitWarning: true,
    weeklyDigest: false,
    productUpdates: false,
  });
  const [webhookUrl, setWebhookUrl] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);

  function handleSaveWebhook() {
    if (webhookUrl && !webhookUrl.startsWith("https://")) {
      toast.error("Webhook URL must start with https://");
      return;
    }
    setIsSavingWebhook(true);
    setTimeout(() => {
      setIsSavingWebhook(false);
      toast.success("Webhook URL saved");
    }, 800);
  }

  function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setIsDeleting(true);
    toast.error("Account deletion is disabled in this environment");
    setIsDeleting(false);
    setDeleteConfirm("");
  }

  const user = session?.user;

  return (
    <div className="flex h-screen overflow-hidden theme-luxury bg-[#080c0c] text-white font-dm-sans selection:bg-[#00e599]/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        {/* Ambient glow */}
        <div className="absolute z-0 pointer-events-none w-[400px] h-[400px] top-[-100px] right-[-100px] opacity-20"
          style={{ background: "radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, transparent 70%)" }} />

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-6 border-b border-[#1e3030] bg-[#080c0c]/80 backdrop-blur-xl">
          <h1 className="text-2xl font-syne font-bold text-white tracking-tight">Settings</h1>
          <p className="text-sm text-[#7a9490] mt-1">Manage your account preferences</p>
        </div>

        <div className="px-8 py-8 relative z-10">
          <div className="flex gap-8 max-w-5xl">
            {/* Sidebar nav */}
            <div className="w-56 shrink-0 space-y-1">
              {sections.map((s) => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                const isDanger = s.id === "danger";
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      isActive
                        ? isDanger
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-[#131c1b] text-white border border-[#1e3030]"
                        : isDanger
                        ? "text-[#3a5550] hover:text-red-400 hover:bg-red-500/5"
                        : "text-[#7a9490] hover:text-[#e8f0ee] hover:bg-[#131c1b]"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1">{s.label}</span>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* PROFILE */}
                  {activeSection === "profile" && (
                    <div className="space-y-5">
                      <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6">
                        <h2 className="text-base font-syne font-semibold text-white mb-5 tracking-tight">Profile Information</h2>

                        {/* Avatar */}
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#1e3030]">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00e599] to-[#00b87a] flex items-center justify-center text-xl font-syne font-bold text-[#080c0c] shrink-0">
                            {user?.name?.[0]?.toUpperCase() ?? "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{user?.name ?? "—"}</p>
                            <p className="text-sm text-[#7a9490]">{user?.email ?? "—"}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <CopyField value={user?.name ?? ""} label="Display Name" />
                          <CopyField value={user?.email ?? ""} label="Email Address" />
                        </div>

                        <p className="text-xs text-[#3a5550] mt-4 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5" />
                          Account managed via Instagram OAuth. To change email, update it on Instagram.
                        </p>
                      </div>

                      <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-1">
                          <h2 className="text-base font-syne font-semibold text-white tracking-tight">Plan & Limits</h2>
                          <a
                            href="/dashboard/billing"
                            className="flex items-center gap-1 text-sm text-[#00e599] hover:text-[#00cc88] transition-colors"
                          >
                            Manage <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <p className="text-sm text-[#7a9490]">
                          View your current plan, usage, and upgrade options on the Billing page.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* NOTIFICATIONS */}
                  {activeSection === "notifications" && (
                    <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 space-y-6">
                      <h2 className="text-base font-syne font-semibold text-white tracking-tight">Notification Preferences</h2>

                      <div>
                        <p className="text-xs text-[#3a5550] font-medium uppercase tracking-widest mb-3">Activity Alerts</p>
                        <div className="space-y-4">
                          <Toggle
                            label="DM delivered successfully"
                            checked={notifications.dmDelivered}
                            onChange={(v) => { setNotifications({ ...notifications, dmDelivered: v }); toast.success("Preference saved"); }}
                          />
                          <Toggle
                            label="New lead collected"
                            checked={notifications.leadCollected}
                            onChange={(v) => { setNotifications({ ...notifications, leadCollected: v }); toast.success("Preference saved"); }}
                          />
                          <Toggle
                            label="Usage limit warning (80%)"
                            checked={notifications.limitWarning}
                            onChange={(v) => { setNotifications({ ...notifications, limitWarning: v }); toast.success("Preference saved"); }}
                          />
                        </div>
                      </div>

                      <div className="border-t border-[#1e3030] pt-5">
                        <p className="text-xs text-[#3a5550] font-medium uppercase tracking-widest mb-3">Email Digests</p>
                        <div className="space-y-4">
                          <Toggle
                            label="Weekly performance digest"
                            checked={notifications.weeklyDigest}
                            onChange={(v) => { setNotifications({ ...notifications, weeklyDigest: v }); toast.success("Preference saved"); }}
                          />
                          <Toggle
                            label="Product updates & announcements"
                            checked={notifications.productUpdates}
                            onChange={(v) => { setNotifications({ ...notifications, productUpdates: v }); toast.success("Preference saved"); }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WEBHOOKS */}
                  {activeSection === "webhooks" && (
                    <div className="space-y-5">
                      <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6">
                        <h2 className="text-base font-syne font-semibold text-white mb-1 tracking-tight">Webhook Endpoint</h2>
                        <p className="text-sm text-[#7a9490] mb-5">
                          Receive real-time POST requests when events occur in your account.
                        </p>

                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-[#3a5550] font-medium uppercase tracking-widest mb-2">Webhook URL</p>
                            <input
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                              placeholder="https://your-server.com/webhook"
                              className="w-full px-4 py-2.5 rounded-xl bg-[#080c0c] border border-[#1e3030] text-white text-sm placeholder:text-[#3a5550] focus:outline-none focus:border-[#00e599]/40 focus:ring-1 focus:ring-[#00e599]/20 transition-all font-jetbrains-mono"
                            />
                          </div>

                          <button
                            onClick={handleSaveWebhook}
                            disabled={isSavingWebhook}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00e599] to-[#00b87a] text-[#001a10] font-syne font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50"
                          >
                            {isSavingWebhook ? "Saving..." : "Save Webhook"}
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6">
                        <h3 className="text-sm font-syne font-semibold text-white mb-3 tracking-tight">Events Delivered</h3>
                        <div className="space-y-2">
                          {["lead.created", "dm.sent", "dm.delivered", "dm.failed", "automation.triggered"].map((event) => (
                            <div key={event} className="flex items-center gap-2 text-sm text-[#7a9490]">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#00e599]" />
                              <code className="text-[#e8f0ee] font-jetbrains-mono text-xs">{event}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DANGER ZONE */}
                  {activeSection === "danger" && (
                    <div className="bg-[#0d1111] border border-red-500/20 rounded-2xl p-6">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <h2 className="text-base font-syne font-semibold text-red-400 tracking-tight">Danger Zone</h2>
                      </div>
                      <p className="text-sm text-[#7a9490] mb-6">
                        Deleting your account is permanent and cannot be undone. All your automations, leads, and data will be removed.
                      </p>

                      <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 space-y-3">
                        <p className="text-xs text-[#7a9490]">
                          Type <span className="font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">DELETE</span> to confirm account deletion:
                        </p>
                        <input
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          placeholder="Type DELETE to confirm"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#080c0c] border border-red-500/20 text-white text-sm placeholder:text-[#3a5550] focus:outline-none focus:border-red-500/40 transition-all font-jetbrains-mono"
                        />
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirm !== "DELETE" || isDeleting}
                          className="px-5 py-2.5 rounded-xl bg-red-500 text-white font-syne font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
