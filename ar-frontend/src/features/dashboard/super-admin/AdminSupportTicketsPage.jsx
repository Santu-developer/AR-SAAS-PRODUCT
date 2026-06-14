// ─── src/features/dashboard/super-admin/AdminSupportTicketsPage.jsx ───────
// Premium Super Admin – Support Tickets Management
// View all tickets, reply, update status, filter by priority/status
// ────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Search,
  X,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  User,
  ChevronRight,
  Reply,
  Loader2,
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
  visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 25 } },
};

function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)" }} />
      <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
    </div>
  );
}

const PRIORITY_COLORS = {
  LOW: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HIGH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  URGENT: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_COLORS = {
  OPEN: "bg-blue-500/10 text-blue-400",
  IN_PROGRESS: "bg-amber-500/10 text-amber-400",
  RESOLVED: "bg-emerald-500/10 text-emerald-400",
  CLOSED: "bg-muted/80 text-muted-foreground",
};

export default function AdminSupportTicketsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Fetch all tickets
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["adminSupportTickets"],
    queryFn: () => apiClient.get("/api/v1/admin/support-tickets").then((r) => r.data.data),
    retry: 1,
    staleTime: 30 * 1000,
  });

  const tickets = useMemo(() => {
    return Array.isArray(data) ? data : (data?.content || []);
  }, [data]);

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: ({ id, message }) => apiClient.post(`/api/v1/admin/support-tickets/${id}/reply`, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSupportTickets"] });
      toast.success("Reply sent");
      setReplyText("");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to send reply"),
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => apiClient.patch(`/api/v1/admin/support-tickets/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSupportTickets"] });
      toast.success("Ticket status updated");
      setSelectedTicket(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
  });

  // Filter
  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        t.subject?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || (t.status || "OPEN").toUpperCase() === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || (t.priority || "MEDIUM").toUpperCase() === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  if (isLoading) {
    return (
      <div className="relative min-h-full">
        <FloatingOrbs />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-56 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-72 rounded-lg bg-white/5 animate-pulse" /></div></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
          <div className="space-y-2">{[0,1,2,3,4].map(i => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}</div>
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
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-primary/10" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 via-violet-500/10 to-transparent ring-1 ring-violet-500/20 shadow-lg">
                <MessageSquare size={24} className="text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
                <p className="text-sm text-muted-foreground/80">Manage tenant support requests and inquiries</p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Total</p><p className="text-2xl font-bold text-foreground mt-1">{tickets.length}</p></div>
                <div className="rounded-xl bg-primary/10 p-3"><MessageSquare size={18} className="text-primary" /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Open</p><p className="text-2xl font-bold text-foreground mt-1">{tickets.filter((t) => (t.status || "OPEN").toUpperCase() === "OPEN").length}</p></div>
                <div className="rounded-xl bg-blue-500/10 p-3"><MessageSquare size={18} className="text-blue-400" /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-foreground mt-1">{tickets.filter((t) => (t.status || "").toUpperCase() === "IN_PROGRESS").length}</p></div>
                <div className="rounded-xl bg-amber-500/10 p-3"><Clock size={18} className="text-amber-400" /></div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-medium text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-foreground mt-1">{tickets.filter((t) => (t.status || "").toUpperCase() === "RESOLVED" || (t.status || "").toUpperCase() === "CLOSED").length}</p></div>
                <div className="rounded-xl bg-emerald-500/10 p-3"><CheckCircle2 size={18} className="text-emerald-400" /></div>
              </div>
            </div>
          </motion.div>

          {/* Search + Filters */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input type="text" placeholder="Search by subject, description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-card/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"><X size={14} /></button>}
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
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm focus:border-primary/40 focus:outline-none"
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </motion.div>

          {/* Tickets List */}
          {filtered.length === 0 ? (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-20">
              <MessageSquare size={36} className="text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No tickets found</p>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants} className="space-y-2">
              {filtered.map((ticket, idx) => (
                <motion.div key={ticket.id || idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}
                  onClick={() => setSelectedTicket(ticket)}
                  className="flex items-start gap-4 rounded-xl border border-white/[0.04] bg-card/30 backdrop-blur-sm p-4 hover:bg-card/50 hover:border-primary/20 transition-all cursor-pointer group"
                >
                  {/* Priority indicator */}
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0 border", PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.MEDIUM)}>
                    <AlertTriangle size={16} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground truncate">{ticket.subject || "No subject"}</h4>
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_COLORS[ticket.status] || STATUS_COLORS.OPEN)}>
                        {(ticket.status || "OPEN").replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 line-clamp-2 mb-2">
                      {ticket.description || "No description"}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
                      {ticket.raisedByUserId && (
                        <span className="flex items-center gap-1">
                          <User size={10} />
                          User: {ticket.raisedByUserId.slice(0, 8)}...
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronRight size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors mt-2 shrink-0" />
                </motion.div>
              ))}
              {isFetching && (
                <div className="flex items-center justify-center py-3">
                  <RefreshCw size={14} className="animate-spin text-muted-foreground" />
                  <span className="ml-2 text-xs text-muted-foreground">Syncing...</span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog
        open={!!selectedTicket}
        onClose={() => { setSelectedTicket(null); setReplyText(""); }}
        title={selectedTicket?.subject || "Ticket Details"}
        description={`Created ${selectedTicket?.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : "—"}`}
        size="lg"
        footer={
          <div className="flex items-center gap-3 w-full justify-end">
            <Button variant="outline" onClick={() => { setSelectedTicket(null); setReplyText(""); }}>Close</Button>
            {selectedTicket && (selectedTicket.status === "OPEN" || selectedTicket.status === "IN_PROGRESS") && (
              <>
                <Button
                  onClick={() => statusMutation.mutate({ id: selectedTicket.id, status: "IN_PROGRESS" })}
                  variant="outline"
                  disabled={statusMutation.isPending || selectedTicket.status === "IN_PROGRESS"}
                  className="gap-2"
                >
                  <Clock size={14} />
                  Mark In Progress
                </Button>
                <Button
                  onClick={() => statusMutation.mutate({ id: selectedTicket.id, status: "RESOLVED" })}
                  disabled={statusMutation.isPending}
                  className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <CheckCircle2 size={14} />
                  Resolve
                </Button>
              </>
            )}
          </div>
        }
      >
        {selectedTicket && (
          <div className="space-y-4">
            {/* Ticket Info */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border", PRIORITY_COLORS[selectedTicket.priority] || PRIORITY_COLORS.MEDIUM)}>
                <AlertTriangle size={10} />
                {selectedTicket.priority || "MEDIUM"} Priority
              </span>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", STATUS_COLORS[selectedTicket.status] || STATUS_COLORS.OPEN)}>
                {(selectedTicket.status || "OPEN").replace("_", " ")}
              </span>
            </div>

            {/* Description */}
            <div className="rounded-xl bg-white/[0.03] p-4 border border-white/[0.06]">
              <p className="text-xs font-medium text-muted-foreground mb-2">Description</p>
              <p className="text-sm text-foreground leading-relaxed">{selectedTicket.description || "No description provided."}</p>
            </div>

            {/* Reply Box */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Admin Reply</p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex justify-end">
                <Button
                  onClick={() => replyMutation.mutate({ id: selectedTicket.id, message: replyText })}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="gap-2"
                  size="sm"
                >
                  {replyMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
