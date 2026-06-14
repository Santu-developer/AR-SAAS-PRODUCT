// ─── src/features/dashboard/pages/OrdersPage.jsx ───────────────────────────────
// Premium Order Management – Full API Integration
// Status workflow: PENDING → ACCEPTED → PREPARING → READY → DELIVERED
// Restaurant selector + Real-time order cards + Status filters
// ────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Truck,
  UtensilsCrossed,
  ChevronDown,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Receipt,
  Users,
  TrendingUp,
  DollarSign,
  Table2,
  Eye,
  MoreHorizontal,
  CalendarDays,
  Timer,
  Package,
  X,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Floating Orbs Background ─────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, -20, 60, 0], y: [0, -30, 50, 10, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, -50, 30, -20, 0], y: [0, 40, -30, 20, 0], scale: [1, 0.9, 1.1, 0.95, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, 80, -60, 40, 0], y: [0, -60, 40, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/3 h-48 w-48 rounded-full opacity-10 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0, scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// ─── Status config ────────────────────────────────────────────────────────────
const ORDER_STATUSES = [
  { key: "ALL", label: "All Orders", icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
  { key: "PENDING", label: "Pending", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "ACCEPTED", label: "Accepted", icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "PREPARING", label: "Preparing", icon: ChefHat, color: "text-violet-400", bg: "bg-violet-500/10" },
  { key: "READY", label: "Ready", icon: Package, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "DELIVERED", label: "Delivered", icon: Truck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "CANCELLED", label: "Cancelled", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
];

const STATUS_FLOW = ["PENDING", "ACCEPTED", "PREPARING", "READY", "DELIVERED"];

const statusStyles = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PREPARING: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  READY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DELIVERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
};

const statusIcons = {
  PENDING: Clock,
  ACCEPTED: CheckCircle2,
  PREPARING: ChefHat,
  READY: Package,
  DELIVERED: Truck,
  CANCELLED: XCircle,
};

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
    primary: "bg-primary/15 text-primary",
    emerald: "bg-emerald-500/15 text-emerald-400",
    blue: "bg-blue-500/15 text-blue-400",
    amber: "bg-amber-500/15 text-amber-400",
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
          <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p>
          {trend && <p className="flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp size={10} className="text-emerald-400" />{trend}</p>}
        </div>
        <div className={cn("rounded-xl p-3 backdrop-blur-sm shadow-lg", iconBg[accent])}><Icon size={20} /></div>
      </div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  );
}

// ─── Restaurant Selector ──────────────────────────────────────────────────────
function RestaurantSelector({ restaurants, selectedId, onSelect, isLoading }) {
  const [open, setOpen] = useState(false);
  const selected = restaurants?.find((r) => r.id === selectedId);

  if (isLoading) return <Skeleton className="h-11 w-64 rounded-xl" />;
  if (!restaurants?.length) return null;

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex h-11 w-64 items-center justify-between gap-2 rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm transition-colors hover:border-primary/50"
      >
        <span className="truncate">{selected?.name || "Select a restaurant..."}</span>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-white/10 bg-card/95 shadow-xl backdrop-blur-xl"
            >
              {restaurants.map((r) => (
                <button key={r.id} type="button" onClick={() => { onSelect(r.id); setOpen(false); }}
                  className={cn("flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors", r.id === selectedId ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50")}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><ShoppingBag size={14} /></div>
                  <div className="text-left"><p className="font-medium">{r.name}</p><p className="text-xs text-muted-foreground">{r.cuisineType || "Restaurant"}</p></div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order, onUpdateStatus, onCancel, isUpdating }) {
  const StatusIcon = statusIcons[order.status] || ShoppingBag;
  const canCancel = ["PENDING", "ACCEPTED"].includes(order.status);
  const nextStatusIndex = STATUS_FLOW.indexOf(order.status) + 1;
  const nextStatus = nextStatusIndex < STATUS_FLOW.length ? STATUS_FLOW[nextStatusIndex] : null;

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div variants={itemVariants} layout
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Status indicator line */}
      <div className={cn("absolute left-0 top-0 h-full w-1 transition-all duration-300", order.status === "CANCELLED" ? "bg-gradient-to-b from-red-400 to-red-600" : order.status === "DELIVERED" ? "bg-gradient-to-b from-emerald-400 to-emerald-600" : "bg-gradient-to-b from-primary/40 to-primary/60")} />

      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Order #{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}</h3>
                <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", statusStyles[order.status] || "bg-muted text-muted-foreground")}>
                  <StatusIcon size={10} />
                  {order.status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1"><Table2 size={10} />Table {order.tableNumber || order.tableId?.slice(0, 6)}</span>
                <span className="flex items-center gap-1"><Timer size={10} />{formatTime(order.createdAt)}</span>
              </div>
            </div>
          </div>
          <span className="text-lg font-bold text-foreground tabular-nums">${order.totalAmount?.toFixed(2)}</span>
        </div>

        {/* Items preview */}
        {order.items?.length > 0 && (
          <div className="mb-3 rounded-xl bg-muted/30 p-3">
            <div className="space-y-1.5">
              {order.items.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{item.quantity}x</span> {item.itemName || "Item"}
                  </span>
                  <span className="tabular-nums text-muted-foreground">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {order.items.length > 4 && (
                <p className="text-xs text-muted-foreground/60 pt-1 border-t border-white/5">+{order.items.length - 4} more items</p>
              )}
            </div>
          </div>
        )}

        {/* Customer info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Users size={10} />
          <span>{order.customerName || order.customer?.name || "Walk-in Customer"}</span>
          {order.notes && (
            <>
              <span className="text-muted-foreground/30">|</span>
              <span className="italic">"{order.notes}"</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-white/5 pt-3">
          {nextStatus && order.status !== "CANCELLED" && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                onClick={() => onUpdateStatus(order.id, nextStatus)}
                disabled={isUpdating}
                className="gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
              >
                {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <ArrowRight size={12} />}
                Move to {nextStatus}
              </Button>
            </motion.div>
          )}
          {canCancel && (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCancel(order.id)}
                disabled={isUpdating}
                className="gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <XCircle size={12} />
                Cancel
              </Button>
            </motion.div>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Eye size={11} />
            Details
          </motion.button>
        </div>
      </div>

      {/* Hover glow */}
      <div className={cn("absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-30 pointer-events-none", order.status === "CANCELLED" ? "bg-red-500/15" : "bg-primary/15")} />
    </motion.div>
  );
}

// ─── Status Tab ───────────────────────────────────────────────────────────────
function StatusTab({ status, isActive, count, onClick }) {
  const Icon = status.icon;
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 border",
        isActive ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" : "bg-card/50 text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground"
      )}
    >
      {isActive && (
        <motion.div layoutId="activeOrderTab" className="absolute inset-0 rounded-xl bg-primary" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
      )}
      <Icon size={14} className="relative z-10" />
      <span className="relative z-10">{status.label}</span>
      {count > 0 && (
        <span className={cn("relative z-10 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold", isActive ? "bg-white/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function OrdersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" /></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
      <div className="flex gap-2">{[0,1,2,3,4].map(i => <div key={i} className="h-10 w-28 rounded-xl bg-white/5 animate-pulse" />)}</div>
      <div className="space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}</div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-20 px-8 backdrop-blur-sm"
    >
      <motion.div animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10"
      ><Icon size={36} className="text-primary" /></motion.div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-center text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}

// ─── Main OrdersPage ──────────────────────────────────────────────────────────
export default function OrdersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // ─── Fetch restaurants ───────────────────────────────────────────────
  const { data: restaurantsData, isLoading: loadingRestaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => apiClient.get("/api/v1/restaurants").then((r) => r.data.data),
    retry: 1,
  });
  const restaurants = Array.isArray(restaurantsData) ? restaurantsData : (restaurantsData?.content || []);
  const restaurantId = selectedRestaurantId || restaurants[0]?.id || null;
  const currentRestaurant = restaurants.find((r) => r.id === restaurantId);

  // ─── Fetch orders ────────────────────────────────────────────────────
  const { data: ordersData, isLoading: loadingOrders, error: ordersError, isFetching: ordersFetching } = useQuery({
    queryKey: ["orders", restaurantId],
    queryFn: () => apiClient.get(`/api/v1/restaurants/${restaurantId}/orders`).then((r) => r.data.data),
    enabled: !!restaurantId,
    retry: 1,
  });
  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.content || []);

  // ─── Update status mutation ──────────────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      apiClient.patch(`/api/v1/orders/${orderId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
      toast.success("Order status updated");
      setUpdatingOrderId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update order");
      setUpdatingOrderId(null);
    },
  });

  // ─── Cancel mutation ─────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: (orderId) => apiClient.post(`/api/v1/orders/${orderId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
      toast.success("Order cancelled");
      setUpdatingOrderId(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel order");
      setUpdatingOrderId(null);
    },
  });

  // ─── Filter orders ───────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let items = orders;
    if (activeStatus !== "ALL") {
      items = items.filter((o) => o.status === activeStatus);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((o) =>
        o.orderNumber?.toString().toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.tableNumber?.toString().includes(q)
      );
    }
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, activeStatus, searchQuery]);

  // ─── Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    preparing: orders.filter((o) => o.status === "PREPARING" || o.status === "ACCEPTED").length,
    completed: orders.filter((o) => o.status === "DELIVERED").length,
    revenue: orders.filter((o) => o.status === "DELIVERED").reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
  }), [orders]);

  // ─── Status counts ───────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = {};
    ORDER_STATUSES.forEach((s) => { counts[s.key] = s.key === "ALL" ? orders.length : orders.filter((o) => o.status === s.key).length; });
    return counts;
  }, [orders]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleUpdateStatus = (orderId, status) => {
    setUpdatingOrderId(orderId);
    updateStatusMutation.mutate({ orderId, status });
  };

  const handleCancel = (orderId) => {
    setUpdatingOrderId(orderId);
    cancelMutation.mutate(orderId);
  };

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loadingRestaurants) return <><FloatingOrbs /><OrdersSkeleton /></>;

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10 space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* ─── Hero ────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-primary/10" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05, rotate: 3 }} className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/30 via-amber-500/10 to-transparent ring-1 ring-amber-500/20 shadow-lg">
                  <ShoppingBag size={24} className="text-amber-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Order Management</h1>
                  <p className="text-sm text-muted-foreground/80">Track and manage customer orders in real-time</p>
                </div>
              </div>
              <div className="sm:ml-auto flex items-center gap-2">
                <RestaurantSelector restaurants={restaurants} selectedId={restaurantId} onSelect={(id) => { setSelectedRestaurantId(id); setActiveStatus("ALL"); }} isLoading={loadingRestaurants} />
                {currentRestaurant && (
                  <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />{stats.pending} pending
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* ─── Stats ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={ShoppingBag} label="Total Orders" value={stats.total} trend="All time" accent="primary" index={0} />
            <StatCard icon={Clock} label="Pending" value={stats.pending} trend="Awaiting acceptance" accent="amber" index={1} />
            <StatCard icon={ChefHat} label="In Kitchen" value={stats.preparing} trend="Being prepared" accent="violet" index={2} />
            <StatCard icon={DollarSign} label="Revenue" value={`$${stats.revenue.toFixed(0)}`} trend="From completed orders" accent="emerald" index={3} />
          </div>

          {/* ─── Error Banner ────────────────────────────────────────── */}
          {ordersError && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">Failed to load orders. Backend may be unavailable.</p>
                <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] })} className="border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto">Retry</Button>
              </div>
            </motion.div>
          )}

          {/* ─── No Restaurant ────────────────────────────────────────── */}
          {!restaurantId && !loadingRestaurants && (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-24 px-8 backdrop-blur-sm">
              <motion.div animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent ring-1 ring-primary/20"
              ><ShoppingBag size={36} className="text-primary" /></motion.div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Select a restaurant</h3>
              <p className="max-w-sm text-center text-muted-foreground">Choose a restaurant from the dropdown above to view its orders.</p>
            </motion.div>
          )}

          {/* ─── Content (when restaurant is selected) ──────────────────── */}
          {restaurantId && !ordersError && (
            <>
              {/* Status tabs */}
              <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {ORDER_STATUSES.map((status) => (
                  <StatusTab key={status.key} status={status} isActive={activeStatus === status.key} count={statusCounts[status.key]} onClick={() => setActiveStatus(status.key)} />
                ))}
              </motion.div>

              {/* Toolbar */}
              <motion.div variants={itemVariants} className="relative max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                <input type="text" placeholder="Search by order ID, table, customer..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-card/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm transition-all duration-300 focus:border-primary/40 focus:bg-primary/[0.03] focus:outline-none focus:ring-2 focus:ring-primary/15"
                />
                {searchQuery && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                  ><X size={14} /></motion.button>
                )}
              </motion.div>

              {/* Orders area */}
              {loadingOrders ? (
                <div className="space-y-3">{[0,1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}</div>
              ) : filteredOrders.length === 0 && !searchQuery ? (
                <EmptyState icon={ShoppingBag} title="No orders yet" subtitle={activeStatus !== "ALL" ? `No orders with status "${activeStatus}"` : "Orders will appear here once customers start placing them."} />
              ) : filteredOrders.length === 0 && searchQuery ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-16"
                ><Search size={32} className="mb-3 text-muted-foreground/50" /><p className="text-muted-foreground">No orders matching "{searchQuery}"</p><button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-primary hover:underline">Clear search</button></motion.div>
              ) : (
                <>
                  <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {filteredOrders.map((order) => (
                        <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} onCancel={handleCancel} isUpdating={updatingOrderId === order.id} />
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Results count */}
                  <motion.div variants={itemVariants} className="flex items-center justify-center pt-2">
                    <p className="text-sm text-muted-foreground/60">
                      Showing {filteredOrders.length} of {statusCounts[activeStatus]} order{statusCounts[activeStatus] !== 1 ? "s" : ""}
                      {ordersFetching && (<motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="ml-2 text-xs text-primary/60"><RefreshCw size={12} className="inline animate-spin" /> syncing...</motion.span>)}
                    </p>
                  </motion.div>
                </>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
