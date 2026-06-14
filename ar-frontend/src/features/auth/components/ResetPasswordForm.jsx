// ─── src/features/auth/components/ResetPasswordForm.jsx ──────────────────
// Premium Reset Password Page — Token-based password reset
// 3D CSS background + glassmorphism + animated validation states
// ────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle2,
  Loader2,
  KeyRound,
} from 'lucide-react';
import apiClient from '../../../shared/lib/axios';
import Auth3DScene from '../../../shared/components/common/Auth3DScene';
import ErrorBoundary from '../../../shared/components/common/ErrorBoundary';

// ─── Schema ──────────────────────────────────────────────────────────────────
const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Password Strength Indicator ────────────────────────────────────────────
function PasswordStrength({ password }) {
  if (!password) return null;

  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
  ];

  const strength = checks.filter((c) => c.pass).length;
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColors = [
    'bg-red-400',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-emerald-400',
    'bg-emerald-500',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2 mt-2"
    >
      {/* Strength bar */}
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < strength ? strengthColors[strength] : 'bg-white/5'
            }`}
          />
        ))}
      </div>

      <p className="text-[11px] font-medium text-muted-foreground/60">{strengthLabel}</p>

      {/* Checklist */}
      <div className="space-y-1">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 text-[11px]">
            <div
              className={`h-3 w-3 rounded-full flex items-center justify-center ${
                check.pass ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-muted-foreground/40'
              }`}
            >
              {check.pass ? (
                <CheckCircle2 size={8} />
              ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              )}
            </div>
            <span className={check.pass ? 'text-emerald-400/80' : 'text-muted-foreground/40'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Animation Variants ─────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 24 },
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid or missing reset token');
      return;
    }
    try {
      await apiClient.post('/api/v1/auth/reset-password', {
        token,
        password: data.password,
      });
      setResetDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      toast.error(msg);
    }
  };

  // Missing token state
  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <ErrorBoundary>
          <Auth3DScene />
        </ErrorBoundary>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md px-4 text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
            <KeyRound size={36} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Invalid reset link</h1>
          <p className="text-muted-foreground mb-6">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <motion.button
            type="button"
            onClick={() => navigate('/forgot-password')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20"
          >
            <ArrowLeft size={14} />
            Request new link
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* ─── 3D Background ──────────────────────────────────────────────── */}
      <ErrorBoundary>
        <Auth3DScene />
      </ErrorBoundary>

      {/* ─── Floating Orbs ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -20, 40, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]"
        />
      </div>

      {/* ─── Content ────────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-4"
      >
        <AnimatePresence mode="wait">
          {!resetDone ? (
            /* ─── Reset Form ────────────────────────────────────────────── */
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Brand Header */}
              <motion.div variants={itemVariants} className="mb-10 text-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent shadow-lg shadow-primary/10 ring-1 ring-primary/20 backdrop-blur-xl"
                >
                  <div className="relative">
                    <Lock size={32} className="text-primary" />
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-primary/20 blur-sm"
                    />
                  </div>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="text-3xl font-bold tracking-tight text-foreground"
                >
                  Reset your password
                </motion.h1>
                <motion.p variants={itemVariants} className="mt-2 text-muted-foreground">
                  Choose a strong, unique password for your account.
                </motion.p>
              </motion.div>

              {/* Form Card */}
              <motion.div
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur-xl transition-all duration-500 hover:border-primary/20 hover:shadow-primary/10"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <div className="relative p-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* New Password */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label
                        className="flex items-center gap-2 text-sm font-medium text-foreground/90"
                        htmlFor="password"
                      >
                        <Lock size={14} className="text-primary" />
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          {...register('password')}
                          className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:border-primary/50 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                          placeholder="Enter new password"
                          disabled={isSubmitting}
                        />
                        <Lock
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1 text-xs text-red-400"
                        >
                          <span className="h-1 w-1 rounded-full bg-red-400" />
                          {errors.password.message}
                        </motion.p>
                      )}
                      <PasswordStrength password={watchedPassword} />
                    </motion.div>

                    {/* Confirm Password */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label
                        className="flex items-center gap-2 text-sm font-medium text-foreground/90"
                        htmlFor="confirmPassword"
                      >
                        <Lock size={14} className="text-primary" />
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirm ? 'text' : 'password'}
                          {...register('confirmPassword')}
                          className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:border-primary/50 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                          placeholder="Confirm new password"
                          disabled={isSubmitting}
                        />
                        <Lock
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1 text-xs text-red-400"
                        >
                          <span className="h-1 w-1 rounded-full bg-red-400" />
                          {errors.confirmPassword.message}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Submit */}
                    <motion.div variants={itemVariants}>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary/90 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />
                        {isSubmitting ? (
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Resetting password...
                          </span>
                        ) : (
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <KeyRound size={16} />
                            Reset Password
                            <ArrowRight size={14} />
                          </span>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>
                </div>
              </motion.div>

              {/* Back to login */}
              <motion.div variants={itemVariants} className="mt-8 text-center">
                <motion.button
                  type="button"
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={12} />
                  Back to Sign In
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            /* ─── Success State ─────────────────────────────────────────── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 via-emerald-500/10 to-transparent ring-1 ring-emerald-500/20"
              >
                <CheckCircle2 size={48} className="text-emerald-400" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                Password reset successful!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-8"
              >
                Your password has been updated. Sign in with your new password.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  type="button"
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  Sign In
                  <ArrowRight size={14} />
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground/50"
              >
                <Shield size={10} className="text-emerald-400/70" />
                Your account is now more secure
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
