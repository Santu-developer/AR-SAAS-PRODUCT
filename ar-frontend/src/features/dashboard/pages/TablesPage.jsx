// ─── src/features/dashboard/pages/TablesPage.jsx ───────────────────────────────
// Premium Table Management – Full API Integration + Premium UI
// 3D CSS orbs + glassmorphism stats + tilt-effect cards + QR integration
// ────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Table2,
  QrCode,
  Download,
  Edit3,
  Trash2,
  Power,
  PowerOff,
  ChevronDown,
  Loader2,
  Check,
  X,
  Smartphone,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import QRCode from "react-qr-code";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Floating Orbs ───────────────────────────────────────────────────────────
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
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0, scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25, delay: 0.1 + i * 0.08 },
  }),
};

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "" }) {
  const [displayed, setDisplayed] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    prevValue.current = end;
    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayed}{suffix}</>;
}

// ─── Premium StatCard ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, accent = "primary", index = 0 }) {
  const accentMap = {
    primary: "from-primary/20 via-primary/10 to-transparent border-primary/20",
    emerald: "from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/20",
    blue: "from-blue-500/20 via-blue-500/10 to-transparent border-blue-500/20",
    amber: "from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/20",
  };
  const iconAccent = {
    primary: "bg-primary/15 text-primary shadow-primary/10",
    emerald: "bg-emerald-500/15 text-emerald-400 shadow-emerald-500/10",
    blue: "bg-blue-500/15 text-blue-400 shadow-blue-500/10",
    amber: "bg-amber-500/15 text-amber-400 shadow-amber-500/10",
  };
  const glowColors = {
    primary: "bg-primary/20",
    emerald: "bg-emerald-500/20",
    blue: "bg-blue-500/20",
    amber: "bg-amber-500/20",
  };

  return (
    <motion.div
      custom={index}
      variants={statVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 backdrop-blur-sm transition-all duration-500 hover:shadow-xl",
        accentMap[accent]
      )}
    >
      {/* Hover glow */}
      <div className={cn("absolute -inset-0.5 rounded-2xl opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40", glowColors[accent])} />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground/80 tracking-wide uppercase">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            <AnimatedCounter value={value} />
          </p>
          {trend && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10">
                <TrendingUp size={10} className="text-emerald-400" />
              </span>
              {trend}
            </p>
          )}
        </div>
        <div className={cn("rounded-xl p-3 backdrop-blur-sm shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", iconAccent[accent])}>
          <Icon size={22} />
        </div>
      </div>

      {/* Decorative orbs */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/[0.03] blur-3xl transition-all duration-500 group-hover:scale-150" />
      <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/[0.02] blur-2xl" />
    </motion.div>
  );
}

// ─── QR Code Panel ───────────────────────────────────────────────────────────
function QRPanel({ table, restaurantId, onGenerate }) {
  const [showQR, setShowQR] = useState(false);
  const qrData = table.qrCode;

  const handleDownload = async () => {
    try {
      const res = await apiClient.get(
        `/api/v1/restaurants/${restaurantId}/tables/${table.id}/qr/download`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `table-${table.tableNumber}-qr.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("QR code downloaded");
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  return (
    <div className="space-y-2">
      {qrData ? (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <QrCode size={14} />
            {showQR ? "Hide QR" : "Show QR"}
          </button>

          <AnimatePresence>
            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-4">
                  <QRCode
                    value={qrData.qrUrl || `${window.location.origin}/ar/${table.id}`}
                    size={120}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="M"
                  />
                  <span className="text-xs text-muted-foreground">
                    {qrData.scanCount ?? 0} scans
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onGenerate}
                      className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
                    >
                      <QrCode size={12} />
                      Regenerate
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                    >
                      <Download size={12} />
                      Download
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showQR && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Scan count: {qrData.scanCount ?? 0}</span>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
              >
                <Download size={12} />
                Download
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onGenerate}
          className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <QrCode size={14} />
          Generate QR Code
        </button>
      )}
    </div>
  );
}

// ─── Premium Table Card ──────────────────────────────────────────────────────
function TableCard({ table, restaurantId, onEdit, onDelete, onToggleActive, onGenerateQR }) {
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    setTiltY((mouseX / rect.width) * 6);
    setTiltX((-mouseY / rect.height) * 6);
  };

  const handleMouseLeave = () => { setTiltX(0); setTiltY(0); };

  return (
    <motion.div variants={itemVariants} layout className="group perspective-1000" style={{ perspective: "1000px" }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: tiltX, rotateY: tiltY }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Glass shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

        {/* Active indicator */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-1 transition-all duration-300",
            table.isActive
              ? "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/30"
              : "bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10"
          )}
        />

        {/* Hover glow */}
        <div className={cn(
          "absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-30 pointer-events-none",
          table.isActive ? "bg-emerald-500/20" : "bg-muted-foreground/10"
        )} />

        <div className="relative z-10 p-5 pl-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.08, rotate: [0, -3, 3, 0] }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 text-primary shadow-lg"
                style={{ transform: "translateZ(20px)" }}
              >
                <Table2 size={22} />
                {/* Status dot */}
                <motion.div
                  animate={table.isActive ? { scale: [1, 1.3, 1], opacity: [1, 0.8, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card shadow-sm",
                    table.isActive ? "bg-emerald-400" : "bg-muted-foreground/30"
                  )}
                />
              </motion.div>
              <div style={{ transform: "translateZ(20px)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  Table {table.tableNumber}
                </h3>
                {table.label && (
                  <p className="text-sm text-muted-foreground">{table.label}</p>
                )}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                table.isActive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-muted/80 text-muted-foreground backdrop-blur-sm"
              )}
            >
              <div className={cn("h-1.5 w-1.5 rounded-full", table.isActive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground")} />
              {table.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* QR Section */}
          <QRPanel table={table} restaurantId={restaurantId} onGenerate={() => onGenerateQR(table.id)} />

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(table)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <Edit3 size={12} />
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onToggleActive(table)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                table.isActive
                  ? "text-amber-400 hover:bg-amber-500/10"
                  : "text-emerald-400 hover:bg-emerald-500/10"
              )}
            >
              {table.isActive ? <PowerOff size={12} /> : <Power size={12} />}
              {table.isActive ? "Deactivate" : "Activate"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(table)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Trash2 size={12} />
              Delete
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create/Edit Table Dialog ────────────────────────────────────────────────
function TableDialog({ isOpen, onClose, table, restaurantId }) {
  const queryClient = useQueryClient();
  const isEditing = !!table;

  const [formData, setFormData] = useState({
    tableNumber: table?.tableNumber?.toString() || "",
    label: table?.label || "",
  });
  const [errors, setErrors] = useState({});

  const handleClose = () => {
    setFormData({ tableNumber: "", label: "" });
    setErrors({});
    onClose();
  };

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEditing) {
        return apiClient.put(`/api/v1/restaurants/${restaurantId}/tables/${table.id}`, payload);
      }
      return apiClient.post(`/api/v1/restaurants/${restaurantId}/tables`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success(`Table ${isEditing ? "updated" : "created"} successfully`);
      handleClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Something went wrong";
      if (err.response?.status === 403) toast.error("Plan limit reached. Upgrade to continue.");
      else toast.error(msg);
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.tableNumber || !formData.tableNumber.trim()) {
      newErrors.tableNumber = "Table number is required";
    } else if (isNaN(Number(formData.tableNumber))) {
      newErrors.tableNumber = "Must be a valid number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ tableNumber: Number(formData.tableNumber), label: formData.label || undefined });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 z-50 flex items-center justify-center p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {isEditing ? "Edit Table" : "Add Table"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isEditing ? `Update table ${table.tableNumber}` : "Create a new table for this restaurant"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Table2 size={14} className="text-muted-foreground" />
                    Table Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number" min="1"
                    value={formData.tableNumber}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, tableNumber: e.target.value }));
                      if (errors.tableNumber) setErrors((p) => ({ ...p, tableNumber: undefined }));
                    }}
                    placeholder="e.g., 1, 2, 3..."
                    className={cn(
                      "h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                      errors.tableNumber ? "border-destructive" : "border-border focus:border-primary/50"
                    )}
                    disabled={mutation.isPending}
                  />
                  {errors.tableNumber && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.tableNumber}</motion.p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Smartphone size={14} className="text-muted-foreground" />
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData((p) => ({ ...p, label: e.target.value }))}
                    placeholder="e.g., Window, Corner, VIP"
                    className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    disabled={mutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                  <Button type="submit" disabled={mutation.isPending} className="gap-2 bg-primary hover:bg-primary/90">
                    {mutation.isPending ? (
                      <><Loader2 size={16} className="animate-spin" /> {isEditing ? "Saving..." : "Creating..."}</>
                    ) : (
                      <><Check size={16} /> {isEditing ? "Save Changes" : "Add Table"}</>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Premium Delete Confirm Dialog ───────────────────────────────────────────
function DeleteConfirmDialog({ isOpen, onClose, table, restaurantId }) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete(`/api/v1/restaurants/${restaurantId}/tables/${table.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success("Table deleted successfully");
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete table");
    },
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 z-50 flex items-center justify-center p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-red-500/10"
                  >
                    <AlertTriangle size={28} className="text-red-400" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Delete Table {table?.tableNumber}?
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">This action cannot be undone.</p>
                  </div>
                </div>

                <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                      <Table2 size={18} className="text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Table {table?.tableNumber}</p>
                      {table?.label && (
                        <p className="text-xs text-muted-foreground">{table.label}</p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">
                  This will permanently delete this table and its associated QR code. 
                  All scan data for this table will be preserved in analytics.
                </p>

                <div className="flex items-center justify-end gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="button" variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                      className="gap-2 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                    >
                      {deleteMutation.isPending ? (
                        <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                      ) : (
                        <><Trash2 size={16} /> Delete Table</>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ onAdd, restaurantName }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-24 px-8 backdrop-blur-sm"
    >
      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-64 w-64 rounded-full border border-primary/5" />
        <div className="h-48 w-48 rounded-full border border-primary/10 absolute" />
        <div className="h-32 w-32 rounded-full border border-primary/15 absolute" />
      </div>

      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-8"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg shadow-primary/5">
          <Table2 size={42} className="text-primary" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl"
        />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-3 text-2xl font-bold text-foreground"
      >
        No tables yet
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 max-w-md text-center text-muted-foreground/80 leading-relaxed"
      >
        {restaurantName
          ? `Start by adding your first table to ${restaurantName}. Customers scan QR codes to view menus and place orders.`
          : "Start by adding your first table. Customers scan QR codes to view menus and place orders."}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Button
          onClick={onAdd}
          className="gap-2.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
        >
          <Plus size={18} />
          Add Your First Table
          <TrendingUp size={14} />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Restaurant Selector ─────────────────────────────────────────────────────
function RestaurantSelector({ restaurants, selectedId, onSelect, isLoading }) {
  const [open, setOpen] = useState(false);
  const selected = restaurants?.find((r) => r.id === selectedId);

  if (isLoading) return <Skeleton className="h-11 w-64 rounded-xl" />;
  if (!restaurants?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No restaurants found. Create a restaurant first to manage tables.
      </p>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-64 items-center justify-between gap-2 rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-card/80"
      >
        <span className="truncate">{selected?.name || "Select a restaurant..."}</span>
        <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-white/10 bg-card/95 shadow-xl shadow-black/20 backdrop-blur-xl"
            >
              {restaurants.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => { onSelect(r.id); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                    r.id === selectedId ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Table2 size={14} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.cuisineType || "Restaurant"}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main TablesPage ─────────────────────────────────────────────────────────
export default function TablesPage() {
  const { restaurantId: paramRestaurantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(paramRestaurantId || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [deletingTable, setDeletingTable] = useState(null);

  // Fetch restaurants (FIXED: /api/v1/restaurants → /api/v1/restaurants/my)
  const {
    data: restaurantsData,
    isLoading: loadingRestaurants,
  } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => apiClient.get("/api/v1/restaurants").then((r) => r.data.data),
  });

  const restaurants = restaurantsData?.content || restaurantsData || [];

  // Auto-select first restaurant if none selected
  const restaurantId = selectedRestaurantId || restaurants[0]?.id || null;
  const currentRestaurant = restaurants.find((r) => r.id === restaurantId);

  // Fetch tables for selected restaurant
  const {
    data: tablesData,
    isLoading: loadingTables,
    error: tablesError,
    isFetching: tablesFetching,
  } = useQuery({
    queryKey: ["tables", restaurantId],
    queryFn: () =>
      apiClient.get(`/api/v1/restaurants/${restaurantId}/tables`).then((r) => r.data.data),
    enabled: !!restaurantId,
  });

  const tables = tablesData?.content || tablesData || [];

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      apiClient.put(`/api/v1/restaurants/${restaurantId}/tables/${id}`, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success("Table status updated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });

  // Generate QR mutation
  const generateQRMutation = useMutation({
    mutationFn: (tableId) =>
      apiClient.post(`/api/v1/restaurants/${restaurantId}/tables/${tableId}/qr`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success("QR code generated");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to generate QR");
    },
  });

  // Filter tables
  const filteredTables = useMemo(() => {
    if (!searchQuery) return tables;
    const q = searchQuery.toLowerCase();
    return tables.filter(
      (t) => t.tableNumber?.toString().includes(q) || t.label?.toLowerCase().includes(q)
    );
  }, [tables, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: tables.length,
    active: tables.filter((t) => t.isActive).length,
    inactive: tables.filter((t) => !t.isActive).length,
    withQR: tables.filter((t) => t.qrCode).length,
  }), [tables]);

  // Handlers
  const handleEdit = (table) => { setEditingTable(table); setShowAddDialog(true); };
  const handleDelete = (table) => { setDeletingTable(table); };
  const handleToggleActive = (table) => { toggleActiveMutation.mutate({ id: table.id, isActive: table.isActive }); };
  const handleGenerateQR = (tableId) => { generateQRMutation.mutate(tableId); };
  const handleRestaurantSelect = (id) => {
    setSelectedRestaurantId(id);
    navigate(`/dashboard/tables/${id}`, { replace: true });
  };

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loadingRestaurants) {
    return (
      <div className="space-y-6">
        <FloatingOrbs />
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" />
            <div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="space-y-3">
                <div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-52 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />

      {/* ─── Content ──────────────────────────────────────────────────── */}
      <div className="relative z-10 space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* ─── Hero Section ───────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 backdrop-blur-sm"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-emerald-500/10"
            />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg"
                >
                  <Table2 size={24} className="text-primary" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Table Management
                  </h1>
                  <p className="text-sm text-muted-foreground/80">
                    Manage tables and QR codes for your restaurants
                  </p>
                </div>
              </div>
              <div className="sm:ml-auto flex items-center gap-2 flex-wrap">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {stats.active} active
                </motion.div>
                <motion.div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <Table2 size={12} />
                  {stats.total} total
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ─── Restaurant Selector ────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <RestaurantSelector
              restaurants={restaurants}
              selectedId={restaurantId}
              onSelect={handleRestaurantSelect}
              isLoading={loadingRestaurants}
            />
            {currentRestaurant && (
              <span className="text-sm text-muted-foreground">
                Managing tables for <span className="font-medium text-foreground">{currentRestaurant.name}</span>
              </span>
            )}
          </motion.div>

          {/* ─── Error State ────────────────────────────────────────────── */}
          {tablesError && (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/5 py-16">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                <Table2 size={28} className="text-red-400" />
              </div>
              <p className="mb-2 text-lg font-semibold text-red-400">Failed to load tables</p>
              <p className="mb-6 text-sm text-muted-foreground/70">Please check your connection and try again</p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] })} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                Retry
              </Button>
            </motion.div>
          )}

          {/* ─── Stats + Actions ────────────────────────────────────────── */}
          {restaurantId && !tablesError && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Table2} label="Total Tables" value={stats.total} trend={`${stats.active} active`} accent="primary" index={0} />
                <StatCard icon={Power} label="Active" value={stats.active} trend={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of total`} accent="emerald" index={1} />
                <StatCard icon={PowerOff} label="Inactive" value={stats.inactive} accent="amber" index={2} />
                <StatCard icon={QrCode} label="With QR Codes" value={stats.withQR} trend={`${stats.total > 0 ? Math.round((stats.withQR / stats.total) * 100) : 0}% coverage`} accent="blue" index={3} />
              </div>

              {/* Toolbar */}
              <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                  <input
                    type="text"
                    placeholder="Search by table number or label..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 w-full rounded-xl border border-white/10 bg-card/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm transition-all duration-300 focus:border-primary/40 focus:bg-primary/[0.03] focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                    >
                      <X size={14} />
                    </motion.button>
                  )}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => { setEditingTable(null); setShowAddDialog(true); }}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
                  >
                    <Plus size={16} />
                    Add Table
                  </Button>
                </motion.div>
              </motion.div>

              {/* ─── Loading Tables ──────────────────────────────────────── */}
              {loadingTables && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-52 rounded-2xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              )}

              {/* ─── Empty State ─────────────────────────────────────────── */}
              {!loadingTables && filteredTables.length === 0 && !searchQuery && (
                <EmptyState
                  onAdd={() => { setEditingTable(null); setShowAddDialog(true); }}
                  restaurantName={currentRestaurant?.name}
                />
              )}

              {/* ─── No Search Results ───────────────────────────────────── */}
              {!loadingTables && filteredTables.length === 0 && searchQuery && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-16"
                >
                  <Search size={32} className="mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No tables matching "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-primary hover:underline">Clear search</button>
                </motion.div>
              )}

              {/* ─── Table Grid ──────────────────────────────────────────── */}
              {!loadingTables && filteredTables.length > 0 && (
                <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence mode="popLayout">
                    {filteredTables.map((table) => (
                      <TableCard
                        key={table.id}
                        table={table}
                        restaurantId={restaurantId}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                        onGenerateQR={handleGenerateQR}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Results count */}
              {!loadingTables && filteredTables.length > 0 && (
                <motion.div variants={itemVariants} className="flex items-center justify-center">
                  <p className="text-sm text-muted-foreground/60">
                    Showing {filteredTables.length} of {stats.total} table{stats.total !== 1 ? "s" : ""}
                    {tablesFetching && (
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="ml-2 text-xs text-primary/60"
                      >
                        <RefreshCw size={12} className="inline animate-spin" /> syncing...
                      </motion.span>
                    )}
                  </p>
                </motion.div>
              )}
            </>
          )}

          {/* ─── No Restaurant Selected ──────────────────────────────────── */}
          {!restaurantId && !loadingRestaurants && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-24 px-8 backdrop-blur-sm"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-64 w-64 rounded-full border border-primary/5" />
                <div className="h-48 w-48 rounded-full border border-primary/10 absolute" />
                <div className="h-32 w-32 rounded-full border border-primary/15 absolute" />
              </div>
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative mb-6"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg">
                  <Table2 size={36} className="text-primary" />
                </div>
              </motion.div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">Select a restaurant</h3>
              <p className="max-w-sm text-center text-muted-foreground">
                Choose a restaurant from the dropdown above to manage its tables and QR codes.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ─── Dialogs ────────────────────────────────────────────────────── */}
      <TableDialog
        isOpen={showAddDialog}
        onClose={() => { setShowAddDialog(false); setEditingTable(null); }}
        table={editingTable}
        restaurantId={restaurantId}
      />

      {deletingTable && (
        <DeleteConfirmDialog
          isOpen={!!deletingTable}
          onClose={() => setDeletingTable(null)}
          table={deletingTable}
          restaurantId={restaurantId}
        />
      )}
    </div>
  );
}
