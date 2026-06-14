// ─── src/shared/components/ui/ErrorState.jsx ─────────────────────────────
// Error State component — shown when API calls or data loading fails
// Premium dark theme with contextual error info and retry action.
// ──────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

/**
 * ErrorState — displays when content fails to load.
 *
 * @param {Object} props
 * @param {string} props.title - Error heading (default: "Something went wrong")
 * @param {string} props.message - Detailed error description
 * @param {Function} props.onRetry - Retry callback
 * @param {string} props.retryLabel - Retry button label (default: "Try Again")
 * @param {boolean} props.fullPage - Use full page layout
 * @param {React.ReactNode} props.children - Custom content
 * @param {string} props.className
 */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  fullPage,
  children,
  className,
}) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      fullPage ? 'min-h-[60vh]' : 'py-16',
      className
    )}>
      {/* Animated Error Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative mb-6"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-500/10 ring-1 ring-red-500/20">
          <AlertTriangle size={36} className="text-red-400" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 rounded-2xl bg-red-500/10 blur-xl"
        />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-xl font-bold text-foreground"
      >
        {title}
      </motion.h3>

      {message && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 max-w-md text-sm text-muted-foreground/80 leading-relaxed"
        >
          {message}
        </motion.p>
      )}

      {children}

      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            onClick={onRetry}
            variant="outline"
            className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw size={14} />
            {retryLabel}
          </Button>
        </motion.div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="relative flex min-h-full w-full items-center justify-center px-4">
        {/* Subtle background orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-red-500/5 blur-[100px]"
          />
        </div>
        {content}
      </div>
    );
  }

  return content;
}

export default ErrorState;
