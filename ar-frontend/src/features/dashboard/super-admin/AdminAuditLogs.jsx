// ─── src/features/dashboard/super-admin/AdminAuditLogs.jsx ────────────────────
// Premium Super Admin – System Audit Logs
// View all platform audit logs with filters and search
// ────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Search,
  Clock,
  User,
  Trash2,
  Edit3,
  Plus,
  Eye,
  X,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { cn } from "../../../shared/lib/utils";

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
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)" }} />
      <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
    </div>
  );
}

const ACTION_ICONS = {
  CREATED: Plus, UPDATED: Edit3, DELETED: Trash2, VIEWED: Eye, LOGIN: User, LOGOUT: User,
};
const ACTION_COLORS = {
  CREATED: "text-emerald-400 bg-emerald-500/10",
  UPDATED: "text-blue-400 bg-blue-500/10",
  DELETED: "text-red-400 bg-red-500/10",
  VIEWED: "text-primary bg-primary/10",
  LOGIN: "text-amber-400 bg-amber-500/10",
  LOGOUT: "text-muted-foreground bg-muted/30",
};

export default function AdminAuditLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["adminAuditLogs", page],
    queryFn: () => apiClient.get(`/api/v1/admin/audit-logs?page=${page}&size=25`).then((r) => r.data.data),
    retry: 1,
  });

  const logs = useMemo(() => Array.isArray(data) ? data : (data?.content || []), [data]);
  const totalPages = data?.totalPages || 1;

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        log.entityType?.toLowerCase().includes(q) ||
        log.entityId?.toLowerCase().includes(q) ||
        log.userId?.toLowerCase().includes(q);
      const matchesAction = actionFilter === "ALL" || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, searchQuery, actionFilter]);

  const ActionIcon = (action) => ACTION_ICONS[action] || Eye;

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
                <FileText size={24} className="text-violet-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
                <p className="text-sm text-muted-foreground/80">Track all platform activities and user actions</p>
              </div>
            </div>
          </motion.div>

          {/* Search + Filter */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input type="text" placeholder="Search by entity, user, ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-card/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60"><X size={14} /></button>}
            </div>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-card/50 px-4 text-sm text-foreground backdrop-blur-sm focus:border-primary/40 focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="CREATED">Created</option>
              <option value="UPDATED">Updated</option>
              <option value="DELETED">Deleted</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </motion.div>

          {/* Logs List */}
          {isLoading ? (
            <div className="space-y-2">{[0,1,2,3,4,5].map(i => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-20">
              <FileText size={36} className="text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">No audit logs found</p>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="space-y-2">
                {filtered.map((log, idx) => {
                  const Icon = ActionIcon(log.action);
                  return (
                    <motion.div key={log.id || idx} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}
                      className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-card/30 backdrop-blur-sm p-4 hover:bg-card/50 transition-colors"
                    >
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", ACTION_COLORS[log.action] || "bg-muted/30 text-muted-foreground")}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground capitalize">{log.action}</span>
                          <span className="text-xs text-muted-foreground">{log.entityType}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {log.userId && <span className="text-[10px] text-muted-foreground/60">User: {log.userId.slice(0, 8)}...</span>}
                          {log.entityId && <span className="text-[10px] text-muted-foreground/60">Entity: {log.entityId.slice(0, 8)}...</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock size={10} />
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div variants={itemVariants} className="flex items-center justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground px-3">Page {page + 1} of {totalPages}</span>
                  <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                    Next
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
