"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CreditCard, Check, ArrowUpRight, AlertTriangle, Zap, Shield, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";
import { billingApi } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

const PLANS = [
  {
    id: "FREE",
    name: "Free",
    price: "₹0",
    period: "/month",
    icon: Shield,
    iconColor: "#7a9490",
    features: [
      "100 DMs per month",
      "1 Instagram account",
      "Comment automation",
      "Basic analytics",
    ],
    cta: "Current plan",
    highlighted: false,
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹479",
    period: "/month",
    icon: Zap,
    iconColor: "#00e599",
    features: [
      "Unlimited DMs",
      "3 Instagram accounts",
      "All automation types",
      "AI-powered replies",
      "Drip sequences",
      "A/B testing",
      "Lead export (CSV)",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
  },
  {
    id: "AGENCY",
    name: "Agency",
    price: "₹4,999",
    period: "/month",
    icon: Building2,
    iconColor: "#3b82f6",
    features: [
      "Everything in Pro",
      "Unlimited accounts",
      "White-label dashboard",
      "Custom domain",
      "Team member access",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function BillingPage() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: billingApi.usage,
  });

  const currentPlan = usage?.plan ?? "FREE";
  const planLimits = usage?.limits?.dmsPerMonth ?? 100;
  const planUsed = usage?.usage?.dmsSent ?? 0;
  const usagePct = planLimits === -1 ? 5 : Math.min((planUsed / planLimits) * 100, 100);
  const isNearLimit = planLimits !== -1 && usagePct >= 80;

  async function handleUpgrade(plan: string) {
    try {
      const { url } = await billingApi.createCheckout({
        plan,
        successUrl: `${window.location.origin}/dashboard/billing?success=1`,
        cancelUrl: `${window.location.origin}/dashboard/billing`,
      });
      if (url) window.location.href = url;
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    }
  }

  async function handlePortal() {
    try {
      const { url } = await billingApi.portal(`${window.location.origin}/dashboard/billing`);
      if (url) window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal.");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden theme-luxury bg-[#080c0c] text-white font-dm-sans selection:bg-[#00e599]/30">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-0">
        {/* Ambient glow */}
        <div className="absolute z-0 pointer-events-none w-[500px] h-[500px] top-[-150px] right-[-100px] opacity-30"
          style={{ background: "radial-gradient(circle at center, rgba(0,229,153,0.06) 0%, transparent 70%)" }} />

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-6 border-b border-[#1e3030] bg-[#080c0c]/80 backdrop-blur-xl">
          <h1 className="text-2xl font-syne font-bold text-white tracking-tight">Billing & Plans</h1>
          <p className="text-sm text-[#7a9490] mt-1">Manage your subscription and usage</p>
        </div>

        <div className="px-8 py-8 space-y-8 relative z-10">
          {/* Current usage card */}
          <motion.div
            className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 relative overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#00e599] rounded-full opacity-5 blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between mb-6 relative z-10">
              <div>
                <p className="text-sm text-[#7a9490] font-medium">Current Plan</p>
                <div className="flex items-center gap-2.5 mt-2">
                  <CreditCard className="w-5 h-5 text-[#00e599]" />
                  <span className="text-2xl font-syne font-bold text-white">{currentPlan}</span>
                  {usage?.status === "TRIALING" && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#f0c060]/10 text-[#f0c060] border border-[#f0c060]/20 font-bold">
                      Trial
                    </span>
                  )}
                </div>
                {usage?.trialEndsAt && (
                  <p className="text-xs text-[#3a5550] mt-1.5">
                    Trial ends {new Date(usage.trialEndsAt).toLocaleDateString("en-IN")}
                  </p>
                )}
              </div>

              {currentPlan !== "FREE" && (
                <button
                  onClick={handlePortal}
                  className="flex items-center gap-1.5 text-sm text-[#00e599] hover:text-[#00cc88] transition-colors font-medium"
                >
                  Manage subscription
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Usage meter */}
            <div className="relative z-10">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-[#7a9490] font-medium">DMs this month</span>
                <span className="text-white font-jetbrains-mono text-xs">
                  <span className="font-bold">{formatNumber(planUsed)}</span>
                  {planLimits !== -1 && <span className="text-[#3a5550]"> / {formatNumber(planLimits)}</span>}
                  {planLimits === -1 && <span className="text-[#00e599] ml-1">(unlimited)</span>}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#131c1b] border border-[#1e3030] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: isNearLimit
                      ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                      : "linear-gradient(90deg, #00e599, #00b87a)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePct}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                />
              </div>
              {isNearLimit && (
                <div className="flex items-center gap-1.5 text-[#f0c060] text-xs mt-2 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f0c060] animate-pulse inline-block" />
                  Approaching monthly limit — upgrade for unlimited DMs
                </div>
              )}
            </div>
          </motion.div>

          {/* Pricing cards */}
          <div>
            <h2 className="text-base font-syne font-semibold text-white mb-5 tracking-tight">Choose a Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PLANS.map((plan, i) => {
                const PlanIcon = plan.icon;
                const isCurrent = currentPlan === plan.id;
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-2xl p-6 relative overflow-hidden transition-all ${
                      plan.highlighted
                        ? "border-2 border-[#00e599]/50 bg-[#00e599]/5 shadow-[0_0_30px_rgba(0,229,153,0.08)]"
                        : "border border-[#1e3030] bg-[#0d1111]"
                    } ${!isCurrent ? "hover:-translate-y-1 hover:border-[#2a4040]" : ""} duration-300`}
                  >
                    {plan.highlighted && (
                      <div className="absolute top-4 right-4">
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-gradient-to-r from-[#00e599] to-[#00b87a] text-[#001a10] font-bold uppercase tracking-wider">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {isCurrent && (
                      <div className="absolute top-4 right-4">
                        <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#131c1b] border border-[#1e3030] text-[#7a9490] font-bold uppercase tracking-wider">
                          Active
                        </span>
                      </div>
                    )}

                    <div className="mb-5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
                        style={{ backgroundColor: `${plan.iconColor}15`, borderColor: `${plan.iconColor}30` }}
                      >
                        <PlanIcon className="w-5 h-5" style={{ color: plan.iconColor }} />
                      </div>
                      <p className="text-sm font-medium text-[#7a9490]">{plan.name}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-syne font-bold text-white">{plan.price}</span>
                        <span className="text-[#3a5550] text-sm">{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-2.5 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-[#7a9490]">
                          <Check className="w-4 h-4 text-[#00e599] shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() =>
                        plan.id !== "FREE" && !isCurrent ? handleUpgrade(plan.id) : undefined
                      }
                      disabled={isCurrent || isLoading}
                      className={`w-full py-3 rounded-xl text-sm font-syne font-bold transition-all ${
                        isCurrent
                          ? "border border-[#1e3030] text-[#3a5550] cursor-default"
                          : plan.highlighted
                          ? "bg-gradient-to-r from-[#00e599] to-[#00b87a] text-[#001a10] hover:opacity-90 shadow-[0_4px_20px_rgba(0,229,153,0.3)]"
                          : "border border-[#1e3030] text-[#7a9490] hover:border-[#2a4040] hover:text-[#e8f0ee] hover:bg-[#131c1b]"
                      }`}
                    >
                      {isCurrent ? "Current Plan" : plan.cta}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* FAQ / note */}
          <motion.div
            className="bg-[#0d1111] border border-[#1e3030] rounded-2xl p-6 text-sm text-[#7a9490]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          >
            <p className="font-medium text-[#e8f0ee] mb-2">Billing & Cancellation</p>
            <p>Plans are billed monthly and can be cancelled anytime. No long-term commitments. For enterprise pricing or custom plans, <a href="mailto:support@linkbhejo.com" className="text-[#00e599] hover:underline">contact our team</a>.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
