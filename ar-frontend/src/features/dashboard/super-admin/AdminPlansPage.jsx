// ─── src/features/dashboard/super-admin/AdminPlansPage.jsx ────────────────────
// Premium Super Admin – Plans & Subscriptions Management
// View all plans, tenant subscriptions, assign/change plans
// ────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Crown,
  Star,
  Sparkles,
  Zap,
  Users,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Variants ────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
};

function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)" }} />
      <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
    </div>
  );
}

const PLAN_DETAILS = [
  { id: "TRIAL", name: "Trial", icon: Star, price: 0, color: "slate", border: "border-slate-500/30", bg: "from-slate-500/10 to-slate-500/5", text: "text-slate-300" },
  { id: "STARTER", name: "Starter", icon: Sparkles, price: 29, color: "primary", border: "border-primary/30", bg: "from-primary/20 to-primary/5", text: "text-primary" },
  { id: "GROWTH", name: "Growth", icon: Zap, price: 79, color: "violet", border: "border-violet-500/30", bg: "from-violet-500/10 to-violet-500/5", text: "text-violet-400" },
  { id: "ENTERPRISE", name: "Enterprise", icon: Crown, price: 199, color: "amber", border: "border-amber-500/30", bg: "from-amber-500/10 to-amber-500/5", text: "text-amber-400" },
];

export default function AdminPlansPage() {
  const queryClient = useQueryClient();

  // Fetch all plans
  const { data: plansData } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/plans").then((r) => r.data.data),
    retry: 1,
  });

  // Fetch all tenants for subscription counts
  const { data: tenantsData, isLoading } = useQuery({
    queryKey: ["adminTenants"],
    queryFn: () => apiClient.get("/api/v1/admin/tenants").then((r) => r.data.data),
    retry: 1,
  });

  const plans = useMemo(() => Array.isArray(plansData) ? plansData : [], [plansData]);
  const tenants = useMemo(() => {
    const items = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.content || []);
    return items;
  }, [tenantsData]);

  // Plan distribution
  const planDistribution = useMemo(() => {
    const dist = { TRIAL: 0, STARTER: 0, GROWTH: 0, ENTERPRISE: 0 };
    tenants.forEach((t) => {
      const p = (t.plan || "TRIAL").toUpperCase();
      if (dist[p] !== undefined) dist[p]++;
    });
    return dist;
  }, [tenants]);

  const totalRevenue = useMemo(() => {
    return tenants.reduce((sum, t) => {
      const plan = PLAN_DETAILS.find((p) => p.id === (t.plan || "TRIAL").toUpperCase());
      return sum + (plan?.price || 0);
    }, 0);
  }, [tenants]);

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Hero */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-primary/10" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 via-emerald-500/10 to-transparent ring-1 ring-emerald-500/20 shadow-lg">
                <CreditCard size={24} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Plans & Subscriptions</h1>
                <p className="text-sm text-muted-foreground/80">Manage platform subscription plans and tenant billing</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Total Tenants</p><p className="text-2xl font-bold text-foreground mt-1">{tenants.length}</p></div>
                <div className="rounded-xl bg-primary/10 p-3"><Users size={18} className="text-primary" /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Monthly Revenue</p><p className="text-2xl font-bold text-foreground mt-1">${totalRevenue.toLocaleString()}</p></div>
                <div className="rounded-xl bg-emerald-500/10 p-3"><DollarSign size={18} className="text-emerald-400" /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Avg. Plan Value</p><p className="text-2xl font-bold text-foreground mt-1">${tenants.length ? Math.round(totalRevenue / tenants.length) : 0}</p></div>
                <div className="rounded-xl bg-amber-500/10 p-3"><TrendingUp size={18} className="text-amber-400" /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Paid Plans</p><p className="text-2xl font-bold text-foreground mt-1">{planDistribution.STARTER + planDistribution.GROWTH + planDistribution.ENTERPRISE}</p></div>
                <div className="rounded-xl bg-blue-500/10 p-3"><Crown size={18} className="text-blue-400" /></div>
              </div>
            </div>
          </motion.div>

          {/* Plan Distribution Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN_DETAILS.map((plan, idx) => (
              <motion.div key={plan.id} variants={itemVariants}
                className={cn("relative overflow-hidden rounded-2xl border bg-card/40 backdrop-blur-sm p-5 transition-all hover:shadow-lg", plan.border)}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20", plan.bg)} />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg", plan.bg)}>
                      <plan.icon size={18} className={plan.text} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{plan.name}</h3>
                      <p className={cn("text-sm font-bold", plan.text)}>${plan.price}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-foreground">{planDistribution[plan.id]}</span>
                    <span className="text-xs text-muted-foreground">tenants</span>
                  </div>
                  {tenants.length > 0 && (
                    <div className="mt-3 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(planDistribution[plan.id] / tenants.length) * 100}%` }}
                        transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                        className={cn("h-full rounded-full", plan.id === "ENTERPRISE" ? "bg-amber-400" : plan.id === "GROWTH" ? "bg-violet-400" : plan.id === "STARTER" ? "bg-primary" : "bg-slate-400")} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Subscriptions Table */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CreditCard size={14} className="text-primary" />Tenant Plans
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">{tenants.length} total</span>
            </div>
            {isLoading ? (
              <div className="space-y-2">{[0,1,2,3].map(i => <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Tenant</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.slice(0, 10).map((t, idx) => {
                      const plan = PLAN_DETAILS.find((p) => p.id === (t.plan || "TRIAL").toUpperCase());
                      return (
                        <motion.tr key={t.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                          className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-4 text-xs font-medium text-foreground">{t.name || t.restaurantName || "—"}</td>
                          <td className="py-3 px-4">
                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", plan?.border || "border-slate-500/30")}>
                              {plan?.icon && <plan.icon size={10} className={plan?.text} />}
                              {plan?.name || plan?.id || "Trial"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                              t.isActive || t.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-muted/80 text-muted-foreground"
                            )}>{t.isActive ? "Active" : "Inactive"}</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-right tabular-nums text-foreground font-medium">${plan?.price || 0}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
