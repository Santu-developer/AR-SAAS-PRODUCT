// ─── src/shared/components/ui/Badge.jsx ──────────────────────────────────
// Badge component — variants for status, notification, and labels
// Premium dark theme with glassmorphism and micro-interactions.
// ──────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const badgeVariants = {
  default: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-white/[0.06] text-muted-foreground border-white/[0.08]',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  outline: 'bg-transparent text-muted-foreground border-white/[0.10]',
};

const badgeSizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  default: 'px-2.5 py-0.5 text-[11px]',
  lg: 'px-3 py-1 text-xs',
};

/**
 * Badge — pill-shaped label for status, counts, and categories.
 *
 * @param {Object} props
 * @param {'default'|'secondary'|'success'|'warning'|'danger'|'info'|'outline'} props.variant
 * @param {'sm'|'default'|'lg'} props.size
 * @param {boolean} props.dot - Show a colored dot indicator
 * @param {boolean} props.pulse - Pulsing dot animation
 * @param {boolean} props.removable - Show X button (use with onRemove)
 * @param {Function} props.onRemove - Click handler for X button
 */
export function Badge({
  className,
  variant = 'default',
  size = 'default',
  dot,
  pulse,
  removable,
  onRemove,
  children,
  ...props
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium backdrop-blur-sm',
        badgeVariants[variant] || badgeVariants.default,
        badgeSizes[size] || badgeSizes.default,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            pulse && 'animate-pulse',
            variant === 'success' && 'bg-emerald-400',
            variant === 'warning' && 'bg-amber-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'info' && 'bg-blue-400',
            variant === 'default' && 'bg-primary',
            variant === 'secondary' && 'bg-muted-foreground',
            variant === 'outline' && 'bg-muted-foreground/50'
          )}
        />
      )}
      {children}
      {removable && onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-black/20 transition-colors"
          aria-label="Remove"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 1L7 7M7 1L1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </motion.span>
  );
}

export default Badge;
