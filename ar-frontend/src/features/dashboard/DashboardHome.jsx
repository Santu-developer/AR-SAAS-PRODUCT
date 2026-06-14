// ─── src/features/dashboard/DashboardHome.jsx ─────────────────────────────
// Premium SaaS Dashboard Home – Animated, Interactive, Glassmorphism Dark Theme
// All skills: frontend-design · impeccable · ui-ux-pro-max · motion-framer
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Store, CreditCard, TrendingUp, Activity,
  ArrowUpRight, Plus, Upload, UtensilsCrossed,
  BarChart3, Eye, Sparkles, Clock, CalendarDays,
  ChevronRight, Zap, MenuSquare,
  DollarSign, Users, QrCode,
} from "lucide-react";
import apiClient from "../../shared/lib/axios";
import Dashboard3DScene from "../../shared/components/common/Dashboard3DScene";

// ─── Animated Counter ─────────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1500, decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValue = useRef(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const start = prevValue.current;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(start + diff * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = value;
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration]);

  return <>{displayValue.toFixed(decimals)}</>;
}

// ─── Stagger Config ───────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 22 },
  },
};

const itemScale = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────
function KpiCard({ title, value, icon: Icon, trend, accent }) {
  const accentMap = {
    primary: { bg: "from-primary/25 to-primary/5", text: "text-primary", iconBg: "bg-primary/15", iconColor: "text-primary", glow: "shadow-primary/20" },
    emerald: { bg: "from-emerald-500/25 to-emerald-500/5", text: "text-emerald-400", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-400", glow: "shadow-emerald-500/20" },
    amber:   { bg: "from-amber-500/25 to-amber-500/5", text: "text-amber-400", iconBg: "bg-amber-500/15", iconColor: "text-amber-400", glow: "shadow-amber-500/20" },
    blue:    { bg: "from-blue-500/25 to-blue-500/5", text: "text-blue-400", iconBg: "bg-blue-500/15", iconColor: "text-blue-400", glow: "shadow-blue-500/20" },
    rose:    { bg: "from-rose-500/25 to-rose-500/5", text: "text-rose-400", iconBg: "bg-rose-500/15", iconColor: "text-rose-400", glow: "shadow-rose-500/20" },
  };
  const a = accentMap[accent] || accentMap.primary;

  return (
    <motion.div
      variants={itemScale}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 backdrop-blur-sm transition-all"
    >
      {/* Hover glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${a.bg} opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700`} />

      <div className="relative p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {title}
            </p>
            <motion.h3
              key={value}
              className="text-3xl font-bold tracking-tight text-foreground tabular-nums"
            >
              <AnimatedCounter value={Number(value)} decimals={0} />
            </motion.h3>
          </div>
          <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${a.iconBg} shrink-0`}>
            <Icon size={20} className={a.iconColor} />
            <div className={`absolute inset-0 rounded-xl ${a.iconBg} animate-pulse-glow opacity-0 group-hover:opacity-100`} />
          </div>
        </div>

        {trend && (
          <div className="mt-3 flex items-center gap-1.5">
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${a.text} bg-white/[0.04]`}>
              <Activity size={10} />
              <span>{trend}</span>
            </div>
          </div>
        )}

        {/* Decorative bottom border */}
        <div className={`absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r ${a.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      </div>
    </motion.div>
  );
}

// ─── Quick Action Card ─────────────────────────────────────────────────────
const quickActions = [
  {
    title: "Create Restaurant",
    description: "Add a new restaurant to your platform",
    icon: Plus,
    accent: "from-primary/25 to-primary/5",
    iconColor: "text-primary",
    iconBg: "bg-primary/15",
    path: "/dashboard/restaurants",
  },
  {
    title: "Upload 3D Model",
    description: "Add AR models to your menu items",
    icon: Upload,
    accent: "from-violet-500/25 to-violet-500/5",
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/15",
    path: "/dashboard/menus",
  },
  {
    title: "View Analytics",
    description: "Track scans, orders & revenue",
    icon: BarChart3,
    accent: "from-blue-500/25 to-blue-500/5",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/15",
    path: "/dashboard/analytics",
  },
  {
    title: "Upgrade Plan",
    description: "Unlock premium features & limits",
    icon: Zap,
    accent: "from-amber-500/25 to-amber-500/5",
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/15",
    path: "/dashboard/subscription",
  },
  {
    title: "Manage Menus",
    description: "Organize categories & items",
    icon: MenuSquare,
    accent: "from-emerald-500/25 to-emerald-500/5",
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/15",
    path: "/dashboard/menus",
  },
  {
    title: "QR Codes",
    description: "Generate & download table QR codes",
    icon: QrCode,
    accent: "from-cyan-500/25 to-cyan-500/5",
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/15",
    path: "/dashboard/tables",
  },
];

function QuickActionCard({ action, idx }) {
  const navigate = useNavigate();

  return (
    <motion.button
      variants={item}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(action.path)}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.05] bg-card/50 backdrop-blur-sm p-4 text-left transition-all"
    >
      {/* Gradient hover background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${action.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className={`relative mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${action.iconBg}`}>
          <action.icon size={18} className={action.iconColor} />
          <div className={`absolute inset-0 rounded-xl ${action.iconBg} animate-pulse-glow opacity-0 group-hover:opacity-100`} />
        </div>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
          {action.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          {action.description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <ArrowUpRight size={14} className="text-primary" />
      </div>
    </motion.button>
  );
}

// ─── Animated metric ring ─────────────────────────────────────────────────
function MetricRing({ value, label, color = "primary", max = 100 }) {
  const pct = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (pct / 100) * circumference;
  const colorMap = {
    primary: "stroke-primary",
    emerald: "stroke-emerald-400",
    amber: "stroke-amber-400",
    blue: "stroke-blue-400",
  };
  const trackMap = {
    primary: "stroke-primary/10",
    emerald: "stroke-emerald-400/10",
    amber: "stroke-amber-400/10",
    blue: "stroke-blue-400/10",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center">
        <svg width="80" height="80" className="-rotate-90">
          <circle cx="40" cy="40" r="36" fill="none" strokeWidth="4" className={trackMap[color] || trackMap.primary} />
          <motion.circle
            cx="40" cy="40" r="36" fill="none" strokeWidth="4"
            strokeLinecap="round"
            className={colorMap[color] || colorMap.primary}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
          />
        </svg>
        <span className="absolute text-lg font-bold text-foreground tabular-nums">
          <AnimatedCounter value={value} duration={1500} />
        </span>
      </div>
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
  );
}

// ─── Premium Hero Section ──────────────────────────────────────────────────
function PremiumHero({ user, healthError, loading, restaurantCount = 0 }) {
  const hour = new Date().getHours();
  let timeGreeting = "evening";
  if (hour < 12) timeGreeting = "morning";
  else if (hour < 17) timeGreeting = "afternoon";

  const greeting = `${timeGreeting}, ${user?.name ?? "Admin"}`;
  const healthStatus = healthError ? "Some services degraded" : "All systems operational";
  const healthColor = healthError ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10";
  const healthDot = healthError ? "bg-amber-400" : "bg-emerald-400";

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      variants={item}
      className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-card/40 backdrop-blur-sm"
    >
      {/* 3D decorative gradient blob */}
      <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent blur-2xl" />

      {/* Subtle grid lines */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(139,92,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.2) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Date badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays size={12} />
              <span>{dateStr}</span>
            </div>

            {/* Greeting with gradient */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Good{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-blue-400 bg-clip-text text-transparent">
                {timeGreeting}
              </span>
              , {user?.name?.split(" ")[0] || "Admin"}
            </h1>

            <p className="text-sm text-muted-foreground max-w-lg">
              Here&apos;s your platform overview. Monitor performance, track activity, and manage your operations.
            </p>
          </div>

          {/* Status badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Health status */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${healthColor}`}
            >
              <span className={`relative flex h-2 w-2 ${healthDot} rounded-full`}>
                {!healthError && (
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                )}
              </span>
              {healthStatus}
            </motion.div>

            {/* User role badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground"
            >
              <Sparkles size={10} className="text-primary" />
              {user?.role?.replace("_", " ") || "OWNER"}
            </motion.div>
          </div>
        </div>

        {/* Quick metric rings row */}
        <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 gap-4 pt-6 border-t border-white/[0.05]">
          <MetricRing value={restaurantCount} label="Restaurants" color="primary" max={10} />
          <MetricRing value={0} label="Active Orders" color="emerald" max={50} />
          <MetricRing value={0} label="Today Scans" color="blue" max={100} />
          <MetricRing value={0} label="Menu Items" color="amber" max={200} />
          <MetricRing value={0} label="Total Tables" color="primary" max={50} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Quick Actions Grid ────────────────────────────────────────────────────
function QuickActionsGrid() {
  return (
    <motion.div variants={item} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Zap size={16} className="text-primary" />
          Quick Actions
        </h2>
        <motion.button
          whileHover={{ x: 3 }}
          className="text-xs font-medium text-primary flex items-center gap-1 hover:underline"
        >
          View all
          <ChevronRight size={12} />
        </motion.button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action, idx) => (
          <QuickActionCard key={action.title} action={action} idx={idx} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Revenue Chart ──────────────────────────────────────────────────────────
function RevenueChart() {
  const { data: payments, isLoading, isError } = useQuery({
    queryKey: ["payments-history"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/payments/history").then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6 animate-pulse">
        <div className="h-4 w-32 bg-white/5 rounded mb-6" />
        <div className="h-48 bg-white/[0.03] rounded-xl" />
      </div>
    );
  }

  if (isError || !payments) {
    return (
      <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign size={32} className="text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No revenue data yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Revenue will appear once payments are processed</p>
        </div>
      </motion.div>
    );
  }

  // Aggregate monthly
  const monthly = {};
  (payments || []).forEach((p) => {
    const d = new Date(p.paymentDate || p.createdAt);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    monthly[key] = (monthly[key] || 0) + Number(p.amount || 0);
  });
  const labels = Object.keys(monthly).slice(-6);
  const values = Object.values(monthly).slice(-6);
  const maxVal = Math.max(...values, 1);

  return (
    <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp size={15} className="text-primary" />
            Revenue Overview
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Monthly payment volume</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-white/[0.04] rounded-lg px-2.5 py-1.5">
          <Clock size={12} />
          <span>This Year</span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="relative h-48 flex items-end gap-2">
        {values.map((v, i) => {
          const height = (v / maxVal) * 100;
          const colors = [
            "from-primary/80 to-primary/30",
            "from-blue-500/80 to-blue-500/30",
            "from-violet-500/80 to-violet-500/30",
            "from-emerald-500/80 to-emerald-500/30",
            "from-amber-500/80 to-amber-500/30",
            "from-cyan-500/80 to-cyan-500/30",
          ];
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-[10px] font-semibold text-foreground tabular-nums"
              >
                ${v.toLocaleString()}
              </motion.span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.3 + i * 0.08 }}
                className={`w-full max-w-[40px] rounded-t-lg bg-gradient-to-t ${colors[i % colors.length]} relative group`}
              >
                <div className="absolute inset-0 rounded-t-lg bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
              <span className="text-[10px] text-muted-foreground font-medium">{labels[i]}</span>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-white/[0.05] flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Total Revenue</span>
        <span className="text-sm font-bold text-foreground tabular-nums">
          ${values.reduce((a, b) => a + b, 0).toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}

// ─── QR Scan Chart ─────────────────────────────────────────────────────────
function QrScanChart() {
  const { data: scanData, isLoading, isError } = useQuery({
    queryKey: ["qrScans"],
    queryFn: () => apiClient.get("/api/v1/analytics/scans").then((r) => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6 animate-pulse">
        <div className="h-4 w-24 bg-white/5 rounded mb-6" />
        <div className="h-40 bg-white/[0.03] rounded-xl" />
      </div>
    );
  }

  if (isError || !scanData) {
    return (
      <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <QrCode size={28} className="text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No scan data yet</p>
        </div>
      </motion.div>
    );
  }

  const labels = (scanData || []).map((s) =>
    new Date(s.date || s.scannedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  );
  const values = (scanData || []).map((s) => s.scans ?? s.count ?? 0);
  const maxVal = Math.max(...values, 1);

  return (
    <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <QrCode size={14} className="text-primary" />
            QR Scan Activity
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Daily AR menu scans</p>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-white/[0.04] rounded-lg px-2.5 py-1.5">
          Last 7 days
        </span>
      </div>

      {/* Scan line chart */}
      <div className="relative h-40">
        <svg viewBox={`0 0 ${labels.length * 60} 160`} className="w-full h-full" preserveAspectRatio="none">
          {/* Gradient fill */}
          <defs>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const y = 140 - frac * 120;
            return (
              <line key={frac} x1="0" y1={y} x2={labels.length * 60} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
            );
          })}

          {/* Area fill */}
          <motion.path
            d={`M 0,140 ${values.map((v, i) => {
              const x = i * 60 + 30;
              const y = 140 - (v / maxVal) * 120;
              return `L ${x},${y}`;
            }).join(" ")} L ${(values.length - 1) * 60 + 30},140 Z`}
            fill="url(#scanGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Line */}
          <motion.path
            d={`${values.map((v, i) => {
              const x = i * 60 + 30;
              const y = 140 - (v / maxVal) * 120;
              return `${i === 0 ? "M" : "L"} ${x},${y}`;
            }).join(" ")}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
          />

          {/* Dots */}
          {values.map((v, i) => {
            const x = i * 60 + 30;
            const y = 140 - (v / maxVal) * 120;
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="hsl(var(--primary))"
                initial={{ opacity: 0, r: 0 }}
                animate={{ opacity: 1, r: 3 }}
                transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 300 }}
              />
            );
          })}
        </svg>
      </div>

      {/* Bottom labels */}
      <div className="flex justify-between mt-2">
        {labels.slice(0, 7).map((l, i) => (
          <span key={i} className="text-[10px] text-muted-foreground font-medium">{l}</span>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Top Items ──────────────────────────────────────────────────────────────
function TopItemsGrid() {
  const { data: topItems, isLoading, isError } = useQuery({
    queryKey: ["topItems"],
    queryFn: () => apiClient.get("/api/v1/analytics/top-items").then((r) => r.data.data),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-white/[0.03] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !topItems || topItems.length === 0) {
    return (
      <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <UtensilsCrossed size={28} className="text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No items yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Popular items will appear here</p>
        </div>
      </motion.div>
    );
  }

  const sorted = [...topItems].sort((a, b) => (b.views ?? b.count ?? 0) - (a.views ?? a.count ?? 0));
  const maxViews = Math.max(...sorted.map((i) => i.views ?? i.count ?? 1), 1);

  return (
    <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Eye size={14} className="text-primary" />
            Top AR Items
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Most viewed menu items</p>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.slice(0, 5).map((item, idx) => {
          const views = item.views ?? item.count ?? 0;
          const barWidth = (views / maxViews) * 100;
          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, type: "spring", stiffness: 200, damping: 22 }}
              className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 group hover:bg-white/[0.03] transition-colors"
            >
              {/* Rank badge */}
              <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-bold shrink-0 ${
                idx === 0 ? "bg-amber-500/15 text-amber-400" :
                idx === 1 ? "bg-slate-400/15 text-slate-300" :
                idx === 2 ? "bg-orange-500/15 text-orange-400" :
                "bg-white/[0.05] text-muted-foreground"
              }`}>
                {idx + 1}
              </span>

              {/* Item info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.name || `Item ${idx + 1}`}</p>
                {item.category && (
                  <p className="text-[10px] text-muted-foreground">{item.category}</p>
                )}
              </div>

              {/* Views count */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                <Eye size={11} />
                <span>{views}</span>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-white/[0.03] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.3 + idx * 0.06 }}
                  className={`h-full rounded-full ${
                    idx === 0 ? "bg-gradient-to-r from-amber-500 to-amber-400" :
                    idx === 1 ? "bg-gradient-to-r from-slate-400 to-slate-300" :
                    idx === 2 ? "bg-gradient-to-r from-orange-500 to-orange-400" :
                    "bg-gradient-to-r from-primary/60 to-primary/30"
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Recent Activity ────────────────────────────────────────────────────────
function RecentActivity() {
  const { data: authUser, isLoading: loadingAuth } = useQuery({
    queryKey: ["authMe"],
    queryFn: () => apiClient.get("/api/v1/auth/me").then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: currentSub } = useQuery({
    queryKey: ["currentSub"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/current").then((r) => r.data.data),
  });

  const { data: analyticsSummary } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => apiClient.get("/api/v1/analytics/summary").then((r) => r.data.data),
  });

  if (loadingAuth) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6 animate-pulse">
        <div className="h-4 w-24 bg-white/5 rounded mb-4" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 bg-white/[0.03] rounded-xl" />)}
        </div>
      </div>
    );
  }

  const items = [];
  if (authUser?.name) items.push({ title: "Admin logged in", subtitle: `Welcome, ${authUser.name}`, icon: Users, color: "text-primary bg-primary/15" });
  if (currentSub?.renewalDate) items.push({
    title: "Subscription renewal scheduled",
    subtitle: new Date(currentSub.renewalDate).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    icon: CreditCard,
    color: "text-emerald-400 bg-emerald-500/15",
  });
  if (analyticsSummary?.totalScans) items.push({
    title: "QR scans recorded",
    subtitle: `${analyticsSummary.totalScans} total scans`,
    icon: QrCode,
    color: "text-blue-400 bg-blue-500/15",
  });
  items.push({
    title: "System healthy",
    subtitle: "All services operational",
    icon: Activity,
    color: "text-emerald-400 bg-emerald-500/15",
  });

  return (
    <motion.div variants={item} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity size={14} className="text-primary" />
            Recent Activity
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Latest platform events</p>
        </div>
      </div>

      <div className="space-y-0">
        {items.map((evt, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08, type: "spring", stiffness: 200, damping: 22 }}
            className="relative flex gap-3 py-3 group"
          >
            {/* Timeline line */}
            {idx < items.length - 1 && (
              <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/[0.05]" />
            )}

            {/* Icon */}
            <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${evt.color} shrink-0`}>
              <evt.icon size={14} />
              <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{evt.title}</p>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{evt.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Dashboard Home ────────────────────────────────────────────────────
export default function DashboardHome() {
  const { data: user, isLoading: loadingUser, isError: userError } = useQuery({
    queryKey: ["authMe"],
    queryFn: () => apiClient.get("/api/v1/auth/me").then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { isError: healthError } = useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.get("/api/v1/health").then(() => true),
    retry: false,
  });

  const { data: subData } = useQuery({
    queryKey: ["subscriptionCurrent"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/current").then((r) => r.data.data),
  });

  const { data: paymentsData } = useQuery({
    queryKey: ["paymentsHistory"],
    queryFn: () => apiClient.get("/api/v1/subscriptions/payments/history").then((r) => r.data.data),
  });

  const { data: restaurantsData } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () =>
      apiClient.get("/api/v1/restaurants").then((res) => {
        const d = res.data.data;
        return Array.isArray(d) ? d : (d?.content || []);
      }),
    retry: 1,
    staleTime: 60 * 1000,
  });

  const restaurantCount = Array.isArray(restaurantsData) ? restaurantsData.length : 0;

  const kpiCards = [
    {
      title: "Restaurants",
      value: restaurantCount,
      icon: Store,
      trend: `${restaurantCount} location${restaurantCount !== 1 ? 's' : ''}`,
      accent: "primary",
    },
    {
      title: "Subscription",
      value: subData?.status === "ACTIVE" ? 1 : 0,
      icon: CreditCard,
      trend: subData?.status === "ACTIVE" ? "Active Plan" : "No Active Plan",
      accent: subData?.status === "ACTIVE" ? "emerald" : "rose",
    },
    {
      title: "Total Revenue",
      value: paymentsData?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0,
      icon: DollarSign,
      trend: `Sum of payments`,
      accent: "blue",
    },
    {
      title: "Today's Scans",
      value: 0,  // Will update when analytics API is connected
      icon: Activity,
      trend: "Feature coming soon",
      accent: "amber",
    },
  ];

  return (
    <div className="relative min-h-full">
      {/* 3D CSS Background */}
      <Dashboard3DScene />

      {/* Content */}
      <div className="relative z-10 py-6">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="space-y-6 px-1"
        >
          {/* Error state */}
          {userError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400 backdrop-blur-sm"
            >
              Unable to load dashboard data. Please try refreshing.
            </motion.div>
          )}

          {/* Premium Hero */}
          <PremiumHero
            user={user}
            healthError={healthError}
            loading={loadingUser}
            restaurantCount={restaurantCount}
          />

          {/* KPI Cards */}
          <motion.div
            variants={item}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {kpiCards.map((card) => (
              <KpiCard key={card.title} {...card} />
            ))}
          </motion.div>

          {/* Quick Actions */}
          <QuickActionsGrid />

          {/* Charts & Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart - 2 columns */}
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>

            {/* Top Items - 1 column */}
            <TopItemsGrid />
          </div>

          {/* Secondary: QR Scans + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <QrScanChart />
            </div>
            <RecentActivity />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
