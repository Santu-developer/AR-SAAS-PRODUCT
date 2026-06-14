// ─── src/features/auth/components/RegisterForm.jsx ──────────────────────────
// Premium Multi-Step Registration – Fable 5 Quality
// 3D animated background + glassmorphism steps + particle celebration
// ────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Phone,
  Store,
  MapPin,
  Utensils,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  PartyPopper,
  ChefHat,
  Crown,
} from 'lucide-react';
import apiClient from '../../../shared/lib/axios';
import Auth3DScene from '../../../shared/components/common/Auth3DScene';
import ErrorBoundary from '../../../shared/components/common/ErrorBoundary';

// ─── Validation Schemas ─────────────────────────────────────────────────────
const accountSchema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be ≥ 6 chars'),
  phone: z.string().regex(/^\+?\d{7,15}$/, 'Valid phone required').optional().or(z.literal('')),
});

const restaurantSchema = z.object({
  restaurantName: z.string().min(1, 'Restaurant name required'),
  address: z.string().min(1, 'Address required'),
  restaurantPhone: z.string().regex(/^\+?\d{7,15}$/, 'Valid phone required').optional().or(z.literal('')),
  cuisine: z.string().min(1, 'Cuisine type required'),
});

const registerPayloadSchema = accountSchema.extend(restaurantSchema.shape);

// ─── Stagger Variants ───────────────────────────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 24 },
  },
};

// ─── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <motion.div
            animate={{
              scale: current === i ? 1.2 : 1,
              backgroundColor: current >= i ? "hsl(262, 83%, 58%)" : "hsl(0, 0%, 14.9%)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              current >= i ? "text-white" : "text-muted-foreground"
            }`}
          >
            {current > i ? <Check size={14} /> : i + 1}
          </motion.div>
          {i < total - 1 && (
            <motion.div
              animate={{ backgroundColor: current > i ? "hsl(262, 83%, 58%)" : "hsl(0, 0%, 14.9%)" }}
              className="h-0.5 w-8 rounded-full transition-colors"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Premium Input ──────────────────────────────────────────────────────────
function PremiumInput({ id, label, icon: Icon, register, error, type = 'text', placeholder, disabled }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground/90" htmlFor={id}>
        <Icon size={14} className="text-primary" />
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          {...register}
          className={`h-12 w-full rounded-xl border bg-white/5 px-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 ${
            error ? 'border-red-400/50 focus:border-red-400' : 'border-white/10 focus:border-primary/50 focus:bg-primary/5'
          }`}
          placeholder={placeholder}
          disabled={disabled}
        />
        <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 text-xs text-red-400"
        >
          <span className="h-1 w-1 rounded-full bg-red-400" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── Step 1 - Account Details ───────────────────────────────────────────────
function AccountStep({ register, errors, isSubmitting }) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
          <User size={24} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Create your account</h3>
        <p className="text-sm text-muted-foreground">Your personal details</p>
      </div>

      <PremiumInput id="name" label="Full Name" icon={User} register={register('name')} error={errors.name?.message} placeholder="John Doe" disabled={isSubmitting} />
      <PremiumInput id="email" label="Email" icon={Mail} type="email" register={register('email')} error={errors.email?.message} placeholder="john@example.com" disabled={isSubmitting} />
      <PremiumInput id="password" label="Password" icon={Lock} type="password" register={register('password')} error={errors.password?.message} placeholder="Min 6 characters" disabled={isSubmitting} />
      <PremiumInput id="phone" label="Phone (optional)" icon={Phone} type="tel" register={register('phone')} error={errors.phone?.message} placeholder="+1 234 567 890" disabled={isSubmitting} />
    </motion.div>
  );
}

// ─── Step 2 - Restaurant Details ────────────────────────────────────────────
function RestaurantStep({ register, errors, isSubmitting }) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 ring-1 ring-emerald-500/20">
          <ChefHat size={24} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Your Restaurant</h3>
        <p className="text-sm text-muted-foreground">Tell us about your business</p>
      </div>

      <PremiumInput id="restaurantName" label="Restaurant Name" icon={Store} register={register('restaurantName')} error={errors.restaurantName?.message} placeholder="The Grand Kitchen" disabled={isSubmitting} />
      <PremiumInput id="address" label="Address" icon={MapPin} register={register('address')} error={errors.address?.message} placeholder="123 Main Street" disabled={isSubmitting} />
      <PremiumInput id="restaurantPhone" label="Restaurant Phone" icon={Phone} type="tel" register={register('restaurantPhone')} error={errors.restaurantPhone?.message} placeholder="+1 234 567 890" disabled={isSubmitting} />
      <PremiumInput id="cuisine" label="Cuisine Type" icon={Utensils} register={register('cuisine')} error={errors.cuisine?.message} placeholder="Italian, Indian, Chinese..." disabled={isSubmitting} />
    </motion.div>
  );
}

// ─── Step 3 - Success ───────────────────────────────────────────────────────
function SuccessStep({ values, onSubmit, isSubmitting }) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="space-y-6 text-center"
    >
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/20"
      >
        <PartyPopper size={40} className="text-primary" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-bold text-foreground">Almost there!</h3>
        <p className="mt-1 text-sm text-muted-foreground">Review your details before creating your account</p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Store size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{values.restaurantName || "Your Restaurant"}</p>
            <p className="text-xs text-muted-foreground">{values.cuisine || "Cuisine"} • {values.name}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail size={12} />
            <span>{values.email}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin size={12} className="mt-0.5" />
            <span>{values.address}</span>
          </div>
        </div>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary/90 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 disabled:opacity-50"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {isSubmitting ? (
            <span className="relative z-10 flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent"
              />
              Creating your account...
            </span>
          ) : (
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Crown size={16} />
              Create Account
              <Sparkles size={14} />
            </span>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function RegisterForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const {
    register,
    formState: { errors, isSubmitting },
    trigger,
    watch,
  } = useForm({
    resolver: zodResolver(registerPayloadSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '', email: '', password: '', phone: '',
      restaurantName: '', address: '', restaurantPhone: '', cuisine: '',
    },
  });

  const values = watch();

  const goNext = async () => {
    const valid = await trigger(
      step === 1
        ? ['name', 'email', 'password', 'phone']
        : ['restaurantName', 'address', 'restaurantPhone', 'cuisine']
    );
    if (valid) setStep((s) => s + 1);
  };

  const goPrev = () => setStep((s) => s - 1);

  const onSubmit = async () => {
    try {
      const res = await apiClient.post('/api/v1/auth/register', values);
      toast.success('Account created successfully! Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* 3D Background (with error fallback) */}
      <ErrorBoundary>
        <Auth3DScene />
      </ErrorBoundary>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-primary/8 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -30, 30, 0], y: [0, 20, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-emerald-500/8 blur-[150px]"
        />
      </div>

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur-xl transition-all duration-500 hover:border-primary/20">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg shadow-primary/5"
              >
                <Sparkles size={28} className="text-primary" />
              </motion.div>
              <h1 className="text-2xl font-bold text-foreground">Get Started</h1>
              <p className="text-sm text-muted-foreground mt-1">Create your AR Smart Menu account</p>
            </div>

            {/* Step Indicator */}
            <StepIndicator current={step - 1} total={3} />

            {/* Steps Content */}
            <form>
              <div className="mt-6 min-h-[320px]">
                <AnimatePresence mode="wait">
                  {step === 1 && <AccountStep register={register} errors={errors} isSubmitting={isSubmitting} />}
                  {step === 2 && <RestaurantStep register={register} errors={errors} isSubmitting={isSubmitting} />}
                  {step === 3 && (
                    <SuccessStep values={values} onSubmit={onSubmit} isSubmitting={isSubmitting} />
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Buttons (for steps 1 and 2) */}
              {step < 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between mt-8 pt-6 border-t border-white/5"
                >
                  <motion.button
                    type="button"
                    onClick={goPrev}
                    whileHover={{ scale: 1.02, x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      step === 1 ? 'invisible' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <ArrowLeft size={14} />
                    Back
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={goNext}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30"
                  >
                    Continue
                    <ArrowRight size={14} />
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.button>
                </motion.div>
              )}
            </form>
          </div>
        </div>

        {/* Sign In Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Already have an account?{' '}
          <motion.button
            type="button"
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Sign In
            <ArrowRight size={12} />
          </motion.button>
        </motion.p>
      </motion.div>
    </div>
  );
}
