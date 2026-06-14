// ─── src/features/dashboard/NewRestaurantPage.jsx ─────────────────────────
// Premium Create Restaurant — Full Page Form (No Modal)
// 3D Floating Orbs + Glassmorphism + Multi-Step + Spring Animations + Zod
// ────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../shared/lib/axios";
import { Button } from "../../shared/components/ui/Button";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Utensils,
  FileText,
  Loader2,
  Check,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Star,
  Globe,
  Camera,
} from "lucide-react";
import { cn } from "../../shared/lib/utils";

// ─── Schema ──────────────────────────────────────────────────────────────────
const step1Schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  description: z.string().optional(),
});

const step2Schema = z.object({
  phone: z.string().optional(),
  cuisineType: z.string().optional(),
});

const fullSchema = step1Schema.merge(step2Schema);

// ─── Floating Orb Background ─────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)" }}
        animate={{ x: [0, 40, -20, 60, 0], y: [0, -30, 50, 10, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)" }}
        animate={{ x: [0, -50, 30, -20, 0], y: [0, 40, -30, 20, 0], scale: [1, 0.9, 1.1, 0.95, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/3 h-48 w-48 rounded-full opacity-10 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)" }}
        animate={{ x: [0, 80, -60, 40, 0], y: [0, -60, 40, -30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
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

// ─── Glass Card ──────────────────────────────────────────────────────────────
function GlassCard({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 25, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 backdrop-blur-xl",
        "shadow-[0_4px_24px_rgba(0,0,0,0.08)]",
        "hover:shadow-[0_8px_40px_rgba(0,0,0,0.12)]",
        "hover:border-white/[0.10]",
        "transition-all duration-500",
        className
      )}
    >
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {children}
    </motion.div>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-2.5">
      {Array.from({ length: totalSteps }, (_, i) => (
        <motion.div
          key={i}
          className="relative flex items-center"
        >
          {/* Connecting line */}
          {i > 0 && (
            <motion.div
              animate={{ backgroundColor: currentStep >= i ? "rgb(139,92,246)" : "rgba(255,255,255,0.08)" }}
              className="absolute -left-4 h-0.5 w-3 rounded-full"
              transition={{ duration: 0.3 }}
            />
          )}
          <motion.div
            animate={{
              scale: currentStep === i ? 1.15 : currentStep > i ? 0.95 : 0.9,
              backgroundColor: currentStep >= i ? "rgb(139,92,246)" : "rgba(255,255,255,0.05)",
              borderColor: currentStep >= i ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)",
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all",
              currentStep > i ? "border-primary/50" : "border-white/[0.06]"
            )}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {currentStep > i ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Check size={14} className="text-white" />
              </motion.div>
            ) : (
              <span className={currentStep === i ? "text-white" : "text-muted-foreground/50"}>
                {i + 1}
              </span>
            )}
          </motion.div>
        </motion.div>
      ))}
      <span className="ml-2 text-[11px] font-medium text-muted-foreground/70">
        Step {currentStep + 1} of {totalSteps}
      </span>
    </div>
  );
}

// ─── Form Field ──────────────────────────────────────────────────────────────
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

// ─── Input Base Styles ───────────────────────────────────────────────────────
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
export default function NewRestaurantPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const schemas = [step1Schema, step2Schema, fullSchema];

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schemas[step]),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      phone: "",
      cuisineType: "",
    },
    mode: "onChange",
  });

  const createMutation = useMutation({
    mutationFn: (payload) => apiClient.post("/api/v1/restaurants", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant created successfully!");
      navigate("/dashboard/restaurants");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create restaurant");
    },
  });

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      setStep((s) => Math.min(s + 1, schemas.length - 1));
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      description: formData.description || undefined,
      phone: formData.phone || undefined,
      cuisineType: formData.cuisineType || undefined,
    };
    createMutation.mutate(payload);
  };

  // Watch for preview
  const watchName = watch("name");
  const watchAddress = watch("address");
  const watchCuisine = watch("cuisineType");
  const watchPhone = watch("phone");
  const watchDescription = watch("description");

  // ─── Cuisine Gradient ─────────────────────────────────────────────────────
  const cuisineGradient =
    {
      "north indian": "from-amber-500/20 via-orange-500/10 to-transparent",
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
        className="mx-auto max-w-4xl px-4 pb-16 pt-4 md:px-6 md:pt-6"
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
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Create Restaurant
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Add a new restaurant to your platform
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Step Indicator ─────────────────────────────────────────────── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        >
          <StepIndicator currentStep={step} totalSteps={schemas.length} />
        </motion.div>

        {/* ─── Form + Preview Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
          {/* ─── Form Area ──────────────────────────────────────────────── */}
          <div className="space-y-6">
            <GlassCard delay={0.05}>
              <div className="p-5 md:p-6">
                <AnimatePresence mode="wait">
                  {/* Step 1: Basic Info */}
                  {step === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-5"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                          <Store size={14} className="text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                      </div>

                      <FormField
                        label="Restaurant Name"
                        icon={Store}
                        error={errors.name?.message}
                        required
                        hint="Choose a unique and memorable name"
                      >
                        <input
                          type="text"
                          placeholder="e.g., The Royal Kitchen"
                          {...register("name")}
                          className={cn(inputBase, "h-11", errors.name ? inputError : inputNormal)}
                        />
                      </FormField>

                      <FormField
                        label="Address"
                        icon={MapPin}
                        error={errors.address?.message}
                        required
                        hint="Full street address with city and PIN code"
                      >
                        <textarea
                          placeholder="Full street address..."
                          rows={3}
                          {...register("address")}
                          className={cn(inputBase, "py-3 resize-none min-h-[80px]", errors.address ? inputError : inputNormal)}
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
                    </motion.div>
                  )}

                  {/* Step 2: Contact Details */}
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-5"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                          <Phone size={14} className="text-primary" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Contact Details</h3>
                      </div>

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

                      {/* Quick Cuisine Pills */}
                      <div>
                        <p className="mb-2 text-[11px] font-medium text-muted-foreground/70">Quick Select</p>
                        <div className="flex flex-wrap gap-1.5">
                          {["North Indian", "Italian", "Chinese", "Mexican", "Japanese", "Thai", "Continental", "South Indian"].map(
                            (cuisine) => (
                              <motion.button
                                key={cuisine}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const field = register("cuisineType");
                                  field.onChange({ target: { value: cuisine } });
                                }}
                                className={cn(
                                  "rounded-full border px-3 py-1 text-[11px] font-medium transition-all",
                                  watchCuisine === cuisine
                                    ? "border-primary/40 bg-primary/10 text-primary"
                                    : "border-white/[0.06] text-muted-foreground/60 hover:border-white/10 hover:text-foreground"
                                )}
                              >
                                {cuisine}
                              </motion.button>
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Review & Create */}
                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="space-y-5"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                          <Check size={14} className="text-emerald-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">Review & Create</h3>
                      </div>

                      {/* Summary Card */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                        className="rounded-xl border border-white/[0.06] bg-background/40 p-5"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5">
                            <Store size={22} className="text-primary" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-foreground">{watchName}</h4>
                            {watchCuisine && (
                              <p className="text-xs text-muted-foreground capitalize">{watchCuisine}</p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2.5 text-sm">
                          {watchAddress && (
                            <div className="flex items-start gap-2.5">
                              <MapPin size={13} className="mt-0.5 text-muted-foreground/60" />
                              <span className="text-muted-foreground">{watchAddress}</span>
                            </div>
                          )}
                          {watchPhone && (
                            <div className="flex items-center gap-2.5">
                              <Phone size={13} className="text-muted-foreground/60" />
                              <span className="text-muted-foreground">{watchPhone}</span>
                            </div>
                          )}
                          {watchDescription && (
                            <div className="flex items-start gap-2.5">
                              <FileText size={13} className="mt-0.5 text-muted-foreground/60" />
                              <span className="text-muted-foreground/70 text-xs leading-relaxed line-clamp-3">
                                {watchDescription}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>

                      {/* Success Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                        className="flex justify-center"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                          <Sparkles size={24} className="text-emerald-400" />
                        </div>
                      </motion.div>
                      <p className="text-center text-xs text-muted-foreground/70 leading-relaxed">
                        Ready to create your restaurant? You can add menus, tables,
                        and enable AR features after creation.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassCard>

            {/* ─── Navigation Buttons ────────────────────────────────────── */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 25, delay: 0.2 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    className="gap-2 text-muted-foreground"
                    disabled={createMutation.isPending}
                  >
                    <ChevronLeft size={14} />
                    Back
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/dashboard/restaurants")}
                    className="gap-2 text-muted-foreground"
                  >
                    <ArrowLeft size={14} />
                    Cancel
                  </Button>
                )}
              </motion.div>

              <div className="flex items-center gap-3">
                {step > 0 && (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard/restaurants")}
                      disabled={createMutation.isPending}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                )}

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  {step < schemas.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="gap-2 bg-primary px-5 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                    >
                      Continue
                      <ChevronRight size={14} />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit(onSubmit)}
                      disabled={createMutation.isPending}
                      className="relative gap-2 overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-emerald-700"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          Create Restaurant
                        </>
                      )}
                      <motion.div
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* ─── Live Preview Sidebar ──────────────────────────────────────── */}
          <div className="space-y-6">
            <GlassCard delay={0.08}>
              <div className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles size={14} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
                </div>

                <motion.div
                  className="overflow-hidden rounded-xl border border-white/[0.06] bg-background/40"
                  layout
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  {/* Cover */}
                  <div className={cn("relative h-32 bg-gradient-to-br transition-all duration-500", cuisineGradient)}>
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Store size={36} className="text-foreground/15" />
                      </motion.div>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white"
                    >
                      <Camera size={14} />
                    </motion.button>
                  </div>

                  {/* Info */}
                  <div className="px-5 pb-5">
                    <div className="-mt-8 flex items-end gap-4">
                      <motion.div
                        className="relative flex h-15 w-15 items-center justify-center rounded-2xl border-[3px] border-card bg-gradient-to-br from-primary/25 to-primary/5 text-primary shadow-xl"
                        style={{ height: 60, width: 60 }}
                      >
                        <Store size={24} />
                        <div className="absolute -inset-0.5 rounded-2xl bg-primary/10 opacity-30 blur-md" />
                      </motion.div>
                      <div className="flex-1 pb-1">
                        <motion.h4 className="text-base font-bold text-foreground">
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
                  </div>
                </motion.div>
              </div>
            </GlassCard>

            {/* Tips */}
            <GlassCard delay={0.12}>
              <div className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                    <Star size={14} className="text-amber-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Pro Tips</h3>
                </div>
                <div className="space-y-3">
                  {[
                    "Add a logo image to make your restaurant stand out",
                    "Cuisine type helps customers discover your restaurant",
                    "You can add tables and menus right after creation",
                  ].map((tip, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
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

            {/* Quick Links */}
            <GlassCard delay={0.16}>
              <div className="p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Globe size={14} className="text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Need Help?</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Documentation", desc: "Learn about restaurant setup" },
                    { label: "AR Features Guide", desc: "How to enable AR menus" },
                    { label: "Contact Support", desc: "Reach out for help" },
                  ].map((link, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4 }}
                      className="flex w-full items-center justify-between rounded-lg bg-white/[0.03] px-3.5 py-2.5 transition-colors hover:bg-white/[0.06] cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-medium text-foreground">{link.label}</p>
                        <p className="text-[11px] text-muted-foreground/60">{link.desc}</p>
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground/40" />
                    </motion.div>
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
