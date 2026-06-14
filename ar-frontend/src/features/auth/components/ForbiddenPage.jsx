// ─── src/features/auth/components/ForbiddenPage.jsx ──────────────────────
// 403 Forbidden Page — shown when user lacks required role permissions
// Premium dark theme with animated lock icon, role info, and navigation options.
// ────────────────────────────────────────────────────────────────────────────

import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldOff,
  ArrowLeft,
  Home,
  LogOut,
  Lock,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ROLES } from '../../../shared/constants/roles';
import { Button } from '../../../shared/components/ui/Button';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleGoHome = () => {
    if (user?.role === ROLES.SUPER_ADMIN) {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard/home');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* ─── Floating Orbs ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-red-500/8 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -20, 40, 0], y: [0, 30, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-orange-500/8 blur-[150px]"
        />
      </div>

      {/* ─── Content ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        {/* Animated Lock Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto mb-8"
        >
          <div className="relative inline-flex">
            <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500/20 via-red-500/10 to-transparent ring-1 ring-red-500/20 shadow-lg shadow-red-500/5">
              <ShieldOff size={56} className="text-red-400" />
            </div>
            {/* Pulsing glow */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-3xl bg-red-500/10 blur-xl"
            />
          </div>
        </motion.div>

        {/* Error Code */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-7xl font-black bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
            403
          </p>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-foreground mb-3"
        >
          Access Forbidden
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-2 leading-relaxed"
        >
          You don&apos;t have permission to access this area.
        </motion.p>

        {/* Current Role Info */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/[0.08] px-4 py-1.5 mb-8"
          >
            <Lock size={12} className="text-muted-foreground/50" />
            <span className="text-xs text-muted-foreground">
              Signed in as{' '}
              <span className="font-medium text-foreground">{user.role?.replace('_', ' ')}</span>
            </span>
          </motion.div>
        )}

        {/* If redirected from a specific page */}
        {location.state?.from && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-xs text-muted-foreground/50 mb-8"
          >
            You tried to access: <span className="font-mono">{location.state.from.pathname}</span>
          </motion.p>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleGoHome}
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20"
            >
              <Home size={16} />
              Go to My Dashboard
            </Button>
          </motion.div>

          <div className="flex gap-3">
            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                className="w-full gap-2"
              >
                <ArrowLeft size={14} />
                Go Back
              </Button>
            </motion.div>

            <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <LogOut size={14} />
                Sign Out
              </Button>
            </motion.div>
          </div>

          <p className="text-xs text-muted-foreground/40 mt-2">
            If you believe this is a mistake, please contact your administrator.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
