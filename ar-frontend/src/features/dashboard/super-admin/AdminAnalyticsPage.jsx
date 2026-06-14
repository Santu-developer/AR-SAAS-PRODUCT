// ─── src/features/dashboard/super-admin/AdminAnalyticsPage.jsx ────────────────
// Premium Super Admin – Platform Analytics
// Full platform-wide stats, charts, and insights
// ────────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Activity,
  DollarSign,
  Users,
  Store,
  QrCode,
  Eye,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { cn } from "../../../shared/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
};

const chartColors = [
  "from-primary/80 to-primary/30", "from-blue-500/80 to-blue-500/30", "from-violet-500/80 to-violet-500/30",
  "from-emerald-500/80 to-emerald-500/30", "from-amber-500/80 to-amber-500/30", "from-cyan-500/80 to-cyan-500/30",
];

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

export default function AdminAnalyticsPage() {
  // Fetch admin stats
  const { data: adminStats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => apiClient.get("/api/v1/admin/dashboard").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  // Fetch analytics
  const { data: summary } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => apiClient.get("/api/v1/analytics/summary").then((r) => r.data.data),
    retry: 1,
  });
  const { data: topItems } = useQuery({
    queryKey: ["analyticsTopItems"],
    queryFn: () => apiClient.get("/api/v1/analytics/top-items").then((r) => r.data.data),
    retry: 1,
  });
  const { data: scanData } = useQuery({
    queryKey: ["analyticsScans"],
    queryFn: () => apiClient.get("/api/v1/analytics/scans").then((r) => r.data.data),
    retry: 1,
  });
  const { data: paymentsData } = useQuery({
    queryKey: ["paymentsHistory"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/payments/history").then((r) => r.data.data),
    retry: 1,
  });

  const scans = Array.isArray(scanData) ? scanData : (scanData?.content || []);
  const items = Array.isArray(topItems) ? topItems : (topItems?.content || []);
  const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.content || []);

  // Revenue by month
  const revenueMonthly = useMemo(() => {
    const monthly = {};
    payments.forEach((p) => {
      const d = new Date(p.paymentDate || p.createdAt);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthly[key] = (monthly[key] || 0) + Number(p.amount || 0);
    });
    return Object.entries(monthly).slice(-6).map(([label, value]) => ({ label, value }));
  }, [payments]);
  const maxRevenue = Math.max(...revenueMonthly.map((r) => r.value), 1);

  // Top items
  const topItemsSorted = useMemo(() => {
    return [...items].sort((a, b) => (b.views ?? b.count ?? 0) - (a.views ?? a.count ?? 0)).slice(0, 5);
  }, [items]);
  const maxItemViews = Math.max(...topItemsSorted.map((i) => i.views ?? i.count ?? 1), 1);

  const stats = adminStats || {};

  if (isLoading) {
    return (
      <div className="space-y-6">
        <FloatingOrbs />
        <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-56 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-72 rounded-lg bg-white/5 animate-pulse" /></div></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Hero */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-emerald-500/10" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 via-blue-500/10 to-transparent ring-1 ring-blue-500/20 shadow-lg">
                <BarChart3 size={24} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
                <p className="text-sm text-muted-foreground/80">Comprehensive platform-wide analytics and insights</p>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Store} label="Restaurants" value={stats.totalRestaurants ?? 0} accent="primary" />
            <StatCard icon={Users} label="Users" value={stats.totalUsers ?? 0} accent="blue" />
            <StatCard icon={QrCode} label="Total Scans" value={summary?.totalScans ?? scans.reduce((s, d) => s + (d.scans ?? d.count ?? 0), 0)} accent="emerald" />
            <StatCard icon={DollarSign} label="Revenue" value={stats.monthlyRevenue ? `$${Number(stats.monthlyRevenue).toLocaleString()}` : `$${payments.reduce((s, p) => s + Number(p.amount || 0), 0).toLocaleString()}`} accent="amber" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Bar Chart */}
            <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div><h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><DollarSign size={14} className="text-emerald-400" />Monthly Revenue</h3></div>
              </div>
              {revenueMonthly.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12"><DollarSign size={32} className="text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No revenue data yet</p></div>
              ) : (
                <div className="relative h-48 flex items-end gap-3">
                  {revenueMonthly.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.06 }}
                        className="text-[10px] font-semibold text-foreground tabular-nums">${d.value}</motion.span>
                      <motion.div initial={{ height: 0 }} animate={{ height: `${(d.value / maxRevenue) * 100}%` }} transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.2 + i * 0.06 }}
                        className={cn("w-full max-w-[40px] rounded-t-lg bg-gradient-to-t", chartColors[i % chartColors.length])} />
                      <span className="text-[9px] text-muted-foreground font-medium">{d.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Top Items */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4"><Eye size={14} className="text-primary" /><h3 className="text-sm font-semibold text-foreground">Top Items</h3></div>
              {topItemsSorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12"><Eye size={28} className="text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No data yet</p></div>
              ) : (
                <div className="space-y-2">
                  {topItemsSorted.map((item, idx) => {
                    const views = item.views ?? item.count ?? 0;
                    return (
                      <div key={item.id || idx} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                        <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold shrink-0",
                          idx === 0 ? "bg-amber-500/15 text-amber-400" : idx === 1 ? "bg-slate-400/15 text-slate-300" : idx === 2 ? "bg-orange-500/15 text-orange-400" : "bg-white/[0.05] text-muted-foreground"
                        )}>{idx + 1}</span>
                        <div className="flex-1"><p className="text-xs font-medium text-foreground truncate">{item.name || `Item ${idx + 1}`}</p></div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Eye size={10} />{views}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Scan Activity */}
          {scans.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4"><Activity size={14} className="text-primary" /><h3 className="text-sm font-semibold text-foreground">Scan Activity</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/[0.05]">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Scans</th>
                    <th className="py-2 px-3 w-1/2" />
                  </tr></thead>
                  <tbody>
                    {scans.slice(-10).reverse().map((s, i) => {
                      const val = s.scans ?? s.count ?? 0;
                      const maxVal = Math.max(...scans.map((x) => x.scans ?? x.count ?? 0), 1);
                      return (
                        <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                          className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-2 px-3 text-xs text-foreground">{new Date(s.date || s.scannedAt).toLocaleDateString()}</td>
                          <td className="py-2 px-3 text-xs text-right tabular-nums text-foreground font-medium">{val}</td>
                          <td className="py-2 px-3"><div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(val / maxVal) * 100}%` }} transition={{ duration: 0.5, delay: i * 0.03 }} className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60" /></div></td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ─── StatCard helper ──────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent = "primary" }) {
  const accentMap = { primary: "from-primary/20 to-primary/5 border-primary/20", emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20", blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20", amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20" };
  const iconBg = { primary: "bg-primary/15 text-primary", emerald: "bg-emerald-500/15 text-emerald-400", blue: "bg-blue-500/15 text-blue-400", amber: "bg-amber-500/15 text-amber-400" };
  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.02 }}
      className={cn("relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all hover:shadow-xl", accentMap[accent])}>
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2"><p className="text-sm font-medium text-muted-foreground/80">{label}</p><p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p></div>
        <div className={cn("rounded-xl p-3 backdrop-blur-sm shadow-lg", iconBg[accent])}><Icon size={20} /></div>
      </div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  );
}
