// ─── src/features/dashboard/RestaurantOnboardingPage.jsx ─────────────────
// Premium Guided Onboarding Wizard – Post-Registration Restaurant Setup
// Multi-step wizard with welcome, profile setup, and first-look guidance
// ────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Store, MapPin, Phone, Utensils, FileText,
  Check, ChevronRight, ChevronLeft, Loader2, ArrowRight,
  Camera, Star, Globe, Rocket, LayoutDashboard, MenuSquare, Table2,
  QrCode, ShoppingBag, CreditCard, Zap, Settings,
} from "lucide-react";
import apiClient from "../../shared/lib/axios";
import { Button } from "../../shared/components/ui/Button";
import { toast } from "react-hot-toast";
import { cn } from "../../shared/lib/utils";

// ─── Schemas ──────────────────────────────────────────────────────────────
const step1Schema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

const step2Schema = z.object({
  cuisineType: z.string().min(1, "Select or enter a cuisine type"),
  phone: z.string().optional(),
  description: z.string().optional(),
});

const fullSchema = step1Schema.merge(step2Schema);

// ─── Floating Orbs ─────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, -60, 40, 0], y: [0, 50, -40, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-32 -right-32 h-[450px] w-[450px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full opacity-10 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}

// ─── Glass Card ────────────────────────────────────────────────────────────
function GlassCard({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 250, damping: 25, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 backdrop-blur-xl",
        "shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-500",
        className
      )}
    >
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {children}
    </motion.div>
  );
}

// ─── Step Indicator ────────────────────────────────────────────────────────
function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: totalSteps }, (_, i) => (
        <motion.div key={i} className="relative flex items-center">
          {i > 0 && (
            <motion.div
              animate={{ backgroundColor: currentStep >= i ? "rgb(139,92,246)" : "rgba(255,255,255,0.08)" }}
              className="absolute -left-[18px] h-0.5 w-3 rounded-full"
              transition={{ duration: 0.3 }}
            />
          )}
          <motion.div
            animate={{
              scale: currentStep === i ? 1.15 : currentStep > i ? 0.95 : 0.9,
              backgroundColor: currentStep >= i ? "rgb(139,92,246)" : "rgba(255,255,255,0.05)",
              borderColor: currentStep >= i ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.1)",
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all"
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {currentStep > i ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                <Check size={15} className="text-white" />
              </motion.div>
            ) : (
              <span className={currentStep === i ? "text-white" : "text-muted-foreground/50"}>{i + 1}</span>
            )}
          </motion.div>
          {i < totalSteps - 1 && (
            <motion.div className="ml-3" animate={{ color: currentStep > i ? "rgb(139,92,246)" : "rgba(255,255,255,0.15)" }}>
              <ChevronRight size={14} />
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Step Labels ───────────────────────────────────────────────────────────
const STEPS = [
  { title: "Welcome", subtitle: "Let's get started with your restaurant" },
  { title: "Restaurant Details", subtitle: "Tell us about your restaurant" },
  { title: "Cuisine & Contact", subtitle: "Help customers find and recognize you" },
  { title: "Next Steps", subtitle: "What to do after setup" },
];

// ─── Onboarding Feature Cards ──────────────────────────────────────────────
const FEATURES = [
  { icon: MenuSquare, title: "Add Menu Items", desc: "Create categories and dishes with prices, images, and descriptions", color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-400" },
  { icon: Table2, title: "Set Up Tables", desc: "Create tables and generate QR codes for customer ordering", color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-400" },
  { icon: QrCode, title: "QR Menus", desc: "Customers scan QR codes to view your menu and place orders", color: "from-purple-500/20 to-purple-500/5", iconColor: "text-purple-400" },
  { icon: CreditCard, title: "Subscription", desc: "Choose a plan to unlock more features and higher limits", color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-400" },
];

// ─── Quick Cuisine Selector ────────────────────────────────────────────────
const CUISINE_OPTIONS = [
  "North Indian", "South Indian", "Italian", "Chinese",
  "Mexican", "Japanese", "Thai", "Continental",
  "American", "Mediterranean", "French", "Arabic",
];

// ─── Form Field ────────────────────────────────────────────────────────────
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
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] text-destructive/90">
          {error}
        </motion.p>
      )}
      {hint && !error && <p className="text-[11px] text-muted-foreground/60">{hint}</p>}
    </motion.div>
  );
}

// ─── Input Styles ──────────────────────────────────────────────────────────
const inputBase = cn(
  "w-full rounded-xl border bg-background/50 px-4 text-sm text-foreground",
  "placeholder:text-muted-foreground/50 transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40",
  "hover:border-white/15"
);
const inputError = "border-destructive/60 focus:border-destructive/60 focus:ring-destructive/15";
const inputNormal = "border-white/[0.08]";

// ─── Welcome Step ──────────────────────────────────────────────────────────
function WelcomeStep({ onStart }) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-2xl shadow-primary/10">
          <Rocket size={50} className="text-primary" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl bg-primary/10 blur-2xl"
        />
      </motion.div>

      {/* Greeting */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold tracking-tight text-foreground mb-2"
      >
        Welcome to AR Smart Menu! 🎉
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed"
      >
        Your account is ready. Let's set up your first restaurant so you can start
        creating immersive AR menus, manage orders, and delight your customers.
      </motion.p>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-2 gap-3 w-full max-w-lg mb-8"
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + i * 0.08 }}
            className={cn(
              "rounded-xl border border-white/[0.05] bg-gradient-to-br p-3.5 text-left",
              f.color
            )}
          >
            <f.icon size={18} className={cn(f.iconColor, "mb-2")} />
            <p className="text-xs font-semibold text-foreground">{f.title}</p>
            <p className="text-[10px] text-muted-foreground/70 mt-0.5 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={onStart}
            className="gap-2.5 bg-gradient-to-r from-primary to-primary/90 px-8 py-6 text-base shadow-xl shadow-primary/20 hover:shadow-primary/30"
          >
            Set Up My Restaurant
            <ArrowRight size={18} />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Next Steps Step ───────────────────────────────────────────────────────
function NextStepsStep({ restaurantName }) {
  const navigate = useNavigate();

  const nextActions = [
    {
      icon: MenuSquare, label: "Add Menu Items", desc: "Create categories and dishes",
      path: "/dashboard/menus", gradient: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      icon: Table2, label: "Set Up Tables", desc: "Create tables & generate QR codes",
      path: "/dashboard/tables", gradient: "from-blue-500/20 to-blue-500/5",
    },
    {
      icon: ShoppingBag, label: "View Orders", desc: "Monitor incoming customer orders",
      path: "/dashboard/orders", gradient: "from-purple-500/20 to-purple-500/5",
    },
    {
      icon: CreditCard, label: "Subscription", desc: "Upgrade to unlock premium features",
      path: "/dashboard/subscription", gradient: "from-amber-500/20 to-amber-500/5",
    },
    {
      icon: LayoutDashboard, label: "Dashboard Home", desc: "View your restaurant analytics",
      path: "/dashboard/home", gradient: "from-cyan-500/20 to-cyan-500/5",
    },
    {
      icon: Settings, label: "Settings", desc: "Configure notifications, media & more",
      path: "/dashboard/settings", gradient: "from-rose-500/20 to-rose-500/5",
    },
  ];

  const handleNav = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Success celebration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex flex-col items-center text-center py-4"
      >
        <div className="relative mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15">
            <Check size={36} className="text-emerald-400" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl"
          />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          {restaurantName || "Your Restaurant"} is Ready! ✨
        </h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Your restaurant has been created. Here are the recommended next steps
          to get the most out of the platform.
        </p>
      </motion.div>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {nextActions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNav(action.path)}
            className={cn(
              "relative overflow-hidden rounded-xl border border-white/[0.05] bg-gradient-to-br p-4 text-left transition-all",
              action.gradient,
              "hover:border-primary/20 hover:shadow-lg"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06]">
                <action.icon size={18} className="text-foreground/80" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{action.label}</p>
                <p className="text-xs text-muted-foreground/70">{action.desc}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground/40" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center pt-2"
      >
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => handleNav("/dashboard/home")}
            className="gap-2 bg-primary/80 hover:bg-primary px-8"
          >
            <LayoutDashboard size={16} />
            Go to Dashboard
            <ArrowRight size={14} />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RestaurantOnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const schemas = [null, step1Schema, step2Schema, null];

  const {
    register, handleSubmit, watch, trigger, setValue,
    formState: { errors },
  } = useForm({
    resolver: schemas[step] ? zodResolver(schemas[step]) : undefined,
    defaultValues: { name: "", address: "", phone: "", cuisineType: "", description: "" },
    mode: "onChange",
  });

  const watchName = watch("name");
  const watchAddress = watch("address");
  const watchCuisine = watch("cuisineType");
  const watchPhone = watch("phone");

  const cuisineGradient = {
    "north indian": "from-amber-500/20 via-orange-500/10 to-transparent",
    italian: "from-red-500/20 via-rose-500/10 to-transparent",
    chinese: "from-red-500/20 via-yellow-500/10 to-transparent",
    mexican: "from-green-500/20 via-yellow-500/10 to-transparent",
    japanese: "from-red-500/20 via-white/10 to-transparent",
    thai: "from-purple-500/20 via-pink-500/10 to-transparent",
    continental: "from-blue-500/20 via-indigo-500/10 to-transparent",
  }[watchCuisine?.toLowerCase()] || "from-primary/20 via-primary/5 to-transparent";

  // Create restaurant mutation
  const createMutation = useMutation({
    mutationFn: (payload) => apiClient.post("/api/v1/restaurants", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant created successfully! 🎉");
      setStep(3); // Move to Next Steps
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create restaurant");
    },
  });

  const handleNext = async () => {
    if (step === 2) return; // Will handle via submit
    if (schemas[step]) {
      const valid = await trigger();
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = (formData) => {
    createMutation.mutate({
      ...formData,
      description: formData.description || undefined,
      phone: formData.phone || undefined,
    });
  };

  const handleStart = () => setStep(1);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-full w-full">
      <FloatingOrbs />

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 md:px-6 md:pt-10">
        {/* Header with progress */}
        {step > 0 && step < 3 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 space-y-4"
          >
            <div className="flex items-center gap-4">
              <motion.div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent shadow-lg shadow-primary/5">
                <Sparkles size={20} className="text-primary" />
              </motion.div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Restaurant Setup</h1>
                <p className="text-xs text-muted-foreground">{STEPS[step].subtitle}</p>
              </div>
            </div>
            <StepIndicator currentStep={step - 1} totalSteps={3} />
          </motion.div>
        )}

        {/* Step Content */}
        <GlassCard delay={0.05}>
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* Step 0: Welcome */}
              {step === 0 && (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <WelcomeStep onStart={handleStart} />
                </motion.div>
              )}

              {/* Step 1: Restaurant Details */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Store size={16} className="text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Restaurant Details</h3>
                  </div>

                  <FormField label="Restaurant Name" icon={Store} error={errors.name?.message} required hint="Choose a unique and memorable name for your restaurant">
                    <input type="text" placeholder="e.g., The Royal Kitchen" {...register("name")}
                      className={cn(inputBase, "h-11", errors.name ? inputError : inputNormal)} />
                  </FormField>

                  <FormField label="Address" icon={MapPin} error={errors.address?.message} required hint="Full street address with city and PIN code">
                    <textarea placeholder="Full street address including city and PIN code..." rows={3} {...register("address")}
                      className={cn(inputBase, "py-3 resize-none min-h-[80px]", errors.address ? inputError : inputNormal)} />
                  </FormField>

                  <FormField label="Description" icon={FileText} hint="Describe your restaurant's vibe, atmosphere, and specialties">
                    <textarea placeholder="Tell customers about your restaurant's story and what makes it special..." rows={4} {...register("description")}
                      className={cn(inputBase, "py-3 resize-none min-h-[100px]", inputNormal)} />
                  </FormField>
                </motion.div>
              )}

              {/* Step 2: Cuisine & Contact */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Utensils size={16} className="text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Cuisine & Contact</h3>
                  </div>

                  <FormField label="Cuisine Type" icon={Utensils} error={errors.cuisineType?.message} required hint="What type of food does your restaurant serve?">
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {CUISINE_OPTIONS.map((cuisine) => (
                        <motion.button
                          key={cuisine}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setValue("cuisineType", cuisine, { shouldValidate: true })}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all",
                            watchCuisine === cuisine
                              ? "border-primary/40 bg-primary/10 text-primary shadow-sm shadow-primary/5"
                              : "border-white/[0.06] text-muted-foreground/60 hover:border-white/10 hover:text-foreground"
                          )}
                        >
                          {cuisine}
                        </motion.button>
                      ))}
                    </div>
                    <input type="text" placeholder="Or type a custom cuisine..." {...register("cuisineType")}
                      className={cn(inputBase, "h-11", errors.cuisineType ? inputError : inputNormal)} />
                  </FormField>

                  <FormField label="Phone Number" icon={Phone} hint="Contact number for customer inquiries">
                    <input type="tel" placeholder="+91 12345 67890" {...register("phone")}
                      className={cn(inputBase, "h-11", inputNormal)} />
                  </FormField>

                  {/* Live Preview Mini */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-white/[0.06] bg-background/30 p-4"
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-3">Preview</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-primary/5">
                        <Store size={20} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{watchName || "Restaurant Name"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {watchCuisine || "Cuisine"}{watchAddress ? ` • ${watchAddress.slice(0, 30)}...` : ""}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 3: Next Steps */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                >
                  <NextStepsStep restaurantName={watchName} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassCard>

        {/* Navigation */}
        {step > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-between mt-6"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {step < 3 ? (
                <Button type="button" variant="ghost" onClick={handleBack} className="gap-2 text-muted-foreground" disabled={createMutation.isPending}>
                  <ChevronLeft size={14} /> Back
                </Button>
              ) : (
                <Button type="button" variant="ghost" onClick={() => navigate("/dashboard/home")} className="gap-2 text-muted-foreground">
                  Skip for now
                </Button>
              )}
            </motion.div>

            <div className="flex items-center gap-3">
              {step < 2 && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button type="button" onClick={handleNext} className="gap-2 bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
                    Continue <ChevronRight size={14} />
                  </Button>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    disabled={createMutation.isPending}
                    className="gap-2 bg-gradient-to-r from-primary to-primary/90 px-6 text-white shadow-lg shadow-primary/20"
                  >
                    {createMutation.isPending ? (
                      <><Loader2 size={16} className="animate-spin" /> Creating...</>
                    ) : (
                      <><Sparkles size={15} /> Create Restaurant <ArrowRight size={14} /></>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
