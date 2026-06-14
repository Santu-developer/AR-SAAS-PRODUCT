// ─── src/shared/components/ui/EmptyState.jsx ─────────────────────────────
// Empty State component — shown when lists or data sets are empty
// Premium dark theme with animated illustration and contextual CTA.
// ──────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from './Button';

/**
 * EmptyState — displays when a feature or list has no data.
 *
 * @param {Object} props
 * @param {React.ElementType} props.icon - Lucide icon component
 * @param {string} props.title - Main heading
 * @param {string} props.description - Supporting text
 * @param {string} props.actionLabel - CTA button label
 * @param {Function} props.onAction - CTA click handler
 * @param {React.ReactNode} props.children - Custom content instead of default
 * @param {string} props.className
 * @param {'sm'|'default'|'lg'} props.size
 */
export function EmptyState({
  icon: Icon,
  title = 'No data yet',
  description,
  actionLabel,
  onAction,
  children,
  className,
  size = 'default',
}) {
  const sizeStyles = {
    sm: { wrapper: 'py-12', icon: 'h-16 w-16', iconSize: 28, title: 'text-lg', desc: 'text-xs' },
    default: { wrapper: 'py-20', icon: 'h-24 w-24', iconSize: 36, title: 'text-2xl', desc: 'text-sm' },
    lg: { wrapper: 'py-28', icon: 'h-28 w-28', iconSize: 44, title: 'text-3xl', desc: 'text-base' },
  };

  const s = sizeStyles[size] || sizeStyles.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-card/30 px-6 backdrop-blur-sm',
        s.wrapper,
        className
      )}
    >
      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={cn('rounded-full border border-primary/5', size === 'sm' ? 'h-40 w-40' : 'h-64 w-64')} />
        <div className={cn('rounded-full border border-primary/10 absolute', size === 'sm' ? 'h-28 w-28' : 'h-48 w-48')} />
        <div className={cn('rounded-full border border-primary/15 absolute', size === 'sm' ? 'h-16 w-16' : 'h-32 w-32')} />
      </div>

      {children || (
        <>
          {/* Animated Icon */}
          {Icon && (
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mb-6"
            >
              <div className={cn(
                'flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/20 shadow-lg shadow-primary/5',
                s.icon
              )}>
                <Icon size={s.iconSize} className="text-primary" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl"
              />
            </motion.div>
          )}

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn('mb-2 font-bold text-foreground', s.title)}
          >
            {title}
          </motion.h3>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={cn('mb-6 max-w-md text-center text-muted-foreground/80 leading-relaxed', s.desc)}
            >
              {description}
            </motion.p>
          )}

          {actionLabel && onAction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={onAction}
                className="gap-2 bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30"
              >
                {actionLabel}
              </Button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default EmptyState;
