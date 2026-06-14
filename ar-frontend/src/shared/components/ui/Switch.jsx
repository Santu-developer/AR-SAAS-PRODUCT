// ─── src/shared/components/ui/Switch.jsx ─────────────────────────────────
// Switch/Toggle component — accessible toggle with spring animation
// Premium dark theme with glow effects.
// ──────────────────────────────────────────────────────────────────────────

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Switch — accessible toggle control.
 *
 * @param {Object} props
 * @param {boolean} props.checked - Current state
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.disabled
 * @param {string} props.label - Accessible label
 * @param {string} props.description - Description shown next to switch
 * @param {string} props.size - 'sm' | 'default'
 */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
  description,
  size = 'default',
  className,
}) {
  const dimensions = size === 'sm'
    ? { width: 36, height: 20, thumb: 14, translateX: 16 }
    : { width: 44, height: 24, thumb: 18, translateX: 20 };

  const id = `switch-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={cn(
          'relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
        )}
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        {/* Track */}
        <motion.div
          animate={{
            backgroundColor: checked ? 'hsl(262, 83%, 58%)' : 'rgba(255,255,255,0.08)',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute inset-0 rounded-full"
        >
          {/* Glow */}
          {checked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 rounded-full bg-primary/20 blur-sm"
            />
          )}
        </motion.div>

        {/* Thumb */}
        <motion.div
          animate={{
            x: checked ? dimensions.translateX : 2,
            width: dimensions.thumb,
            height: dimensions.thumb,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 rounded-full shadow-lg',
            checked ? 'bg-white' : 'bg-muted-foreground/50'
          )}
          style={{
            left: 2,
          }}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
        </div>
      )}
    </label>
  );
}

export default Switch;
