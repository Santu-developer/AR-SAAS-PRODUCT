// ─── src/features/dashboard/pages/StaffPage.jsx ───────────────────────────────
// Premium Staff Management – Full API Integration
// CRUD + Search + Role badges + Active/Inactive toggle
// ────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Plus, Search, X, Edit3, Trash2, Power, PowerOff,
  Loader2, Check, Mail, Phone, Shield, User, AlertTriangle,
  ChevronDown, Sparkles, MoreHorizontal, RefreshCw,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Animations ──────────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// ─── Role Config ─────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  STAFF: { label: "Staff", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  MANAGER: { label: "Manager", color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
};

// ─── Floating Orbs ───────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div animate={{ x: [0, 40, -20, 0], y: [0, -30, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)" }} />
      <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent = "primary", index = 0 }) {
  const accentMap = { primary: "from-primary/20 to-primary/5 border-primary/20", emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20", blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20", amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20" };
  const iconBg = { primary: "bg-primary/15 text-primary", emerald: "bg-emerald-500/15 text-emerald-400", blue: "bg-blue-500/15 text-blue-400", amber: "bg-amber-500/15 text-amber-400" };
  return (
    <motion.div custom={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.08 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn("relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-sm transition-all duration-500 hover:shadow-xl", accentMap[accent])}>
      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2"><p className="text-sm font-medium text-muted-foreground/80">{label}</p><p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">{value}</p></div>
        <div className={cn("rounded-xl p-3 backdrop-blur-sm shadow-lg", iconBg[accent])}><Icon size={20} /></div>
      </div>
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </motion.div>
  );
}

// ─── Staff Card ───────────────────────────────────────────────────────────────
function StaffCard({ staff, onEdit, onToggleActive, onDelete }) {
  const roleCfg = ROLE_CONFIG[staff.role] || { label: staff.role || "STAFF", color: "bg-muted text-muted-foreground border-border/60" };

  return (
    <motion.div variants={itemVariants} layout whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className={cn("absolute left-0 top-0 h-full w-1 transition-all duration-300", staff.isActive ? "bg-gradient-to-b from-emerald-400 to-emerald-600" : "bg-gradient-to-b from-muted-foreground/30 to-muted-foreground/10")} />
      <div className="p-4 pl-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <motion.div whileHover={{ scale: 1.08 }} className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-lg">
            <User size={20} />
            <motion.div animate={staff.isActive ? { scale: [1, 1.3, 1], opacity: [1, 0.8, 1] } : {}} transition={{ duration: 2, repeat: Infinity }}
              className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card", staff.isActive ? "bg-emerald-400" : "bg-muted-foreground/30")} />
          </motion.div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground truncate">{staff.name || "Unnamed"}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  {staff.email && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail size={10} />{staff.email}</span>}
                  {staff.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={10} />{staff.phone}</span>}
                </div>
              </div>
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium shrink-0", roleCfg.color)}>
                <Shield size={9} />{roleCfg.label}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(staff)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Edit3 size={12} /> Edit
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onToggleActive(staff)}
            className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", staff.isActive ? "text-amber-400 hover:bg-amber-500/10" : "text-emerald-400 hover:bg-emerald-500/10")}>
            {staff.isActive ? <PowerOff size={12} /> : <Power size={12} />}
            {staff.isActive ? "Deactivate" : "Activate"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(staff)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 ml-auto">
            <Trash2 size={12} /> Delete
          </motion.button>
        </div>
      </div>
      <div className={cn("absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-30 pointer-events-none", staff.isActive ? "bg-primary/15" : "bg-muted-foreground/10")} />
    </motion.div>
  );
}

// ─── Staff Dialog ─────────────────────────────────────────────────────────────
function StaffDialog({ isOpen, onClose, staff }) {
  const queryClient = useQueryClient();
  const isEditing = !!staff;

  const [form, setForm] = useState({
    name: staff?.name || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
    password: "",
    role: staff?.role || "STAFF",
  });
  const [errors, setErrors] = useState({});

  const handleClose = () => { setForm({ name: "", email: "", phone: "", password: "", role: "STAFF" }); setErrors({}); onClose(); };

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isEditing) return apiClient.put(`/api/v1/owner/staff/${staff.id}`, payload);
      return apiClient.post("/api/v1/owner/staff", payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["staff"] }); toast.success(`Staff ${isEditing ? "updated" : "created"} successfully`); handleClose(); },
    onError: (err) => { toast.error(err.response?.data?.message || "Something went wrong"); },
  });

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Name is required";
    if (!form.email?.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
    if (!isEditing && !form.password?.trim()) e.password = "Password is required";
    else if (!isEditing && form.password?.length < 6) e.password = "Min 6 characters";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role, phone: form.phone.trim() || undefined };
    if (!isEditing) payload.password = form.password;
    mutation.mutate(payload);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed inset-4 z-50 flex items-center justify-center p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2" role="dialog" aria-modal="true">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{isEditing ? "Edit Staff" : "Add Staff"}</h2>
                  <p className="text-sm text-muted-foreground">{isEditing ? `Update ${staff.name}` : "Invite a new team member"}</p>
                </div>
                <button onClick={handleClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground"><User size={14} className="text-muted-foreground" /> Name <span className="text-destructive">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); if (errors.name) setErrors(p => ({ ...p, name: undefined })); }}
                    placeholder="Full name" className={cn("h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20", errors.name ? "border-destructive" : "border-border focus:border-primary/50")}
                    disabled={mutation.isPending} />
                  {errors.name && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.name}</motion.p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground"><Mail size={14} className="text-muted-foreground" /> Email <span className="text-destructive">*</span></label>
                    <input type="email" value={form.email} onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                      placeholder="staff@email.com" className={cn("h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20", errors.email ? "border-destructive" : "border-border focus:border-primary/50")}
                      disabled={mutation.isPending} />
                    {errors.email && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.email}</motion.p>}
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground"><Phone size={14} className="text-muted-foreground" /> Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 555 0000" className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      disabled={mutation.isPending} />
                  </div>
                </div>

                {!isEditing && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground"><Shield size={14} className="text-muted-foreground" /> Password <span className="text-destructive">*</span></label>
                    <input type="password" value={form.password} onChange={(e) => { setForm(p => ({ ...p, password: e.target.value })); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                      placeholder="Min 6 characters" className={cn("h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20", errors.password ? "border-destructive" : "border-border focus:border-primary/50")}
                      disabled={mutation.isPending} />
                    {errors.password && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{errors.password}</motion.p>}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground"><Shield size={14} className="text-muted-foreground" /> Role</label>
                  <div className="flex gap-2">
                    {["STAFF", "MANAGER"].map((role) => (
                      <button key={role} type="button" onClick={() => setForm(p => ({ ...p, role }))}
                        className={cn("flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all", form.role === role ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-muted/30 text-muted-foreground border-border/60 hover:border-primary/30")}>
                        {ROLE_CONFIG[role]?.label || role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
                  <Button type="submit" disabled={mutation.isPending} className="gap-2 bg-primary hover:bg-primary/90">
                    {mutation.isPending ? <><Loader2 size={16} className="animate-spin" /> {isEditing ? "Saving..." : "Creating..."}</> : <><Check size={16} /> {isEditing ? "Save Changes" : "Add Staff"}</>}
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

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirmDialog({ isOpen, onClose, staff, onConfirm, isPending }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-50 flex items-center justify-center p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2">
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10"><AlertTriangle size={24} className="text-red-400" /></div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">Remove {staff?.name}?</h3>
              <p className="mb-6 text-sm text-muted-foreground">This will permanently remove this staff member and revoke their access.</p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancel</Button>
                <Button onClick={onConfirm} disabled={isPending} className="gap-2 bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20">
                  {isPending ? <><Loader2 size={16} className="animate-spin" /> Removing...</> : <><Trash2 size={16} /> Remove Staff</>}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-24 px-8 backdrop-blur-sm">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="h-64 w-64 rounded-full border border-primary/5" /><div className="h-48 w-48 rounded-full border border-primary/10 absolute" /><div className="h-32 w-32 rounded-full border border-primary/15 absolute" />
      </div>
      <motion.div animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative mb-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg shadow-primary/5">
          <Users size={42} className="text-primary" />
        </div>
        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl" />
      </motion.div>
      <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-3 text-2xl font-bold text-foreground">No team members yet</motion.h3>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-8 max-w-md text-center text-muted-foreground/80 leading-relaxed">
        Add staff members to help manage orders, update the menu, and run daily operations.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Button onClick={onAdd} className="gap-2.5 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20">
          <Plus size={18} /> Add Your First Staff Member
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function StaffSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" /></div></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(i => <div key={i} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-3"><div className="h-4 w-24 rounded-lg bg-white/5 animate-pulse" /><div className="h-8 w-16 rounded-lg bg-white/5 animate-pulse" /></div></div>)}</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2,3,4,5].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />)}</div>
    </div>
  );
}

// ─── Main StaffPage ───────────────────────────────────────────────────────────
export default function StaffPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);

  // ─── Fetch staff ─────────────────────────────────────────────────────
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["staff"],
    queryFn: () => apiClient.get("/api/v1/owner/staff").then((r) => r.data.data),
    retry: 1,
  });
  const staffList = Array.isArray(data) ? data : (data?.content || []);

  // ─── Toggle active ───────────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => apiClient.patch(`/api/v1/owner/staff/${id}/status`, { active: !isActive }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["staff"] }); toast.success("Staff status updated"); },
    onError: (err) => { toast.error(err.response?.data?.message || "Failed to update status"); },
  });

  // ─── Delete ──────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/api/v1/owner/staff/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["staff"] }); toast.success("Staff removed"); setDeletingStaff(null); },
    onError: (err) => { toast.error(err.response?.data?.message || "Failed to remove staff"); },
  });

  // ─── Filter & stats ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchQuery) return staffList;
    const q = searchQuery.toLowerCase();
    return staffList.filter((s) => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.role?.toLowerCase().includes(q));
  }, [staffList, searchQuery]);

  const stats = useMemo(() => ({
    total: staffList.length,
    active: staffList.filter((s) => s.isActive).length,
    inactive: staffList.filter((s) => !s.isActive).length,
    managers: staffList.filter((s) => s.role === "MANAGER").length,
  }), [staffList]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleEdit = (staff) => { setEditingStaff(staff); setShowDialog(true); };
  const handleDelete = (staff) => { setDeletingStaff(staff); };
  const handleToggle = (staff) => { toggleMutation.mutate({ id: staff.id, isActive: staff.isActive }); };

  if (isLoading) return <><FloatingOrbs /><StaffSkeleton /></>;

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10 space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Hero */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-violet-500/10 via-violet-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-primary/10" />
            <div className="relative z-10 flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05, rotate: 3 }} className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 via-violet-500/10 to-transparent ring-1 ring-violet-500/20 shadow-lg">
                <Users size={24} className="text-violet-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Staff Management</h1>
                <p className="text-sm text-muted-foreground/80">Manage your team members and their access roles</p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2">
                <motion.div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />{stats.active} active
                </motion.div>
                <motion.div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  <Users size={12} />{stats.total} total
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div variants={itemVariants} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">Failed to load staff. Backend may be unavailable.</p>
                <Button size="sm" variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["staff"] })} className="border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto">Retry</Button>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          {!error && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Users} label="Total Staff" value={stats.total} trend="Team members" accent="primary" index={0} />
              <StatCard icon={Power} label="Active" value={stats.active} trend={`${stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}% of team`} accent="emerald" index={1} />
              <StatCard icon={PowerOff} label="Inactive" value={stats.inactive} accent="amber" index={2} />
              <StatCard icon={Shield} label="Managers" value={stats.managers} trend="With elevated permissions" accent="blue" index={3} />
            </div>
          )}

          {/* Toolbar */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <input type="text" placeholder="Search by name, email, or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-card/50 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 backdrop-blur-sm transition-all duration-300 focus:border-primary/40 focus:bg-primary/[0.03] focus:outline-none focus:ring-2 focus:ring-primary/15" />
              {searchQuery && (
                <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"><X size={14} /></motion.button>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => { setEditingStaff(null); setShowDialog(true); }} className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20">
                <Plus size={16} /> Add Staff
              </Button>
            </motion.div>
          </motion.div>

          {/* Staff List */}
          {!error && (
            <>
              {filtered.length === 0 && !searchQuery ? (
                <EmptyState onAdd={() => { setEditingStaff(null); setShowDialog(true); }} />
              ) : filtered.length === 0 && searchQuery ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-16">
                  <Search size={32} className="mb-3 text-muted-foreground/50" /><p className="text-muted-foreground">No staff matching "{searchQuery}"</p>
                  <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-primary hover:underline">Clear search</button>
                </motion.div>
              ) : (
                <>
                  <motion.div variants={containerVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {filtered.map((staff) => (
                        <StaffCard key={staff.id} staff={staff} onEdit={handleEdit} onToggleActive={handleToggle} onDelete={handleDelete} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div variants={itemVariants} className="flex items-center justify-center pt-2">
                    <p className="text-sm text-muted-foreground/60">
                      Showing {filtered.length} of {stats.total} staff member{stats.total !== 1 ? "s" : ""}
                      {isFetching && <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="ml-2 text-xs text-primary/60"><RefreshCw size={12} className="inline animate-spin" /> syncing...</motion.span>}
                    </p>
                  </motion.div>
                </>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Dialogs */}
      <StaffDialog isOpen={showDialog} onClose={() => { setShowDialog(false); setEditingStaff(null); }} staff={editingStaff} />
      <DeleteConfirmDialog isOpen={!!deletingStaff} onClose={() => setDeletingStaff(null)} staff={deletingStaff}
        onConfirm={() => deleteMutation.mutate(deletingStaff.id)} isPending={deleteMutation.isPending} />
    </div>
  );
}
