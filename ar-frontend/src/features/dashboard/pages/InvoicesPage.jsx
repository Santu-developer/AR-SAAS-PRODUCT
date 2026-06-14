// ─── src/features/dashboard/pages/InvoicesPage.jsx ─────────────────────────
// Premium Invoices – Full API Integration
// Invoice list + filters + detail dialog + download + generate from order
// ────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Receipt,
  Search,
  X,
  Download,
  Plus,
  FileText,
  Eye,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle2,
  RefreshCw,
  CalendarDays,
  Loader2,
  Printer,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { Dialog } from "../../../shared/components/ui/Dialog";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Floating Orbs ───────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, -20, 60, 0], y: [0, -30, 50, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, -50, 30, -20, 0], y: [0, 40, -30, 20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(52,211,153,0.25) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, 60, -40, 30, 0], y: [0, -40, 30, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/3 top-2/3 h-56 w-56 rounded-full opacity-10 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
    </div>
  );
}

// ─── Variants ────────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
  CANCELLED: "bg-muted/80 text-muted-foreground border-muted/40",
  REFUNDED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PARTIALLY_PAID: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const STATUS_ICONS = {
  PAID: CheckCircle2,
  PENDING: Clock,
  OVERDUE: AlertTriangle,
  CANCELLED: X,
  REFUNDED: RefreshCw,
  PARTIALLY_PAID: Clock,
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent = "primary", index = 0 }) {
  const accentMap = {
    primary: "from-primary/20 to-primary/5 border-primary/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
    rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20",
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20",
  };
  const iconBg = {
    primary: "bg-primary/15 text-primary",
    emerald: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400",
    rose: "bg-rose-500/15 text-rose-400",
    violet: "bg-violet-500/15 text-violet-400",
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
        </div>
        <div className={cn("rounded-xl p-3 backdrop-blur-sm shadow-lg", iconBg[accent])}><Icon size={20} /></div>
      </div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  );
}

// ─── Invoice Row ──────────────────────────────────────────────────────────────
function InvoiceRow({ invoice, index, onView, onDownload }) {
  const status = (invoice.status || "PENDING").toUpperCase().replace(" ", "_");
  const StatusIcon = STATUS_ICONS[status] || Clock;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText size={14} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{invoice.invoiceNumber || invoice.number || `#${invoice.id?.slice(0, 8).toUpperCase()}`}</p>
            {invoice.orderNumber && (
              <p className="text-[10px] text-muted-foreground/60">Order #{invoice.orderNumber}</p>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CalendarDays size={10} />
          {new Date(invoice.issueDate || invoice.createdAt || invoice.date).toLocaleDateString(undefined, {
            month: "short", day: "numeric", year: "numeric",
          })}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border", STATUS_STYLES[status] || "bg-muted/80 text-muted-foreground")}>
          <StatusIcon size={10} />
          {status.replace("_", " ")}
        </span>
      </td>
      <td className="py-3 px-4 text-right tabular-nums text-sm font-bold text-foreground">
        ${Number(invoice.total || invoice.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView(invoice)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            title="View details"
          ><Eye size={14} /></button>
          {/* Only show download for PAID invoices that have a downloadable URL */}
          {(status === "PAID" || status === "PARTIALLY_PAID") && (
            <button onClick={() => onDownload(invoice)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
              title="Download invoice"
            ><Download size={14} /></button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Invoice Detail Dialog ────────────────────────────────────────────────────
function InvoiceDetailDialog({ invoice, onClose, onDownload }) {
  if (!invoice) return null;

  const status = (invoice.status || "PENDING").toUpperCase().replace(" ", "_");
  const StatusIcon = STATUS_ICONS[status] || CheckCircle2;

  return (
    <Dialog
      open={!!invoice}
      onClose={onClose}
      title={`Invoice ${invoice.invoiceNumber || invoice.number || `#${invoice.id?.slice(0, 8).toUpperCase()}`}`}
      size="sm"
      footer={
        <div className="flex items-center gap-3 w-full justify-between">
          <Button variant="outline" onClick={onClose} className="gap-1.5"><X size={14} />Close</Button>
          <div className="flex items-center gap-2">
            {(status === "PAID" || status === "PARTIALLY_PAID") && (
              <Button onClick={() => onDownload(invoice)} className="gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white">
                <Download size={14} />Download PDF
              </Button>
            )}
            <Button variant="outline" onClick={() => window.print()} className="gap-1.5">
              <Printer size={14} />Print
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Status Banner */}
        <div className={cn("rounded-xl p-4 border flex items-center gap-3", STATUS_STYLES[status] || "bg-muted/80")}>
          <StatusIcon size={20} />
          <div>
            <p className="font-semibold">{status.replace("_", " ")}</p>
            {invoice.paidAt && (
              <p className="text-xs opacity-70 mt-0.5">
                Paid on {new Date(invoice.paidAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Invoice #</p>
            <p className="text-sm font-semibold text-foreground mt-1">{invoice.invoiceNumber || invoice.number || "—"}</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Issue Date</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Due Date</p>
            <p className="text-sm font-semibold text-foreground mt-1">
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}
            </p>
          </div>
          <div className="rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Order</p>
            <p className="text-sm font-semibold text-foreground mt-1">{invoice.orderNumber || `#${invoice.orderId?.slice(0, 8) || "—"}`}</p>
          </div>
        </div>

        {/* Amount Breakdown */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount Breakdown</p>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums text-foreground">${Number(invoice.subtotal || invoice.total || 0).toFixed(2)}</span>
            </div>
            {Number(invoice.tax || 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular-nums text-foreground">${Number(invoice.tax).toFixed(2)}</span>
              </div>
            )}
            {Number(invoice.discount || 0) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="tabular-nums text-emerald-400">-${Number(invoice.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm font-bold pt-2.5 border-t border-white/[0.06]">
              <span className="text-foreground">Total</span>
              <span className="tabular-nums text-foreground text-lg">${Number(invoice.total || invoice.amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.06]">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
            <p className="text-sm text-muted-foreground italic">{invoice.notes}</p>
          </div>
        )}

        {/* Items (if available) */}
        {invoice.items?.length > 0 && (
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Line Items</p>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{item.name || item.itemName}</p>
                    {item.quantity && <p className="text-[10px] text-muted-foreground">Qty: {item.quantity} × ${Number(item.unitPrice || 0).toFixed(2)}</p>}
                  </div>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    ${(Number(item.quantity || 1) * Number(item.unitPrice || item.price || 0)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function InvoicesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" /></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
      <div className="space-y-1">{[0,1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)}</div>
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

// ─── Main InvoicesPage ────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // ─── Fetch invoices ──────────────────────────────────────────────────
  const { data: invoicesData, isLoading, error, isFetching } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => apiClient.get("/api/v1/owner/invoices").then((r) => r.data.data),
    retry: 1,
    staleTime: 60 * 1000,
  });

  const invoices = useMemo(() => {
    const items = Array.isArray(invoicesData) ? invoicesData : (invoicesData?.content || []);
    return items.sort((a, b) => new Date(b.issueDate || b.createdAt || b.date) - new Date(a.issueDate || a.createdAt || a.date));
  }, [invoicesData]);

  // ─── Generate invoice mutation ───────────────────────────────────────
  const generateMutation = useMutation({
    mutationFn: (orderId) => apiClient.post(`/api/v1/owner/orders/${orderId}/invoice/generate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice generated successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to generate invoice"),
  });

  // ─── Filtered invoices ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const num = (inv.invoiceNumber || inv.number || inv.id || "").toLowerCase();
      const orderNum = (inv.orderNumber || inv.orderId || "").toLowerCase();
      const status = (inv.status || "PENDING").toUpperCase().replace(" ", "_");
      const matchesSearch = !searchQuery || num.includes(searchQuery.toLowerCase()) || orderNum.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // ─── Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: invoices.length,
    paid: invoices.filter((i) => (i.status || "PENDING").toUpperCase() === "PAID").length,
    pending: invoices.filter((i) => (i.status || "PENDING").toUpperCase() === "PENDING").length,
    overdue: invoices.filter((i) => (i.status || "PENDING").toUpperCase() === "OVERDUE").length,
    totalRevenue: invoices
      .filter((i) => (i.status || "PENDING").toUpperCase() === "PAID")
      .reduce((s, i) => s + Number(i.total || i.amount || 0), 0),
  }), [invoices]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleView = (invoice) => setSelectedInvoice(invoice);

  const handleDownload = async (invoice) => {
    const id = invoice.id;
    setDownloadingId(id);
    try {
      const response = await apiClient.get(`/api/v1/owner/invoices/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoice.invoiceNumber || invoice.number || id.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch (err) {
      // If blob download fails, try opening in new tab
      try {
        const pdfUrl = invoice.invoiceUrl || invoice.pdfUrl;
        if (pdfUrl) {
          window.open(pdfUrl, "_blank");
          toast.success("Opening invoice in new tab");
        } else {
          toast.error("Invoice download not available");
        }
      } catch {
        toast.error("Failed to download invoice");
      }
    } finally {
      setDownloadingId(null);
    }
  };

  const handleGenerate = () => {
    // Prompt user for order ID to generate invoice from
    const orderId = window.prompt("Enter the order ID to generate an invoice for:");
    if (orderId && orderId.trim()) {
      generateMutation.mutate(orderId.trim());
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────
  if (isLoading) return <><FloatingOrbs /><InvoicesSkeleton /></>;

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10 space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* ─── Hero ────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-primary/10" />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05, rotate: 3 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 via-emerald-500/10 to-transparent ring-1 ring-emerald-500/20 shadow-lg"
                >
                  <Receipt size={24} className="text-emerald-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Invoices</h1>
                  <p className="text-sm text-muted-foreground/80">View and manage order invoices and billing documents</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="gap-1.5"
                >
                  {generateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Generate Invoice
                </Button>
              </div>
            </div>
          </motion.div>

          {/* ─── Stats ───────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Receipt} label="Total Invoices" value={stats.total} accent="primary" index={0} />
            <StatCard icon={CheckCircle2} label="Paid" value={stats.paid} accent="emerald" index={1} />
            <StatCard icon={Clock} label="Pending" value={stats.pending} accent="amber" index={2} />
            <StatCard icon={DollarSign} label="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} accent="violet" index={3} />
          </motion.div>

          {/* ─── Error Banner ────────────────────────────────────────── */}
          {error && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">Failed to load invoices. Backend may be unavailable.</p>
                <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["invoices"] })}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto"
                >Retry</Button>
              </div>
            </motion.div>
          )}

          {/* ─── Toolbar ─────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input type="text" placeholder="Search by invoice # or order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-card/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              )}
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm focus:border-primary/40 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
              <option value="REFUNDED">Refunded</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </motion.div>

          {/* ─── Table ────────────────────────────────────────────────── */}
          {filtered.length === 0 && !isLoading ? (
            searchQuery || statusFilter !== "ALL" ? (
              <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-16">
                <Search size={32} className="mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No invoices match your filters</p>
                <button onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }} className="mt-2 text-sm text-primary hover:underline">Clear filters</button>
              </motion.div>
            ) : (
              <EmptyState icon={Receipt} title="No invoices yet" subtitle="Invoices will appear here once orders are placed and payments are processed. You can also generate invoices for existing orders." />
            )
          ) : (
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Invoice</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv, idx) => (
                      <InvoiceRow key={inv.id || idx} invoice={inv} index={idx} onView={handleView} onDownload={handleDownload} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              {isFetching && (
                <div className="flex items-center justify-center py-3 border-t border-white/[0.05]">
                  <RefreshCw size={14} className="animate-spin text-muted-foreground" />
                  <span className="ml-2 text-xs text-muted-foreground">Syncing...</span>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.05]">
                <span className="text-xs text-muted-foreground">Showing {filtered.length} of {invoices.length} invoices</span>
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  Total: ${invoices.reduce((s, i) => s + Number(i.total || i.amount || 0), 0).toLocaleString()}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Invoice Detail Dialog */}
      <InvoiceDetailDialog
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}
