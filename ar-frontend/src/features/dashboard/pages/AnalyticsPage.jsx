// ─── src/features/dashboard/pages/AnalyticsPage.jsx ───────────────────────────────
// Premium Analytics Dashboard – Full API Integration
// Summary cards + Daily scans chart + Top items + Revenue chart
// ────────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Eye,
  QrCode,
  DollarSign,
  Users,
  CalendarDays,
  Clock,
  ChevronDown,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Store,
  Activity,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { cn } from "../../../shared/lib/utils";

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
};

const chartColors = [
  "from-primary/80 to-primary/30",
  "from-blue-500/80 to-blue-500/30",
  "from-violet-500/80 to-violet-500/30",
  "from-emerald-500/80 to-emerald-500/30",
  "from-amber-500/80 to-amber-500/30",
  "from-cyan-500/80 to-cyan-500/30",
  "from-rose-500/80 to-rose-500/30",
];

// ─── Floating Orbs ───────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)" }} />
      <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)" }} />
      <motion.div animate={{ x: [0, 60, -40, 0], y: [0, -50, 30, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/3 top-1/2 h-48 w-48 rounded-full opacity-10 blur-2xl" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
    </div>
  );
}

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "", decimals = 0 }) {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = Number(value) || 0;
    if (start === end && displayed === end) return;
    const duration = 1000;
    const startTime = performance.now();
    let frameId;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        prevRef.current = end;
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [value]);

  return <>{displayed.toFixed(decimals)}{suffix}</>;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, accent = "primary", index = 0 }) {
  const accentMap = {
    primary: "from-primary/20 to-primary/5 border-primary/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
    rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20",
  };
  const iconBg = {
    primary: "bg-primary/15 text-primary", emerald: "bg-emerald-500/15 text-emerald-400",
    blue: "bg-blue-500/15 text-blue-400", amber: "bg-amber-500/15 text-amber-400",
    rose: "bg-rose-500/15 text-rose-400",
  };

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn("relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-500 hover:shadow-xl", accentMap[accent])}
    >
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground/80">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {typeof value === "string" ? value : <AnimatedCounter value={value} />}
          </p>
          {trend && <p className="flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp size={10} className="text-emerald-400" />{trend}</p>}
        </div>
        <div className={cn("rounded-xl p-3 backdrop-blur-sm shadow-lg", iconBg[accent])}><Icon size={20} /></div>
      </div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, labelKey, valueKey, height = 48, maxBars = 12 }) {
  const sliced = data?.slice(-maxBars) || [];
  const maxVal = Math.max(...sliced.map((d) => Number(d[valueKey]) || 0), 1);

  if (!sliced.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 size={32} className="text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No data yet</p>
      </div>
    );
  }

  return (
    <div className="relative h-48 flex items-end gap-2">
      {sliced.map((d, i) => {
        const val = Number(d[valueKey]) || 0;
        const h = (val / maxVal) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
              className="text-[10px] font-semibold text-foreground tabular-nums">{val}</motion.span>
            <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.2 + i * 0.05 }}
              className={cn("w-full max-w-[36px] rounded-t-lg bg-gradient-to-t relative group", chartColors[i % chartColors.length])}>
              <div className="absolute inset-0 rounded-t-lg bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <span className="text-[9px] text-muted-foreground font-medium truncate w-full text-center">{d[labelKey]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Top Items List ──────────────────────────────────────────────────────────
function TopItemsList({ items }) {
  if (!items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Eye size={28} className="text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No item views yet</p>
      </div>
    );
  }

  const maxViews = Math.max(...items.map((i) => i.views ?? i.count ?? 1), 1);
  const sorted = [...items].sort((a, b) => (b.views ?? b.count ?? 0) - (a.views ?? a.count ?? 0));

  return (
    <div className="space-y-2">
      {sorted.slice(0, 8).map((item, idx) => {
        const views = item.views ?? item.count ?? 0;
        return (
          <motion.div key={item.id || idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05, type: "spring", stiffness: 200, damping: 22 }}
            className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/[0.03] transition-colors"
          >
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold shrink-0",
              idx === 0 ? "bg-amber-500/15 text-amber-400" : idx === 1 ? "bg-slate-400/15 text-slate-300" : idx === 2 ? "bg-orange-500/15 text-orange-400" : "bg-white/[0.05] text-muted-foreground"
            )}>{idx + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{item.name || `Item ${idx + 1}`}</p>
              {item.category && <p className="text-[10px] text-muted-foreground">{item.category}</p>}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
              <Eye size={10} />{views}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-white/[0.03] overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(views / maxViews) * 100}%` }} transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.2 + idx * 0.05 }}
                className={cn("h-full rounded-full", idx === 0 ? "bg-gradient-to-r from-amber-500 to-amber-400" : idx === 1 ? "bg-gradient-to-r from-slate-400 to-slate-300" : idx === 2 ? "bg-gradient-to-r from-orange-500 to-orange-400" : "bg-gradient-to-r from-primary/60 to-primary/30")} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Line Chart (SVG) ────────────────────────────────────────────────────────
function LineChart({ data, labelKey, valueKey, color = "primary" }) {
  if (!data?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity size={28} className="text-muted-foreground/40 mb-3" />
        <p className="text-sm text-muted-foreground">No scan data yet</p>
      </div>
    );
  }

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const maxVal = Math.max(...values, 1);
  const width = Math.max(data.length * 60, 300);
  const height = 140;

  return (
    <div className="relative h-40">
      <svg viewBox={`0 0 ${width} 160`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
          const y = 140 - frac * 120;
          return <line key={frac} x1="0" y1={y} x2={width} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />;
        })}

        {/* Area */}
        <motion.path
          d={`M 0,140 ${values.map((v, i) => { const x = i * 60 + 30; const y = 140 - (v / maxVal) * 120; return `L ${x},${y}`; }).join(" ")} L ${(values.length - 1) * 60 + 30},140 Z`}
          fill="url(#lineGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />

        {/* Line */}
        <motion.path
          d={values.map((v, i) => { const x = i * 60 + 30; const y = 140 - (v / maxVal) * 120; return `${i === 0 ? "M" : "L"} ${x},${y}`; }).join(" ")}
          fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.3 }} />

        {/* Dots */}
        {values.map((v, i) => {
          const x = i * 60 + 30; const y = 140 - (v / maxVal) * 120;
          return <motion.circle key={i} cx={x} cy={y} r="3" fill="hsl(var(--primary))" initial={{ opacity: 0, r: 0 }} animate={{ opacity: 1, r: 3 }} transition={{ delay: 0.5 + i * 0.06, type: "spring", stiffness: 300 }} />;
        })}
      </svg>

      {/* Bottom labels */}
      <div className="flex justify-between mt-1">
        {data.slice(0, 7).map((d, i) => (
          <span key={i} className="text-[9px] text-muted-foreground font-medium">{d[labelKey]}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" /></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="h-48 bg-white/[0.03] rounded-xl" /></div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3">{[0,1,2,3,4].map(i => <div key={i} className="h-10 bg-white/[0.03] rounded-xl" />)}</div></div>
      </div>
    </div>
  );
}

// ─── Main AnalyticsPage ───────────────────────────────────────────────────────
export default function AnalyticsPage() {
  // ─── Fetch analytics summary ─────────────────────────────────────────
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => apiClient.get("/api/v1/analytics/summary").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  // ─── Fetch daily scans ──────────────────────────────────────────────
  const { data: scanData, isLoading: loadingScans } = useQuery({
    queryKey: ["analyticsScans"],
    queryFn: () => apiClient.get("/api/v1/analytics/scans").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  // ─── Fetch top items ────────────────────────────────────────────────
  const { data: topItems, isLoading: loadingTopItems } = useQuery({
    queryKey: ["analyticsTopItems"],
    queryFn: () => apiClient.get("/api/v1/analytics/top-items").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  // ─── Fetch payments for revenue ─────────────────────────────────────
  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ["paymentsHistory"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/payments/history").then((r) => r.data.data),
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

  // ─── Process scan data ──────────────────────────────────────────────
  const scanChartData = useMemo(() => {
    const items = Array.isArray(scanData) ? scanData : (scanData?.content || []);
    return items.slice(-14).map((s) => ({
      label: new Date(s.date || s.scannedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: s.scans ?? s.count ?? 0,
    }));
  }, [scanData]);

  // ─── Process revenue data ───────────────────────────────────────────
  const revenueChartData = useMemo(() => {
    const payments = Array.isArray(paymentsData) ? paymentsData : (paymentsData?.content || []);
    const monthly = {};
    payments.forEach((p) => {
      const d = new Date(p.paymentDate || p.createdAt);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthly[key] = (monthly[key] || 0) + Number(p.amount || 0);
    });
    return Object.entries(monthly).slice(-6).map(([label, value]) => ({ label, value }));
  }, [paymentsData]);

  // ─── Summary stats ──────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalScans: summary?.totalScans ?? (Array.isArray(scanData) ? scanData.reduce((s, d) => s + (d.scans ?? d.count ?? 0), 0) : 0),
    totalOrders: summary?.totalOrders ?? 0,
    totalRevenue: summary?.totalRevenue ?? (Array.isArray(paymentsData) ? paymentsData.reduce((s, p) => s + Number(p.amount || 0), 0) : 0),
    topItems: summary?.topItemCount ?? (Array.isArray(topItems) ? topItems.length : 0),
  }), [summary, scanData, paymentsData, topItems]);

  // ─── Loading ────────────────────────────────────────────────────────
  if (loadingSummary && loadingScans) return <><FloatingOrbs /><AnalyticsSkeleton /></>;

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10 space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* ─── Hero ────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-emerald-500/10" />
            <div className="relative z-10 flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05, rotate: 3 }} className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 via-blue-500/10 to-transparent ring-1 ring-blue-500/20 shadow-lg">
                <BarChart3 size={24} className="text-blue-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
                <p className="text-sm text-muted-foreground/80">Track scans, orders, and revenue performance</p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400">
                  <CalendarDays size={12} />This Month
                </span>
              </div>
            </div>
          </motion.div>

          {/* ─── Stats Grid ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={QrCode} label="Total Scans" value={stats.totalScans} trend="QR code scans" accent="primary" index={0} />
            <StatCard icon={Store} label="Total Orders" value={stats.totalOrders} trend="Customer orders" accent="emerald" index={1} />
            <StatCard icon={DollarSign} label="Revenue" value={stats.totalRevenue ? `$${Number(stats.totalRevenue).toLocaleString()}` : "$0"} trend="All time" accent="blue" index={2} />
            <StatCard icon={Eye} label="Top Items" value={stats.topItems} trend="Most viewed" accent="amber" index={3} />
          </div>

          {/* ─── Charts Row ──────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Scans Chart - 2 cols */}
            <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <QrCode size={14} className="text-primary" />Daily QR Scans
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Last 14 days</p>
                </div>
              </div>
              {loadingScans ? (
                <div className="h-40 bg-white/[0.03] rounded-xl animate-pulse" />
              ) : (
                <LineChart data={scanChartData} labelKey="label" valueKey="value" />
              )}
            </motion.div>

            {/* Top Items - 1 col */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Eye size={14} className="text-primary" />Top Viewed Items
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Most popular</p>
                </div>
              </div>
              {loadingTopItems ? (
                <div className="space-y-3">{[0,1,2,3,4].map(i => <div key={i} className="h-10 bg-white/[0.03] rounded-xl animate-pulse" />)}</div>
              ) : (
                <TopItemsList items={Array.isArray(topItems) ? topItems : (topItems?.content || topItems || [])} />
              )}
            </motion.div>
          </div>

          {/* ─── Revenue Chart + Summary ───────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Bar Chart - 2 cols */}
            <motion.div variants={itemVariants} className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign size={14} className="text-emerald-400" />Revenue Overview
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Monthly payment volume</p>
                </div>
              </div>
              {loadingPayments ? (
                <div className="h-48 bg-white/[0.03] rounded-xl animate-pulse" />
              ) : revenueChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DollarSign size={32} className="text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">No revenue data yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Revenue will appear once payments are processed</p>
                </div>
              ) : (
                <>
                  <BarChart data={revenueChartData} labelKey="label" valueKey="value" />
                  <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Revenue</span>
                    <span className="text-sm font-bold text-foreground tabular-nums">${revenueChartData.reduce((s, d) => s + d.value, 0).toLocaleString()}</span>
                  </div>
                </>
              )}
            </motion.div>

            {/* Summary insights */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-transparent p-4 border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">Total Scans</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalScans}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent p-4 border border-emerald-500/10">
                  <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent p-4 border border-amber-500/10">
                  <p className="text-xs text-muted-foreground mb-1">Top Items Tracked</p>
                  <p className="text-2xl font-bold text-foreground">{stats.topItems}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent p-4 border border-blue-500/10">
                  <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">${Number(stats.totalRevenue).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ─── Scan Data Table ────────────────────────────────────────── */}
          {scanChartData.length > 0 && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={14} className="text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Daily Scan Activity</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Scans</th>
                      <th className="w-1/2 py-2 px-3"><div className="h-2" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanChartData.slice(-14).reverse().map((d, i) => (
                      <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-2.5 px-3 text-xs text-foreground">{d.label}</td>
                        <td className="py-2.5 px-3 text-xs text-right tabular-nums text-foreground font-medium">{d.value}</td>
                        <td className="py-2.5 px-3">
                          <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(d.value / Math.max(...scanChartData.map(s => s.value), 1)) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.03 }}
                              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60" />
                          </div>
                        </td>
                      </motion.tr>
                    ))}
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
