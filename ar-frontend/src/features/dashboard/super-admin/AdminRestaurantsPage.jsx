// ─── src/features/dashboard/super-admin/AdminRestaurantsPage.jsx ──────────────
// Premium Super Admin – Restaurants List
// View all tenants, filter by plan/status, activate/deactivate
// ────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Store,
  Search,
  X,
  Power,
  PowerOff,
  CreditCard,
  RefreshCw,
  Eye,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
};

// ─── Floating Orbs ───────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)" }} />
      <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-56 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-72 rounded-lg bg-white/5 animate-pulse" /></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
      <div className="space-y-2">{[0,1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminRestaurantsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState("ALL");

  // Fetch all tenants (super admin)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["adminTenants"],
    queryFn: () => apiClient.get("/api/v1/admin/tenants").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  const tenants = useMemo(() => Array.isArray(data) ? data : (data?.content || []), [data]);

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, activate }) =>
      apiClient.post(`/api/v1/admin/tenants/${id}/${activate ? "activate" : "deactivate"}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTenants"] });
      toast.success("Tenant status updated");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  // Assign plan mutation
  const assignPlanMutation = useMutation({
    mutationFn: ({ id, plan }) =>
      apiClient.post(`/api/v1/admin/tenants/${id}/assign-plan`, { plan }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTenants"] });
      toast.success("Plan assigned");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to assign plan"),
  });

  // Filter
  const filtered = useMemo(() => {
    return tenants.filter((t) => {
      const name = (t.name || t.restaurantName || "").toLowerCase();
      const plan = (t.plan || "TRIAL").toUpperCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === "ALL" || plan === planFilter;
      const matchesActive = activeFilter === "ALL" ||
        (activeFilter === "ACTIVE" && t.isActive) ||
        (activeFilter === "INACTIVE" && !t.isActive);
      return matchesSearch && matchesPlan && matchesActive;
    });
  }, [tenants, searchQuery, planFilter, activeFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: tenants.length,
    active: tenants.filter((t) => t.isActive).length,
    inactive: tenants.filter((t) => !t.isActive).length,
  }), [tenants]);

  if (isLoading) return <><FloatingOrbs /><LoadingSkeleton /></>;

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Hero */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg">
                <Store size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">All Restaurants</h1>
                <p className="text-sm text-muted-foreground/80">Manage all tenant restaurants on the platform</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />{stats.active} active
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">{stats.total} total</span>
              </div>
            </div>
          </motion.div>

          {/* Search + Filters */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input type="text" placeholder="Search by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
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
            <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm focus:border-primary/40 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </motion.div>

          {/* Table */}
          {filtered.length === 0 ? (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-20 backdrop-blur-sm">
              <Store size={36} className="text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No tenants found</p>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Owner</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Joined</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t, idx) => (
                      <motion.tr key={t.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                        className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Store size={14} /></div>
                            <span className="text-sm font-medium text-foreground">{t.name || t.restaurantName || "—"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            t.plan === "ENTERPRISE" ? "bg-amber-500/10 text-amber-400" :
                            t.plan === "GROWTH" ? "bg-violet-500/10 text-violet-400" :
                            t.plan === "STARTER" ? "bg-primary/10 text-primary" :
                            "bg-slate-500/10 text-slate-400"
                          )}>{t.plan || "TRIAL"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            t.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-muted/80 text-muted-foreground"
                          )}>
                            <div className={cn("h-1.5 w-1.5 rounded-full", t.isActive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground")} />
                            {t.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{t.ownerName || t.owner?.name || "—"}</td>
                        <td className="py-3 px-4 text-xs text-right text-muted-foreground">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => toggleMutation.mutate({ id: t.id, activate: !t.isActive })}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                              title={t.isActive ? "Deactivate" : "Activate"}>
                              {t.isActive ? <PowerOff size={14} /> : <Power size={14} />}
                            </button>
                            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors" title="View details">
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
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
    </div>
  );
}
