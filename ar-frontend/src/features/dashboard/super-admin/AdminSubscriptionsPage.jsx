// ─── src/features/dashboard/super-admin/AdminSubscriptionsPage.jsx ─────────
// Premium Super Admin – Subscription Management
// View all tenant subscriptions, filter by plan/status, change status
// ────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Search,
  X,
  Crown,
  Star,
  Sparkles,
  Zap,
  Calendar,
  DollarSign,
  RefreshCw,
  Eye,
  RotateCcw,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { Dialog } from "../../../shared/components/ui/Dialog";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Variants ────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
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

const PLAN_ICONS = { TRIAL: Star, STARTER: Sparkles, GROWTH: Zap, ENTERPRISE: Crown };
const PLAN_COLORS = {
  TRIAL: "border-slate-500/30 text-slate-300 bg-slate-500/10",
  STARTER: "border-primary/30 text-primary bg-primary/10",
  GROWTH: "border-violet-500/30 text-violet-400 bg-violet-500/10",
  ENTERPRISE: "border-amber-500/30 text-amber-400 bg-amber-500/10",
};
const STATUS_COLORS = {
  ACTIVE: "bg-emerald-500/10 text-emerald-400",
  TRIAL: "bg-blue-500/10 text-blue-400",
  PAST_DUE: "bg-amber-500/10 text-amber-400",
  EXPIRED: "bg-red-500/10 text-red-400",
  CANCELLED: "bg-muted/80 text-muted-foreground",
  SUSPENDED: "bg-red-500/10 text-red-400",
};

export default function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedSub, setSelectedSub] = useState(null);

  // Fetch all subscriptions
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["adminSubscriptions"],
    queryFn: () => apiClient.get("/api/v1/admin/subscriptions").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  // Fetch tenants for cross-reference
  const { data: tenantsData } = useQuery({
    queryKey: ["adminTenants"],
    queryFn: () => apiClient.get("/api/v1/admin/tenants").then((r) => r.data.data),
    retry: 1,
  });

  const subscriptions = useMemo(() => {
    const items = Array.isArray(data) ? data : (data?.content || []);
    return items;
  }, [data]);

  const tenants = useMemo(() => {
    return Array.isArray(tenantsData) ? tenantsData : (tenantsData?.content || []);
  }, [tenantsData]);

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => apiClient.patch(`/api/v1/admin/subscriptions/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSubscriptions"] });
      toast.success("Subscription status updated");
      setSelectedSub(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
  });

  // Filter
  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const tenant = tenants.find((t) => t.id === s.tenantId);
      const name = (tenant?.name || tenant?.restaurantName || s.id || "").toLowerCase();
      const plan = (s.plan || "TRIAL").toUpperCase();
      const status = (s.status || "ACTIVE").toUpperCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === "ALL" || plan === planFilter;
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [subscriptions, tenants, searchQuery, planFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: subscriptions.length,
      active: subscriptions.filter((s) => s.status === "ACTIVE").length,
      trial: subscriptions.filter((s) => s.status === "TRIAL" || s.plan === "TRIAL").length,
      expired: subscriptions.filter((s) => s.status === "EXPIRED" || s.status === "CANCELLED").length,
    };
  }, [subscriptions]);

  if (isLoading) {
    return (
      <div className="relative min-h-full">
        <FloatingOrbs />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-56 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-72 rounded-lg bg-white/5 animate-pulse" /></div></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
          <div className="space-y-2">{[0,1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
                <p className="text-sm text-muted-foreground/80">Manage all tenant subscription plans and billing</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Total</p><p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p></div>
                <div className="rounded-xl bg-primary/10 p-3"><CreditCard size={18} className="text-primary" /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Active</p><p className="text-2xl font-bold text-foreground mt-1">{stats.active}</p></div>
                <div className="rounded-xl bg-emerald-500/10 p-3"><RotateCcw size={18} className="text-emerald-400" /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Trial</p><p className="text-2xl font-bold text-foreground mt-1">{stats.trial}</p></div>
                <div className="rounded-xl bg-blue-500/10 p-3"><Star size={18} className="text-blue-400" /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Expired/Cancelled</p><p className="text-2xl font-bold text-foreground mt-1">{stats.expired}</p></div>
                <div className="rounded-xl bg-red-500/10 p-3"><Calendar size={18} className="text-red-400" /></div>
              </div>
            </div>
          </motion.div>

          {/* Search + Filters */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input type="text" placeholder="Search by tenant name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-card/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"><X size={14} /></button>}
            </div>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm focus:border-primary/40 focus:outline-none"
            >
              <option value="ALL">All Plans</option>
              <option value="TRIAL">Trial</option>
              <option value="STARTER">Starter</option>
              <option value="GROWTH">Growth</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm focus:border-primary/40 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="PAST_DUE">Past Due</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </motion.div>

          {/* Table */}
          {filtered.length === 0 ? (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-20">
              <CreditCard size={36} className="text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No subscriptions found</p>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Tenant</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Period</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((sub, idx) => {
                      const tenant = tenants.find((t) => t.id === sub.tenantId);
                      const planId = (sub.plan || "TRIAL").toUpperCase();
                      const PlanIcon = PLAN_ICONS[planId] || Star;
                      const status = (sub.status || "ACTIVE").toUpperCase();
                      return (
                        <motion.tr key={sub.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                          className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><CreditCard size={14} /></div>
                              <span className="text-sm font-medium text-foreground">{tenant?.name || tenant?.restaurantName || sub.id?.slice(0, 8) || "—"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border", PLAN_COLORS[planId] || PLAN_COLORS.TRIAL)}>
                              <PlanIcon size={10} />
                              {planId}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium", STATUS_COLORS[status] || "bg-muted/80 text-muted-foreground")}>
                              <div className={cn("h-1.5 w-1.5 rounded-full", status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-current opacity-50")} />
                              {status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar size={10} />
                              {sub.currentPeriodStart ? new Date(sub.currentPeriodStart).toLocaleDateString() : "—"}
                              {" → "}
                              {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : "—"}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setSelectedSub(sub)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                                title="View details">
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {isFetching && (
                <div className="flex items-center justify-center py-3 border-t border-white/[0.05]">
                  <RefreshCw size={14} className="animate-spin text-muted-foreground" />
                  <span className="ml-2 text-xs text-muted-foreground">Syncing...</span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Subscription Detail Dialog */}
      <Dialog
        open={!!selectedSub}
        onClose={() => setSelectedSub(null)}
        title="Subscription Details"
        size="sm"
        footer={
          <div className="flex items-center gap-3 w-full justify-end">
            <Button variant="outline" onClick={() => setSelectedSub(null)}>Close</Button>
            {selectedSub && selectedSub.status !== "CANCELLED" && selectedSub.status !== "EXPIRED" && (
              <Button
                onClick={() => statusMutation.mutate({ id: selectedSub.id, status: "CANCELLED" })}
                disabled={statusMutation.isPending}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                {statusMutation.isPending ? "Processing..." : "Cancel Subscription"}
              </Button>
            )}
          </div>
        }
      >
        {selectedSub && (
          <div className="space-y-4">
            <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {tenants.find((t) => t.id === selectedSub.tenantId)?.name || "Unknown Tenant"}
                  </p>
                  <p className="text-xs text-muted-foreground">ID: {selectedSub.id?.slice(0, 12)}...</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-muted-foreground">Plan</span><p className="font-medium text-foreground capitalize">{selectedSub.plan || "Trial"}</p></div>
                <div><span className="text-xs text-muted-foreground">Status</span>
                  <p className={cn("font-medium", selectedSub.status === "ACTIVE" ? "text-emerald-400" : "text-muted-foreground")}>
                    {selectedSub.status?.replace("_", " ") || "—"}
                  </p>
                </div>
                <div><span className="text-xs text-muted-foreground">Period Start</span><p className="font-medium text-foreground">{selectedSub.currentPeriodStart ? new Date(selectedSub.currentPeriodStart).toLocaleDateString() : "—"}</p></div>
                <div><span className="text-xs text-muted-foreground">Period End</span><p className="font-medium text-foreground">{selectedSub.currentPeriodEnd ? new Date(selectedSub.currentPeriodEnd).toLocaleDateString() : "—"}</p></div>
              </div>
            </div>
            {selectedSub.razorpaySubscriptionId && (
              <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.06]">
                <p className="text-xs text-muted-foreground">Razorpay ID</p>
                <p className="text-xs font-mono text-foreground mt-0.5">{selectedSub.razorpaySubscriptionId}</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
