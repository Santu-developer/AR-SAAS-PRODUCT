import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Store,
  MapPin,
  Phone,
  Utensils,
  FileText,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import apiClient from "../../shared/lib/axios";
import { Button } from "../../shared/components/ui/Button";
import { toast } from "react-hot-toast";
import { cn } from "../../shared/lib/utils";

// ─── Form Field Component ────────────────────────────────────────────────────
function FormField({ label, icon: Icon, error, children, required }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Icon size={14} className="text-muted-foreground" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <motion.div
          key={i}
          animate={{
            width: currentStep === i ? 24 : 8,
            backgroundColor: currentStep >= i ? "rgb(168, 85, 247)" : "rgb(38, 38, 38)",
          }}
          className="h-2 rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      ))}
    </div>
  );
}

// ─── Main Modal Component ────────────────────────────────────────────────────
export default function CreateRestaurantModal({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    phone: "",
    cuisineType: "",
  });
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload) => apiClient.post("/api/v1/restaurants", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast.success("Restaurant created successfully!");
      handleClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create restaurant");
    },
  });

  const handleClose = () => {
    setFormData({ name: "", address: "", description: "", phone: "", cuisineType: "" });
    setErrors({});
    setStep(0);
    onClose();
  };

  const validateStep = (stepIndex) => {
    const newErrors = {};

    if (stepIndex === 0) {
      if (!formData.name || formData.name.length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }
      if (!formData.address || formData.address.length < 5) {
        newErrors.address = "Address must be at least 5 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      description: formData.description || undefined,
      phone: formData.phone || undefined,
      cuisineType: formData.cuisineType || undefined,
    };
    createMutation.mutate(payload);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ─── Step Content ────────────────────────────────────────────────────────
  const steps = [
    {
      title: "Basic Information",
      subtitle: "Tell us about your restaurant",
      content: (
        <div className="space-y-5">
          <FormField
            label="Restaurant Name"
            icon={Store}
            error={errors.name}
            required
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g., The Royal Kitchen"
              className={cn(
                "h-11 w-full rounded-xl border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                errors.name ? "border-destructive" : "border-border focus:border-primary/50"
              )}
            />
          </FormField>

          <FormField
            label="Address"
            icon={MapPin}
            error={errors.address}
            required
          >
            <textarea
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Full street address..."
              rows={3}
              className={cn(
                "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none",
                errors.address ? "border-destructive" : "border-border focus:border-primary/50"
              )}
            />
          </FormField>

          <FormField label="Description" icon={FileText}>
            <textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Brief description of your restaurant..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </FormField>
        </div>
      ),
    },
    {
      title: "Contact Details",
      subtitle: "How can customers reach you?",
      content: (
        <div className="space-y-5">
          <FormField label="Phone Number" icon={Phone}>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+91 1234567890"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </FormField>

          <FormField label="Cuisine Type" icon={Utensils}>
            <input
              type="text"
              value={formData.cuisineType}
              onChange={(e) => updateField("cuisineType", e.target.value)}
              placeholder="e.g., North Indian, Italian, Chinese"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </FormField>

          {/* Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-muted/30 p-4"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preview
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Store size={20} />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {formData.name || "Restaurant Name"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formData.cuisineType || "Cuisine Type"} • {formData.address || "Address"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      title: "Review & Create",
      subtitle: "Double-check your details before creating",
      content: (
        <div className="space-y-4">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-muted/30 p-5"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Store size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {formData.name}
                </h3>
                {formData.cuisineType && (
                  <p className="text-sm text-muted-foreground">
                    {formData.cuisineType}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={14} className="mt-0.5 text-muted-foreground" />
                <span className="text-foreground">{formData.address}</span>
              </div>
              {formData.phone && (
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-muted-foreground" />
                  <span className="text-foreground">{formData.phone}</span>
                </div>
              )}
              {formData.description && (
                <div className="flex items-start gap-3">
                  <FileText size={14} className="mt-0.5 text-muted-foreground" />
                  <span className="text-foreground">{formData.description}</span>
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <Sparkles size={28} className="text-emerald-400" />
            </div>
          </motion.div>
          <p className="text-center text-sm text-muted-foreground">
            Ready to create your restaurant? You can add menus, tables, and enable
            AR features after creation.
          </p>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-4 z-50 flex items-center justify-center p-4 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-restaurant-title"
          >
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
              {/* Header */}                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 id="create-restaurant-title" className="text-lg font-semibold text-foreground">
                    {steps[step].title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {steps[step].subtitle}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center justify-center px-6 py-4">
                <StepIndicator currentStep={step} totalSteps={steps.length} />
              </div>

              {/* Content */}
              <div className="min-h-[300px] px-6 py-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {steps[step].content}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    className="gap-2"
                  >
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>

                  {step < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={createMutation.isPending}
                      className="gap-2 bg-primary hover:bg-primary/90"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Create Restaurant
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
