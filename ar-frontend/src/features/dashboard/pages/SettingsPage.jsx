// ─── src/features/dashboard/pages/SettingsPage.jsx ───────────────────────────────
// Premium Settings – Full API Integration
// Restaurant profile + Media upload + Account settings
// ────────────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Store,
  Image,
  Upload,
  Check,
  X,
  Save,
  Loader2,
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  ChevronDown,
  AlertTriangle,
  Camera,
  RefreshCw,
  Trash2,
  LogOut,
  Smartphone,
  FileJson,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import apiClient from "../../../shared/lib/axios";
import { Button } from "../../../shared/components/ui/Button";
import { Skeleton } from "../../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { cn } from "../../../shared/lib/utils";

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 200, damping: 25 },
  },
};

// ─── Floating Orbs ───────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)" }} />
      <motion.div animate={{ x: [0, -50, 30, 0], y: [0, 40, -30, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
    </div>
  );
}

// ─── Tab Navigation ──────────────────────────────────────────────────────────
const SETTINGS_TABS = [
  { key: "restaurant", label: "Restaurant", icon: Store },
  { key: "account", label: "Account", icon: User },
  { key: "media", label: "Media", icon: Image },
  { key: "notifications", label: "Notifications", icon: Bell },
];

// ─── Section Card ────────────────────────────────────────────────────────────
function SectionCard({ title, description, children, className }) {
  return (
    <motion.div variants={itemVariants} className={cn("rounded-2xl border border-white/[0.06] bg-card/40 backdrop-blur-sm overflow-hidden", className)}>
      <div className="px-6 py-5 border-b border-white/[0.05]">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Form Field ──────────────────────────────────────────────────────────────
function FormField({ label, error, children, required }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive">{error}</motion.p>}
    </div>
  );
}

// ─── Restaurant Settings Tab ──────────────────────────────────────────────────
function RestaurantSettings({ restaurant, onUpdate, isUpdating }) {
  const [form, setForm] = useState({
    name: restaurant?.name || "",
    address: restaurant?.address || "",
    phone: restaurant?.phone || "",
    cuisineType: restaurant?.cuisineType || "",
    description: restaurant?.description || "",
  });
  const [errors, setErrors] = useState({});

  const CUISINE_OPTIONS = ["North Indian", "South Indian", "Chinese", "Italian", "Mexican", "Japanese", "Continental", "American", "Mediterranean", "Thai", "French", "Arabic"];

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Restaurant name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onUpdate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SectionCard title="Restaurant Profile" description="Update your restaurant's basic information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField label="Restaurant Name" required error={errors.name}>
            <input type="text" value={form.name} onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: undefined })); }}
              placeholder="Enter restaurant name"
              className={cn("h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20", errors.name ? "border-destructive" : "border-border focus:border-primary/50")}
            />
          </FormField>
          <FormField label="Phone">
            <input type="tel" value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </FormField>
          <FormField label="Cuisine Type">
            <div className="flex flex-wrap gap-2">
              {CUISINE_OPTIONS.slice(0, 6).map((c) => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, cuisineType: p.cuisineType === c ? "" : c }))}
                  className={cn("rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
                    form.cuisineType === c ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60 hover:border-primary/30"
                  )}>{c}</button>
              ))}
            </div>
          </FormField>
          <FormField label="Address">
            <input type="text" value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
              placeholder="Restaurant address"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </FormField>
        </div>
        <FormField label="Description">
          <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Brief description of your restaurant..."
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </FormField>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isUpdating} className="gap-2">
            {isUpdating ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
          </Button>
        </div>
      </SectionCard>
    </form>
  );
}

// ─── Account Settings Tab ────────────────────────────────────────────────────
function AccountSettings({ user, onLogout }) {
  return (
    <div className="space-y-6">
      <SectionCard title="Profile Information" description="Your account details">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg">
            <User size={28} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{user?.name || "User"}</h3>
            <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Name</p>
            <p className="text-sm text-foreground">{user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Email</p>
            <p className="text-sm text-foreground">{user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Phone</p>
            <p className="text-sm text-foreground">{user?.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Role</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Shield size={10} />{user?.role?.replace("_", " ") || "OWNER"}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Security" description="Manage your account security">
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground">Change Password</p>
            <p className="text-xs text-muted-foreground">Update your account password</p>
          </div>
          <Button size="sm" variant="outline">Update</Button>
        </div>
        <div className="flex items-center justify-between py-2 mt-3 border-t border-white/[0.05]">
          <div>
            <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
          </div>
          <Button size="sm" variant="outline">Enable</Button>
        </div>
      </SectionCard>

      <SectionCard title="Sessions" description="Manage your active sessions">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Smartphone size={16} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Current Session</p>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Active
          </span>
        </div>
      </SectionCard>

      <SectionCard title="Danger Zone" description="Irreversible actions">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"><LogOut size={18} className="text-red-400" /></div>
            <div>
              <p className="text-sm font-medium text-foreground">Logout</p>
              <p className="text-xs text-muted-foreground">Sign out of your account</p>
            </div>
          </div>
          <Button size="sm" onClick={onLogout} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">Logout</Button>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10"><Trash2 size={18} className="text-red-400" /></div>
            <div>
              <p className="text-sm font-medium text-foreground">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
          </div>
          <Button size="sm" className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">Delete</Button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Media Upload Tab ────────────────────────────────────────────────────────
function MediaSettings() {
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("image");
  const fileInputRef = useRef(null);

  // Fetch uploaded media
  const { data: mediaData, isLoading: loadingMedia, refetch } = useQuery({
    queryKey: ["mediaFiles"],
    queryFn: () => apiClient.get("/api/v1/media").then((r) => r.data.data),
    retry: 1,
  });

  const mediaFiles = useMemo(() => {
    const items = Array.isArray(mediaData) ? mediaData : (mediaData?.content || []);
    return items.slice(-10).reverse();
  }, [mediaData]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = uploadType === "image" ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
    const allowedTypes = uploadType === "image" ? ["image/jpeg", "image/png", "image/webp"] : ["model/gltf-binary", "model/gltf+json", ".glb"];

    if (file.size > maxSize) {
      toast.error(uploadType === "image" ? "Image must be under 5MB" : "3D model must be under 20MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = uploadType === "image" ? "/api/v1/media/upload/image" : "/api/v1/media/upload/model";
      const res = await apiClient.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(`${uploadType === "image" ? "Image" : "3D Model"} uploaded successfully`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <SectionCard title="Upload Media" description="Upload images and 3D models for your menu items">
        <div className="flex items-center gap-3 mb-4">
          <button type="button" onClick={() => setUploadType("image")}
            className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border",
              uploadType === "image" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60"
            )}>
            <Image size={16} />Images (JPG/PNG/WebP)
          </button>
          <button type="button" onClick={() => setUploadType("model")}
            className={cn("flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all border",
              uploadType === "model" ? "bg-primary text-primary-foreground border-primary" : "bg-muted/30 text-muted-foreground border-border/60"
            )}>
            <FileJson size={16} />3D Models (GLB)
          </button>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 py-12 px-6 transition-colors hover:border-primary/50 hover:bg-primary/[0.02]"
        >
          <input ref={fileInputRef} type="file" accept={uploadType === "image" ? "image/*" : ".glb,.gltf"} onChange={handleFileUpload} className="hidden" disabled={uploading} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Upload size={28} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Drop {uploadType === "image" ? "an image" : "a 3D model"} here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                {uploadType === "image" ? "JPG, PNG, or WebP (max 5MB)" : "GLB/GLTF format (max 20MB)"}
              </p>
            </>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Recent Uploads" description="Your recently uploaded media files">
        {loadingMedia ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[0,1,2,3].map(i => <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Image size={28} className="text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No uploads yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {mediaFiles.map((file, idx) => (
              <motion.div key={file.id || idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-muted/20"
              >
                {file.resourceType === "image" || file.url?.match(/\.(jpg|jpeg|png|webp)/i) ? (
                  <img src={file.url} alt={file.publicId || "Upload"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileJson size={24} className="text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                    <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Notifications Settings Tab ──────────────────────────────────────────────
function NotificationSettings() {
  const [settings, setSettings] = useState({
    newOrders: true,
    orderUpdates: true,
    qrScans: false,
    weeklyReports: true,
    subscriptionAlerts: true,
    marketingEmails: false,
  });

  const toggles = [
    { key: "newOrders", label: "New Orders", desc: "When a customer places a new order" },
    { key: "orderUpdates", label: "Order Updates", desc: "When order status changes" },
    { key: "qrScans", label: "QR Scans", desc: "Daily summary of QR scan activity" },
    { key: "weeklyReports", label: "Weekly Reports", desc: "Weekly analytics report via email" },
    { key: "subscriptionAlerts", label: "Subscription Alerts", desc: "Payment and renewal notifications" },
    { key: "marketingEmails", label: "Marketing Emails", desc: "Product updates and promotional offers" },
  ];

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SectionCard title="Notification Preferences" description="Choose what notifications you receive">
      <div className="space-y-1">
        {toggles.map((t) => (
          <div key={t.key} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
            <button type="button" onClick={() => handleToggle(t.key)}
              className={cn("relative h-6 w-11 rounded-full transition-colors", settings[t.key] ? "bg-primary" : "bg-muted")}
            >
              <motion.div animate={{ x: settings[t.key] ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4 border-t border-white/[0.05]">
        <Button size="sm" onClick={() => toast.success("Preferences saved")} className="gap-2"><Save size={14} />Save Preferences</Button>
      </div>
    </SectionCard>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" /><div className="space-y-2"><div className="h-7 w-48 rounded-lg bg-white/5 animate-pulse" /><div className="h-4 w-64 rounded-lg bg-white/5 animate-pulse" /></div></div>
      <div className="flex gap-2">{[0,1,2,3].map(i => <div key={i} className="h-10 w-28 rounded-xl bg-white/5 animate-pulse" />)}</div>
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6"><div className="space-y-4">{[0,1,2,3].map(i => <div key={i} className="h-11 rounded-xl bg-white/5 animate-pulse" />)}</div></div>
    </div>
  );
}

// ─── Main SettingsPage ────────────────────────────────────────────────────────
export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("restaurant");
  const [isUpdating, setIsUpdating] = useState(false);

  // ─── Fetch auth user ─────────────────────────────────────────────────
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ["authMe"],
    queryFn: () => apiClient.get("/api/v1/auth/me").then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  // ─── Fetch restaurants ───────────────────────────────────────────────
  const { data: restaurantsData, isLoading: loadingRestaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => apiClient.get("/api/v1/restaurants").then((r) => r.data.data),
    retry: 1,
  });
  const restaurants = Array.isArray(restaurantsData) ? restaurantsData : (restaurantsData?.content || []);
  const firstRestaurant = restaurants[0];

  // ─── Update restaurant mutation ──────────────────────────────────────
  const updateRestaurantMutation = useMutation({
    mutationFn: (data) => apiClient.put(`/api/v1/restaurants/${firstRestaurant.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant updated successfully");
      setIsUpdating(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update");
      setIsUpdating(false);
    },
  });

  const handleUpdateRestaurant = (data) => {
    setIsUpdating(true);
    updateRestaurantMutation.mutate(data);
  };

  const handleLogout = () => {
    apiClient.post("/api/v1/auth/logout").finally(() => {
      window.location.href = "/login";
    });
  };

  // ─── Loading ─────────────────────────────────────────────────────────
  if (loadingUser && loadingRestaurants) return <><FloatingOrbs /><SettingsSkeleton /></>;

  return (
    <div className="relative min-h-full">
      <FloatingOrbs />
      <div className="relative z-10 space-y-6">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* ─── Hero ────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-slate-500/10 via-slate-500/5 to-transparent p-6 backdrop-blur-sm">
            <motion.div animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-slate-500/10 via-transparent to-primary/10" />
            <div className="relative z-10 flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05, rotate: 3 }} className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500/30 via-slate-500/10 to-transparent ring-1 ring-slate-500/20 shadow-lg">
                <Settings size={24} className="text-slate-300" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
                <p className="text-sm text-muted-foreground/80">Manage your account, restaurant, and preferences</p>
              </div>
            </div>
          </motion.div>

          {/* ─── Tab Navigation ───────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn("relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                    activeTab === tab.key ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" : "bg-card/50 text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {activeTab === tab.key && <motion.div layoutId="activeSettingsTab" className="absolute inset-0 rounded-xl bg-primary" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
                  <Icon size={14} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* ─── Tab Content ───────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {activeTab === "restaurant" && (
                firstRestaurant ? (
                  <RestaurantSettings restaurant={firstRestaurant} onUpdate={handleUpdateRestaurant} isUpdating={isUpdating} />
                ) : (
                  <SectionCard title="No Restaurant Found" description="Create a restaurant first to manage its settings">
                    <div className="flex flex-col items-center justify-center py-10">
                      <Store size={32} className="text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">You haven't created any restaurants yet</p>
                    </div>
                  </SectionCard>
                )
              )}
              {activeTab === "account" && <AccountSettings user={user} onLogout={handleLogout} />}
              {activeTab === "media" && <MediaSettings />}
              {activeTab === "notifications" && <NotificationSettings />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
