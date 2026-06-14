import { useEffect } from "react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../shared/lib/axios";
import { Button } from "../../shared/components/ui/Button";
import { Skeleton } from "../../shared/components/ui/Skeleton";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Utensils,
  FileText,
  Loader2,
  Check,
  Save,
  Power,
  PowerOff,
  Camera,
  Sparkles,
  Globe,
} from "lucide-react";
import { cn } from "../../shared/lib/utils";

// ─── Schema ──────────────────────────────────────────────────────────────────
const restaurantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().optional(),
  cuisineType: z.string().optional(),
  isActive: z.boolean(),
});

// ─── Floating Orb Background ─────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Orb 1 — large, slow, top-left */}
      <motion.div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 40, -20, 60, 0],
          y: [0, -30, 50, 10, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb 2 — medium, right */}
      <motion.div
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -50, 30, -20, 0],
          y: [0, 40, -30, 20, 0],
          scale: [1, 0.9, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb 3 — small, fast, center */}
      <motion.div
        className="absolute left-1/2 top-1/3 h-48 w-48 rounded-full opacity-10 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 80, -60, 40, 0],
          y: [0, -60, 40, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Subtle grid overlay */}
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

// ─── Form Field Component ────────────────────────────────────────────────────
function FormField({ label, icon: Icon, error, children, required, hint }) {
  return (
    <motion.div
      className="group space-y-1.5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
        <Icon size={12} className="text-muted-foreground" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] text-destructive/90"
        >
          {error}
        </motion.p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground/60">{hint}</p>
      )}
    </motion.div>
  );
}

// ─── Glass Card Wrapper ──────────────────────────────────────────────────────
function GlassCard({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 250,
        damping: 25,
        delay,
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 backdrop-blur-xl",
        "shadow-[0_4px_24px_rgba(0,0,0,0.08)]",
        "hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
        "hover:border-white/[0.10]",
        "transition-all duration-500",
        className
      )}
    >
      {/* Subtle top gradient line */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {children}
    </motion.div>
  );
}

// ─── Input Styles ────────────────────────────────────────────────────────────
const inputBase = cn(
  "w-full rounded-xl border bg-background/50 px-4 text-sm text-foreground",
  "placeholder:text-muted-foreground/50",
  "transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40",
  "hover:border-white/15"
);
const inputError = "border-destructive/60 focus:border-destructive/60 focus:ring-destructive/15";
const inputNormal = "border-white/[0.08]";

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EditRestaurantPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !restaurantId;
  const { data, isLoading } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () =>
      apiClient.get(`/api/v1/restaurants/${restaurantId}`).then((r) => r.data.data),
    enabled: !!restaurantId,
  });

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      phone: "",
      cuisineType: "",
      isActive: true,
    },
  });

  // Reset form when data loads
  useEffect(() => {
    if (data) {
      setValue("name", data.name || "");
      setValue("address", data.address || "");
      setValue("description", data.description || "");
      setValue("phone", data.phone || "");
      setValue("cuisineType", data.cuisineType || "");
      setValue("isActive", data.isActive ?? true);
    }
  }, [data, setValue]);

  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isNew) {
        return apiClient.post("/api/v1/restaurants", payload);
      }
      return apiClient.put(`/api/v1/restaurants/${restaurantId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success(`Restaurant ${isNew ? "created" : "updated"} successfully`);
      navigate("/dashboard/restaurants");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (formData) => mutation.mutate(formData);

  // Watch all fields for preview
  const watchName = watch("name");
  const watchAddress = watch("address");
  const watchCuisine = watch("cuisineType");
  const watchPhone = watch("phone");
  const watchDescription = watch("description");
  const watchIsActive = watch("isActive");

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="relative min-h-full w-full">
        <FloatingOrbs />
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-72" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
            <div className="space-y-5">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Cuisine Gradient Map ──────────────────────────────────────────────────
  const cuisineGradient =
    {
      "north indian":
        "from-amber-500/20 via-orange-500/10 to-transparent",
      italian: "from-red-500/20 via-rose-500/10 to-transparent",
      chinese: "from-red-500/20 via-yellow-500/10 to-transparent",
      mexican: "from-green-500/20 via-yellow-500/10 to-transparent",
      japanese: "from-red-500/20 via-white/10 to-transparent",
      thai: "from-purple-500/20 via-pink-500/10 to-transparent",
      continental: "from-blue-500/20 via-indigo-500/10 to-transparent",
    }[watchCuisine?.toLowerCase()] || "from-primary/20 via-primary/5 to-transparent";

  return (
    <div className="relative min-h-full w-full">
      <FloatingOrbs />

      <motion.div
        className="mx-auto max-w-6xl px-4 pb-12 pt-4 md:px-6 md:pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          className="mb-8 space-y-3"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
        >
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate("/dashboard/restaurants")}
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            Back to Restaurants
          </motion.button>

          <div className="flex items-start gap-4">
            <motion.div
              className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent shadow-lg shadow-primary/5"
              whileHover={{ scale: 1.05, rotate: -3 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Store size={24} className="text-primary" />
              <motion.div
                className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 blur-md"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {isNew ? "Create Restaurant" : "Edit Restaurant"}
                </h1>
                {!isNew && data && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-medium",
                      data.isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        data.isActive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"
                      )}
                    />
                    {data.isActive ? "Active" : "Inactive"}
                  </motion.span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {isNew
                  ? "Add a new restaurant to your account"
                  : `Editing "${data?.name || "restaurant"}"`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Form Columns ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
          {/* ─── Form ─────────────────────────────────────────────────────── */}
          <motion.form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Basic Information */}
            <GlassCard delay={0.05}>
              <div className="relative p-5 md:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Store size={14} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                </div>

                <div className="space-y-4">
                  <FormField
                    label="Restaurant Name"
                    icon={Store}
                    error={errors.name?.message}
                    required
                    hint="A unique name for your restaurant"
                  >
                    <input
                      type="text"
                      placeholder="e.g., The Royal Kitchen"
                      {...register("name")}
                      className={cn(
                        inputBase,
                        "h-11",
                        errors.name ? inputError : inputNormal
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Address"
                    icon={MapPin}
                    error={errors.address?.message}
                    required
                    hint="Full street address for customer directions"
                  >
                    <textarea
                      placeholder="Full street address including city and PIN code..."
                      rows={3}
                      {...register("address")}
                      className={cn(
                        inputBase,
                        "py-3 resize-none min-h-[80px]",
                        errors.address ? inputError : inputNormal
                      )}
                    />
                  </FormField>

                  <FormField label="Description" icon={FileText} hint="Describe your restaurant's vibe and specialities">
                    <textarea
                      placeholder="Tell customers about your restaurant's story, atmosphere, and what makes it special..."
                      rows={4}
                      {...register("description")}
                      className={cn(inputBase, "py-3 resize-none min-h-[100px]", inputNormal)}
                    />
                  </FormField>
                </div>
              </div>
            </GlassCard>

            {/* Contact Details */}
            <GlassCard delay={0.1}>
              <div className="relative p-5 md:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Phone size={14} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Contact Details</h3>
                </div>

                <div className="space-y-4">
                  <FormField label="Phone Number" icon={Phone} hint="Contact number for customer inquiries">
                    <input
                      type="tel"
                      placeholder="+91 12345 67890"
                      {...register("phone")}
                      className={cn(inputBase, "h-11", inputNormal)}
                    />
                  </FormField>

                  <FormField label="Cuisine Type" icon={Utensils} hint="e.g., North Indian, Italian, Chinese">
                    <input
                      type="text"
                      placeholder="e.g., North Indian, Italian, Chinese"
                      {...register("cuisineType")}
                      className={cn(inputBase, "h-11", inputNormal)}
                    />
                  </FormField>
                </div>
              </div>
            </GlassCard>

            {/* Status Toggle */}
            <GlassCard delay={0.15}>
              <div className="relative p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Power size={14} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Status</h3>
                </div>

                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{
                            scale: field.value ? 1 : 0.9,
                            backgroundColor: field.value
                              ? "rgba(16,185,129,0.1)"
                              : "rgba(255,255,255,0.05)",
                          }}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                          )}
                        >
                          {field.value ? (
                            <Power size={18} className="text-emerald-400" />
                          ) : (
                            <PowerOff size={18} className="text-muted-foreground" />
                          )}
                        </motion.div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {field.value ? "Restaurant Active" : "Restaurant Inactive"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {field.value
                              ? "Visible to customers and accepting orders"
                              : "Hidden from customers and not accepting orders"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          "relative h-7 w-12 rounded-full transition-all duration-300",
                          field.value
                            ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                            : "bg-white/10"
                        )}
                      >
                        <motion.div
                          animate={{ x: field.value ? 22 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className={cn(
                            "absolute top-1 h-5 w-5 rounded-full shadow-lg",
                            field.value ? "bg-white" : "bg-muted-foreground/50"
                          )}
                        />
                      </button>
                    </div>
                  )}
                />
              </div>
            </GlassCard>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 25, delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/dashboard/restaurants")}
                  className="gap-2 text-muted-foreground"
                >
                  <ArrowLeft size={14} />
                  Cancel
                </Button>
              </motion.div>

              <div className="flex items-center gap-3">
                {isDirty && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden text-xs text-muted-foreground sm:inline"
                  >
                    Unsaved changes
                  </motion.span>
                )}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="relative gap-2 overflow-hidden bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>{isNew ? "Create Restaurant" : "Save Changes"}</span>
                      </>
                    )}
                    {/* Shimmer on hover */}
                    <motion.div
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.form>

          {/* ─── Live Preview ─────────────────────────────────────────────── */}
          <div className="space-y-6">
            <GlassCard delay={0.08}>
              <div className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles size={14} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
                </div>

                {/* Preview Card */}
                <motion.div
                  className="overflow-hidden rounded-xl border border-white/[0.06] bg-background/40"
                  layout
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  {/* Cover Area */}
                  <div
                    className={cn(
                      "relative h-36 bg-gradient-to-br transition-all duration-500",
                      cuisineGradient
                    )}
                  >
                    {/* Pattern overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          rotate: [0, -2, 2, 0],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Store size={40} className="text-foreground/15" />
                      </motion.div>
                    </div>

                    {/* Camera button */}
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
                    >
                      <Camera size={14} />
                    </motion.button>
                  </div>

                  {/* Restaurant Info */}
                  <div className="px-5 pb-5">
                    <div className="-mt-8 flex items-end gap-4">
                      <motion.div
                        layout
                        className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-[3px] border-card bg-gradient-to-br from-primary/25 to-primary/5 text-primary shadow-xl"
                      >
                        <Store size={26} />
                        <div className="absolute -inset-0.5 rounded-2xl bg-primary/10 opacity-30 blur-md" />
                      </motion.div>
                      <div className="flex-1 pb-1">
                        <motion.h4
                          layout
                          className="text-base font-bold text-foreground"
                        >
                          {watchName || (
                            <span className="text-muted-foreground/40 italic text-sm font-normal">
                              Restaurant Name
                            </span>
                          )}
                        </motion.h4>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {watchCuisine ? (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Utensils size={12} className="text-primary/60" />
                          <span className="capitalize">{watchCuisine}</span>
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
                          <Utensils size={12} />
                          <span className="italic">No cuisine set</span>
                        </div>
                      )}

                      {watchAddress ? (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <MapPin size={12} className="mt-0.5 text-primary/60" />
                          <span className="line-clamp-2">{watchAddress}</span>
                        </motion.div>
                      ) : (
                        <div className="flex items-start gap-2 text-xs text-muted-foreground/40">
                          <MapPin size={12} className="mt-0.5" />
                          <span className="italic">No address set</span>
                        </div>
                      )}

                      {watchPhone ? (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Phone size={12} className="text-primary/60" />
                          <span>{watchPhone}</span>
                        </motion.div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/40">
                          <Phone size={12} />
                          <span className="italic">No phone set</span>
                        </div>
                      )}
                    </div>

                    {watchDescription && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 text-[11px] leading-relaxed text-muted-foreground/70 line-clamp-3"
                      >
                        {watchDescription}
                      </motion.p>
                    )}

                    {/* Status Badge */}
                    <motion.div
                      className="mt-4 flex items-center gap-2"
                      layout
                    >
                      <motion.div
                        animate={{
                          backgroundColor: watchIsActive
                            ? "rgba(16,185,129,0.1)"
                            : "rgba(255,255,255,0.05)",
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium transition-colors"
                        )}
                      >
                        <motion.span
                          animate={{
                            backgroundColor: watchIsActive
                              ? "rgb(52,211,153)"
                              : "rgb(161,161,170)",
                            boxShadow: watchIsActive
                              ? "0 0 6px rgba(52,211,153,0.5)"
                              : "none",
                          }}
                          className="h-1.5 w-1.5 rounded-full"
                        />
                        {watchIsActive ? "Active" : "Inactive"}
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </GlassCard>

            {/* Tips Card */}
            <GlassCard delay={0.12}>
              <div className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                    <Sparkles size={14} className="text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Pro Tips</h3>
                </div>

                <div className="space-y-3">
                  {[
                    "Add a logo image to make your restaurant stand out visually",
                    "Include your cuisine type for better discoverability by customers",
                    "Add tables and menus after creating the restaurant",
                    "Keep your description updated with current offerings",
                  ].map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex items-start gap-2.5 text-xs text-muted-foreground"
                    >
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check size={10} className="text-emerald-400" />
                      </div>
                      <span className="leading-relaxed">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard delay={0.16}>
              <div className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Globe size={14} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Manage Tables", desc: "Add and configure QR code tables", path: "/dashboard/tables" },
                    { label: "Menu Items", desc: "Create categories and menu items", path: "/dashboard/menus" },
                    { label: "View Analytics", desc: "Track scans, orders, and revenue", path: "/dashboard/analytics" },
                  ].map((link, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(link.path)}
                      className="flex w-full items-center justify-between rounded-lg bg-white/[0.03] px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                    >
                      <div>
                        <p className="text-xs font-medium text-foreground">{link.label}</p>
                        <p className="text-[11px] text-muted-foreground/60">{link.desc}</p>
                      </div>
                      <ArrowLeft size={12} className="rotate-180 text-muted-foreground" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
