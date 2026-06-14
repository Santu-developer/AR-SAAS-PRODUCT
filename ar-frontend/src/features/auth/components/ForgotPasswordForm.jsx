// ─── src/features/auth/components/ForgotPasswordForm.jsx ─────────────────
// Premium Forgot Password Page — Fable 5 Quality
// 3D CSS background + glassmorphism + animated states
// ────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Shield,
  CheckCircle2,
  Send,
  Loader2,
} from 'lucide-react';
import apiClient from '../../../shared/lib/axios';
import Auth3DScene from '../../../shared/components/common/Auth3DScene';
import ErrorBoundary from '../../../shared/components/common/ErrorBoundary';

// ─── Schema ──────────────────────────────────────────────────────────────────
const forgotSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

// ─── Staggered Animation ────────────────────────────────────────────────────
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
export default function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    try {
      await apiClient.post('/api/v1/auth/forgot-password', { email: data.email });
      setSubmittedEmail(data.email);
      setSubmitted(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link';
      toast.error(msg);
    }
  };

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
        {/* ─── Back Button ────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.button
            type="button"
            onClick={() => navigate('/login')}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.96 }}
            className="group inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            Back to Sign In
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            /* ─── Email Form ────────────────────────────────────────────── */
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Brand Header */}
              <motion.div variants={itemVariants} className="mb-10 text-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent shadow-lg shadow-primary/10 ring-1 ring-primary/20 backdrop-blur-xl"
                >
                  <div className="relative">
                    <Mail size={32} className="text-primary" />
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
                  Forgot password?
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className="mt-2 text-muted-foreground"
                >
                  No worries. Enter your email and we&apos;ll send you a reset link.
                </motion.p>
              </motion.div>

              {/* Form Card */}
              <motion.div
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur-xl transition-all duration-500 hover:border-primary/20 hover:shadow-primary/10"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                <div className="relative p-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email Field */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label
                        className="flex items-center gap-2 text-sm font-medium text-foreground/90"
                        htmlFor="email"
                      >
                        <Mail size={14} className="text-primary" />
                        Email address
                      </label>
                      <div className="relative">
                        <input
                          id="email"
                          type="email"
                          {...register('email')}
                          className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:border-primary/50 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                          placeholder="you@example.com"
                          disabled={isSubmitting}
                        />
                        <Mail
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50"
                        />
                      </div>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1 text-xs text-red-400"
                        >
                          <span className="h-1 w-1 rounded-full bg-red-400" />
                          {errors.email.message}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
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
                            Sending reset link...
                          </span>
                        ) : (
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            <Send size={16} />
                            Send Reset Link
                            <ArrowRight size={14} />
                          </span>
                        )}
                      </motion.button>
                    </motion.div>
                  </form>

                  {/* Divider */}
                  <motion.div variants={itemVariants}>
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-card/80 px-2 text-muted-foreground/50">
                          Remember your password?
                        </span>
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => navigate('/login')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-foreground/80 transition-all hover:bg-white/10"
                    >
                      <ArrowLeft size={14} />
                      Back to Sign In
                    </motion.button>
                  </motion.div>
                </div>
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
                Check your email
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-2"
              >
                We&apos;ve sent a password reset link to:
              </motion.p>

              <motion.p
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="text-lg font-semibold text-primary mb-6"
              >
                {submittedEmail}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border border-white/10 bg-white/5 p-4 mb-8 text-left"
              >
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Didn&apos;t receive the email?</strong>
                  <br />
                  Check your spam folder, or make sure you entered the correct email address.
                  The link expires in 1 hour.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col gap-3"
              >
                <motion.button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedEmail('');
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-foreground/80 transition-all hover:bg-white/10"
                >
                  <Send size={14} />
                  Send again
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </motion.button>
              </motion.div>

              {/* Security notice */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground/50"
              >
                <Shield size={10} className="text-emerald-400/70" />
                End-to-end encrypted
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
