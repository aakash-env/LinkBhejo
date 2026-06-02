"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CreditCard, Zap, Check, ArrowUpRight, AlertTriangle } from "lucide-react";
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
    price: "₹479.85",
    period: "/month",
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
  const { data: usage } = useQuery({
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
      toast.error("Failed to start checkout");
    }
  }

  async function handlePortal() {
    try {
      const { url } = await billingApi.portal(`${window.location.origin}/dashboard/billing`);
      if (url) window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 px-8 py-5 border-b border-border glass-dark">
          <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your subscription and usage
          </p>
        </div>

        <div className="px-8 py-6 space-y-8">
          {/* Current usage card */}
          <motion.div
            className="glass-dark rounded-2xl p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-bold text-white">{currentPlan}</span>
                  {usage?.status === "TRIALING" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Trial
                    </span>
                  )}
                </div>
                {usage?.trialEndsAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Trial ends{" "}
                    {new Date(usage.trialEndsAt).toLocaleDateString("en-IN")}
                  </p>
                )}
              </div>
              {currentPlan !== "FREE" && (
                <button
                  onClick={handlePortal}
                  className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Manage subscription
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Usage meter */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">DMs this month</span>
                <span className="text-white font-medium">
                  {formatNumber(planUsed)}
                  {planLimits !== -1 && ` / ${formatNumber(planLimits)}`}
                  {planLimits === -1 && " (unlimited)"}
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: isNearLimit
                      ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                      : "linear-gradient(90deg, #6271f1, #a78bfa)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${usagePct}%` }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                />
              </div>
              {isNearLimit && (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  You&apos;re approaching your monthly limit. Upgrade for unlimited DMs.
                </div>
              )}
            </div>
          </motion.div>

          {/* Pricing cards */}
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Choose a Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-6 relative overflow-hidden transition-all ${plan.highlighted
                    ? "border-2 border-brand-500/60 bg-brand-500/5 glow-brand-sm"
                    : "glass-dark"
                    }`}
                >
                  {plan.highlighted && (
                    <div className="absolute top-4 right-4">
                      <span className="text-xs px-2.5 py-1 rounded-full gradient-bg text-white font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() =>
                      plan.id !== "FREE" && currentPlan !== plan.id
                        ? handleUpgrade(plan.id)
                        : undefined
                    }
                    disabled={currentPlan === plan.id}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${currentPlan === plan.id
                      ? "border border-border text-muted-foreground cursor-default"
                      : plan.highlighted
                        ? "gradient-bg text-white hover:opacity-90 glow-brand-sm"
                        : "border border-brand-500/30 text-brand-400 hover:bg-brand-500/10"
                      }`}
                  >
                    {currentPlan === plan.id ? "Current Plan" : plan.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
