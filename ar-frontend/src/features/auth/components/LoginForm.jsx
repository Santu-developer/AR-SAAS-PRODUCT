// ─── src/features/auth/components/LoginForm.jsx ────────────────────────────
// Premium Login Page – Fable 5 Quality
// 3D animated background + glassmorphism card + staggered micro-interactions
// Includes role-based redirect after successful login.
// ────────────────────────────────────────────────────────────────────────────

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Mail,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
} from 'lucide-react';
import apiClient from '../../../shared/lib/axios';
import { useAuthStore } from '../store/authStore';
import { ROLES } from '../../../shared/constants/roles';
import Auth3DScene from '../../../shared/components/common/Auth3DScene';
import ErrorBoundary from '../../../shared/components/common/ErrorBoundary';

// Zod schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Valid email required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

// ─── Premium Staggered Variants ────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 24,
    },
  },
};

/**
 * Determine the correct post-login path based on user role.
 */
function getPostLoginPath(user, intendedPath) {
  // If there's an intended path from a redirect, use it (if not auth page)
  if (intendedPath && !['/login', '/register', '/forgot-password', '/reset-password', '/403'].includes(intendedPath)) {
    return intendedPath;
  }

  // Role-based default paths
  switch (user?.role) {
    case ROLES.SUPER_ADMIN:
      return '/admin/dashboard';
    case ROLES.RESTAURANT_OWNER:
    case ROLES.STAFF:
      return '/dashboard/home';
    default:
      return '/dashboard/home';
  }
}

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      const res = await apiClient.post('/api/v1/auth/login', data);
      const { accessToken, refreshToken, user } = res.data.data;
      setAuth({ user, accessToken, refreshToken });

      toast.success(`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}!`);

      // Role-aware redirect
      const intendedPath = location.state?.from?.pathname;
      const targetPath = getPostLoginPath(user, intendedPath);
      navigate(targetPath, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* ─── 3D Animated Background ──────────────────────────── */}
      <ErrorBoundary>
        <Auth3DScene />
      </ErrorBoundary>

      {/* ─── Floating Orbs ────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]"
        />
        <motion.div
          animate={{
            x: [0, -20, 40, 0],
            y: [0, 30, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]"
        />
      </div>

      {/* ─── Main Content ─────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* ─── Brand Header ──────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="mb-10 text-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
            transition={{ type: "spring", stiffness: 300 }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent shadow-lg shadow-primary/10 ring-1 ring-primary/20 backdrop-blur-xl"
          >
            <div className="relative">
              <Sparkles size={32} className="text-primary" />
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
            Welcome back
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mt-2 text-muted-foreground"
          >
            Sign in to your AR Smart Menu dashboard
          </motion.p>
        </motion.div>

        {/* ─── Glassmorphism Form Card ────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur-xl transition-all duration-500 hover:border-primary/20 hover:shadow-primary/10"
        >
          {/* Decorative gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="relative p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* ─── Email Field ────────────────────────────────────── */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label
                  className="flex items-center gap-2 text-sm font-medium text-foreground/90"
                  htmlFor="email"
                >
                  <Mail size={14} className="text-primary" />
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pl-11 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:border-primary/50 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                  />
                  <Mail
                    size={16}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === 'email' ? 'text-primary' : 'text-muted-foreground/50'
                    }`}
                  />
                  {/* Glow on focus */}
                  <motion.div
                    animate={{ opacity: focusedField === 'email' ? 1 : 0 }}
                    className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none"
                    transition={{ duration: 0.2 }}
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

              {/* ─── Password Field ──────────────────────────────────── */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    className="flex items-center gap-2 text-sm font-medium text-foreground/90"
                    htmlFor="password"
                  >
                    <Lock size={14} className="text-primary" />
                    Password
                  </label>
                  <motion.button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    whileHover={{ x: 2 }}
                    className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
                  >
                    Forgot?
                  </motion.button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:border-primary/50 focus:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                  />
                  <Lock
                    size={16}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                      focusedField === 'password' ? 'text-primary' : 'text-muted-foreground/50'
                    }`}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                  <motion.div
                    animate={{ opacity: focusedField === 'password' ? 1 : 0 }}
                    className="absolute inset-0 rounded-xl bg-primary/5 pointer-events-none"
                    transition={{ duration: 0.2 }}
                  />
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
              </motion.div>

              {/* ─── Submit Button ─────────────────────────────────── */}
              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary to-primary/90 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Animated gradient background */}
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
                        className="inline-block h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent"
                      />
                      Signing in...
                    </span>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <LogIn size={16} />
                      Sign In
                      <ArrowRight size={14} />
                    </span>
                  )}
                </motion.button>
              </motion.div>

              {/* ─── Footer Links ────────────────────────────────────── */}
              <motion.div variants={itemVariants}>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card/80 px-2 text-muted-foreground/50">
                      secured by AR Smart Menu
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield size={12} className="text-emerald-400/70" />
                  <span>End-to-end encrypted</span>
                </div>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* ─── Register Link ───────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <motion.button
              type="button"
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Create account
              <ArrowRight size={12} />
            </motion.button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
