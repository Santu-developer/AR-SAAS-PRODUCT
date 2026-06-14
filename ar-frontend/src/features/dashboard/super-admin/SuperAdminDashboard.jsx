// ─── src/features/dashboard/super-admin/SuperAdminDashboard.jsx ────────────────
// Premium Super Admin Dashboard – Full Platform Overview
// Uses existing super-admin components + full API integration
// ────────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Users,
  Store,
  CreditCard,
  TrendingUp,
  DollarSign,
  BarChart3,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { cn } from "../../../shared/lib/utils";

import DashboardHero from "./DashboardHero";
import GlobalSearch from "./GlobalSearch";
import QuickActions from "./QuickActions";
import KpiCard from "./KpiCard";
import RevenueChart from "./RevenueChart";
import QrScanChart from "./QrScanChart";
import TopItemsGrid from "./TopItemsGrid";
import RecentActivity from "./RecentActivity";

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
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
function SuperAdminSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" /></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
    </div>
  );
}

// ─── Main Super Admin Dashboard ──────────────────────────────────────────────
export default function SuperAdminDashboard() {
  // ─── Fetch platform stats ────────────────────────────────────────────
  const { data: adminStats, isLoading: loadingStats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => apiClient.get("/api/v1/admin/dashboard").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  // ─── Fetch tenants list ──────────────────────────────────────────────
  const { data: tenantsData, isLoading: loadingTenants } = useQuery({
    queryKey: ["adminTenants"],
    queryFn: () => apiClient.get("/api/v1/admin/tenants").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  const tenants = useMemo(() => {
    const items = Array.isArray(tenantsData) ? tenantsData : (tenantsData?.content || []);
    return items;
  }, [tenantsData]);

  // ─── Derive KPIs ─────────────────────────────────────────────────────
  const kpiData = useMemo(() => ({
    totalRestaurants: adminStats?.totalRestaurants ?? adminStats?.restaurants ?? tenants.length,
    totalUsers: adminStats?.totalUsers ?? adminStats?.users ?? 0,
    activeSubscriptions: adminStats?.activeSubscriptions ?? tenants.filter((t) => t.subscriptionStatus === "ACTIVE").length,
    monthlyRevenue: adminStats?.monthlyRevenue ?? adminStats?.revenue ?? 0,
    totalScans: adminStats?.totalScans ?? 0,
    totalOrders: adminStats?.totalOrders ?? 0,
  }), [adminStats, tenants]);

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loadingStats) return <><FloatingOrbs /><SuperAdminSkeleton /></>;

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10 space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Search + Actions */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <DashboardHero />
            <div className="flex items-center gap-3">
              <GlobalSearch />
              <QuickActions />
            </div>
          </motion.div>

          {/* ─── KPI Cards ───────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard title="Total Restaurants" value={kpiData.totalRestaurants} icon={Store} trend="Platform wide" accent="primary" delay={0} />
            <KpiCard title="Active Subscriptions" value={kpiData.activeSubscriptions} icon={CreditCard} trend="Paying tenants" accent="emerald" delay={0.05} />
            <KpiCard title="Monthly Revenue" value={`$${kpiData.monthlyRevenue.toLocaleString()}`} icon={DollarSign} trend="Current month" accent="amber" delay={0.1} />
            <KpiCard title="Total Users" value={kpiData.totalUsers} icon={Users} trend="All tenants" accent="blue" delay={0.15} />
          </motion.div>

          {/* ─── Charts Row ───────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart />
            <QrScanChart />
          </div>

          {/* ─── Recent Activity + Top Items ──────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TopItemsGrid />
            </div>
            <RecentActivity />
          </div>

          {/* ─── Tenants Overview Table ────────────────────────────────── */}
          {tenants.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Store size={14} className="text-primary" />Recent Tenants
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Latest registered restaurants</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.slice(0, 5).map((t, idx) => (
                      <motion.tr key={t.id || idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
                        className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4 text-xs font-medium text-foreground">{t.name || t.restaurantName || "—"}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground capitalize">{t.plan || "Trial"}</td>
                        <td className="py-3 px-4">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                            t.status === "ACTIVE" || t.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                          )}>
                            {t.status === "ACTIVE" || t.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-right text-muted-foreground">
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ─── Platform Stats Summary ────────────────────────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400"><Activity size={18} /></div>
                <div><p className="text-xs text-muted-foreground">Total Scans</p><p className="text-lg font-bold text-foreground">{kpiData.totalScans}</p></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><TrendingUp size={18} /></div>
                <div><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-lg font-bold text-foreground">{kpiData.totalOrders}</p></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400"><BarChart3 size={18} /></div>
                <div><p className="text-xs text-muted-foreground">Platform Health</p><p className="text-lg font-bold text-emerald-400">Operational</p></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
