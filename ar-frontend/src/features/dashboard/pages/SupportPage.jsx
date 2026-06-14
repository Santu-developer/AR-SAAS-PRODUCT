// ─── src/features/dashboard/pages/SupportPage.jsx ─────────────────────────
// Premium Owner Support Tickets – Full API Integration
// Create ticket + list view + detail dialog with reply + status tracking
// ──────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Search,
  X,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  RefreshCw,
  Send,
  Loader2,
  HelpCircle,
  Bug,
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

// ─── Status & Priority Config ─────────────────────────────────────────────────
const STATUS_STYLES = {
  OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  CLOSED: "bg-muted/80 text-muted-foreground border-muted/40",
  WAITING: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const PRIORITY_STYLES = {
  LOW: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  HIGH: "bg-red-500/10 text-red-400 border-red-500/20",
  URGENT: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const PRIORITY_ICONS = {
  LOW: HelpCircle,
  MEDIUM: Clock,
  HIGH: AlertTriangle,
  URGENT: Bug,
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent = "primary", index = 0 }) {
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
        </div>
        <div className={cn("rounded-xl p-3 backdrop-blur-sm shadow-lg", iconBg[accent])}><Icon size={20} /></div>
      </div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  );
}

// ─── Create Ticket Dialog ──────────────────────────────────────────────────────
function CreateTicketDialog({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ subject: "", description: "", priority: "MEDIUM", category: "general" });
  const [errors, setErrors] = useState({});

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post("/api/v1/owner/support-tickets", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      toast.success("Support ticket created successfully");
      setFormData({ subject: "", description: "", priority: "MEDIUM", category: "general" });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create ticket"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title="Create Support Ticket" size="md"
      footer={
        <div className="flex items-center gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending} className="gap-1.5">
            {createMutation.isPending ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit Ticket</>}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Subject <span className="text-destructive">*</span></label>
          <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Brief description of your issue..."
            className={cn("h-11 w-full rounded-xl border bg-card/50 px-4 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15", errors.subject ? "border-red-500/50" : "border-white/10")}
          />
          {errors.subject && <p className="text-xs text-red-400 mt-1">{errors.subject}</p>}
        </div>

        {/* Category + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="h-11 w-full rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm focus:border-primary/40 focus:outline-none"
            >
              <option value="general">General</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="feature_request">Feature Request</option>
              <option value="account">Account</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="h-11 w-full rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm focus:border-primary/40 focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Description <span className="text-destructive">*</span></label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            placeholder="Describe your issue in detail. Include any steps to reproduce if applicable..."
            className={cn("w-full rounded-xl border bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 resize-y min-h-[120px]", errors.description ? "border-red-500/50" : "border-white/10")}
          />
          {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
        </div>
      </form>
    </Dialog>
  );
}

// ─── Ticket Detail Dialog ─────────────────────────────────────────────────────
function TicketDetailDialog({ ticket, onClose }) {
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState("");

  const replyMutation = useMutation({
    mutationFn: (message) => apiClient.post(`/api/v1/owner/support-tickets/${ticket.id}/reply`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      toast.success("Reply sent");
      setReplyText("");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to send reply"),
  });

  if (!ticket) return null;

  const status = (ticket.status || "OPEN").toUpperCase();
  const priority = (ticket.priority || "MEDIUM").toUpperCase();
  const PriorityIcon = PRIORITY_ICONS[priority] || HelpCircle;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Dialog
      open={!!ticket}
      onClose={onClose}
      title={ticket.subject || "Support Ticket"}
      size="md"
      footer={
        <div className="flex items-center gap-3 w-full justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Status & Priority */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium border", STATUS_STYLES[status] || STATUS_STYLES.OPEN)}>
            <div className={cn("h-1.5 w-1.5 rounded-full", status === "OPEN" ? "bg-blue-400 animate-pulse" : status === "IN_PROGRESS" ? "bg-amber-400 animate-pulse" : status === "RESOLVED" ? "bg-emerald-400" : "")} />
            {status.replace("_", " ")}
          </span>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium border", PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM)}>
            <PriorityIcon size={10} />
            {priority}
          </span>
          {ticket.category && (
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium bg-muted/50 text-muted-foreground border border-muted/30 capitalize">
              {ticket.category.replace("_", " ")}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06]">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Description</p>
          <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.description || "No description provided."}</p>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
            <Clock size={10} />
            Created {formatDate(ticket.createdAt)}
          </p>
        </div>

        {/* Replies / Messages */}
        {ticket.replies?.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={12} />
              Conversation ({ticket.replies.length})
            </p>
            <div className="space-y-2">
              {ticket.replies.map((reply, idx) => (
                <motion.div key={reply.id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("rounded-xl p-3 border", reply.isAdmin || reply.role === "SUPER_ADMIN" ? "bg-primary/5 border-primary/20 ml-6" : "bg-white/[0.03] border-white/[0.06]")}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-foreground">{reply.authorName || (reply.isAdmin ? "Support Team" : "You")}</p>
                    <span className="text-[10px] text-muted-foreground">{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.message}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Reply Box */}
        {status !== "RESOLVED" && status !== "CLOSED" && (
          <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.06]">
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Add Reply</p>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
              rows={3} placeholder="Type your reply..."
              className="w-full rounded-xl border border-white/10 bg-card/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-muted-foreground/60">Replies are sent to our support team</p>
              <Button size="sm" onClick={() => replyMutation.mutate(replyText)}
                disabled={!replyText.trim() || replyMutation.isPending}
                className="gap-1.5"
              >
                {replyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────
function TicketCard({ ticket, index, onClick }) {
  const status = (ticket.status || "OPEN").toUpperCase();
  const priority = (ticket.priority || "MEDIUM").toUpperCase();
  const PriorityIcon = PRIORITY_ICONS[priority] || HelpCircle;

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3, scale: 1.01 }}
      onClick={() => onClick(ticket)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Status line */}
      <div className={cn("absolute left-0 top-0 h-full w-1 transition-all duration-300",
        status === "OPEN" ? "bg-gradient-to-b from-blue-400 to-blue-600" :
        status === "IN_PROGRESS" ? "bg-gradient-to-b from-amber-400 to-amber-600" :
        status === "RESOLVED" ? "bg-gradient-to-b from-emerald-400 to-emerald-600" :
        "bg-gradient-to-b from-muted to-muted"
      )} />

      <div className="pl-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground truncate">{ticket.subject || "No subject"}</h3>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium border shrink-0", STATUS_STYLES[status] || STATUS_STYLES.OPEN)}>
                {status.replace("_", " ")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground/70 line-clamp-2">{ticket.description || "No description"}</p>
          </div>
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border shrink-0", PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM)}>
            <PriorityIcon size={14} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
          <div className="flex items-center gap-3">
            {ticket.category && (
              <span className="capitalize">{ticket.category.replace("_", " ")}</span>
            )}
            {ticket.replies?.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare size={10} />
                {ticket.replies.length}
              </span>
            )}
          </div>
          <span>{timeAgo(ticket.createdAt)}</span>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-20 pointer-events-none bg-primary/10" />
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function SupportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" /></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{[0,1,2,3].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}</div>
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

// ─── Main SupportPage ─────────────────────────────────────────────────────────
export default function SupportPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // ─── Fetch tickets ───────────────────────────────────────────────────
  const { data: ticketsData, isLoading, error, isFetching } = useQuery({
    queryKey: ["supportTickets"],
    queryFn: () => apiClient.get("/api/v1/owner/support-tickets").then((r) => r.data.data),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const tickets = useMemo(() => {
    const items = Array.isArray(ticketsData) ? ticketsData : (ticketsData?.content || []);
    return items.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  }, [ticketsData]);

  // ─── Filtered tickets ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const subj = (t.subject || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      const status = (t.status || "OPEN").toUpperCase();
      const matchesSearch = !searchQuery || subj.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  // ─── Stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => (t.status || "OPEN").toUpperCase() === "OPEN").length,
    inProgress: tickets.filter((t) => (t.status || "").toUpperCase() === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => ["RESOLVED", "CLOSED"].includes((t.status || "").toUpperCase())).length,
  }), [tickets]);

  // ─── Loading ─────────────────────────────────────────────────────────
  if (isLoading) return <><FloatingOrbs /><SupportSkeleton /></>;

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10 space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* ─── Hero ────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-primary/10" />
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.05, rotate: 3 }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/30 via-blue-500/10 to-transparent ring-1 ring-blue-500/20 shadow-lg"
                >
                  <MessageSquare size={24} className="text-blue-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">Support Tickets</h1>
                  <p className="text-sm text-muted-foreground/80">Get help and track your support requests</p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
                <Plus size={14} />New Ticket
              </Button>
            </div>
          </motion.div>

          {/* ─── Stats ───────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={MessageSquare} label="Total Tickets" value={stats.total} accent="primary" index={0} />
            <StatCard icon={Clock} label="Open" value={stats.open} accent="blue" index={1} />
            <StatCard icon={RefreshCw} label="In Progress" value={stats.inProgress} accent="amber" index={2} />
            <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} accent="emerald" index={3} />
          </motion.div>

          {/* ─── Error Banner ────────────────────────────────────────── */}
          {error && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">Failed to load tickets. Backend may be unavailable.</p>
                <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["supportTickets"] })}
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto"
                >Retry</Button>
              </div>
            </motion.div>
          )}

          {/* ─── Toolbar ─────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
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
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </motion.div>

          {/* ─── Ticket List ──────────────────────────────────────────── */}
          {filtered.length === 0 && !isLoading ? (
            searchQuery || statusFilter !== "ALL" ? (
              <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-16">
                <Search size={32} className="mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No tickets match your filters</p>
                <button onClick={() => { setSearchQuery(""); setStatusFilter("ALL"); }} className="mt-2 text-sm text-primary hover:underline">Clear filters</button>
              </motion.div>
            ) : (
              <EmptyState icon={MessageSquare} title="No support tickets yet" subtitle="Need help? Create a ticket and our team will get back to you. You can track all your requests here." />
            )
          ) : (
            <>
              <motion.div variants={itemVariants} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filtered.map((ticket, idx) => (
                  <TicketCard key={ticket.id || idx} ticket={ticket} index={idx} onClick={setSelectedTicket} />
                ))}
              </motion.div>

              {/* Results footer */}
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground/60">
                  Showing {filtered.length} of {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
                  {isFetching && (
                    <span className="ml-2 text-primary/60"><RefreshCw size={10} className="inline animate-spin" /> syncing...</span>
                  )}
                </p>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* Create Ticket Dialog */}
      <CreateTicketDialog isOpen={showCreate} onClose={() => setShowCreate(false)} />

      {/* Ticket Detail Dialog */}
      <TicketDetailDialog ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
}
