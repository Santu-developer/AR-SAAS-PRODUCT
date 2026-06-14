// ─── src/shared/components/ui/Input.jsx ──────────────────────────────────
// Enhanced Input component — variants, error states, icon prefix/suffix
// Premium dark theme with glows, transitions, and accessibility.
// ──────────────────────────────────────────────────────────────────────────

import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const inputVariants = {
  default: {
    container: 'border-white/[0.08] focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15',
    glow: 'bg-primary/5',
  },
  error: {
    container: 'border-red-400/40 focus-within:border-red-400/60 focus-within:ring-2 focus-within:ring-red-500/15',
    glow: 'bg-red-500/5',
  },
  success: {
    container: 'border-emerald-400/40 focus-within:border-emerald-400/60 focus-within:ring-2 focus-within:ring-emerald-500/15',
    glow: 'bg-emerald-500/5',
  },
};

const Input = forwardRef(function Input(
  {
    className,
    type = 'text',
    label,
    error,
    success,
    icon: Icon,
    iconPosition = 'left',
    rightElement,
    hint,
    containerClassName,
    disabled,
    ...props
  },
  ref
) {
  const [focused, setFocused] = useState(false);
  const variant = error ? 'error' : success ? 'success' : 'default';
  const v = inputVariants[variant];

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
          {label}
          {props.required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            'relative flex items-center rounded-xl border bg-background/50 transition-all duration-200',
            'hover:border-white/15',
            v.container,
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          {/* Focus glow */}
          <motion.div
            animate={{ opacity: focused ? 1 : 0 }}
            className={cn('absolute inset-0 rounded-xl pointer-events-none', v.glow)}
            transition={{ duration: 0.2 }}
          />

          {/* Left Icon */}
          {Icon && iconPosition === 'left' && (
            <div className="relative z-10 pl-3.5">
              <Icon
                size={16}
                className={cn(
                  'transition-colors duration-200',
                  focused ? 'text-primary' : 'text-muted-foreground/50'
                )}
              />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            disabled={disabled}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={cn(
              'relative z-10 w-full bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40',
              'focus:outline-none disabled:cursor-not-allowed',
              'min-h-[44px]',
              Icon && iconPosition === 'left' ? 'pl-2.5' : 'pl-4',
              rightElement ? 'pr-2' : 'pr-4'
            )}
            {...props}
          />

          {/* Right element (clear button, toggle password, etc.) */}
          {rightElement && (
            <div className="relative z-10 pr-2">{rightElement}</div>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-[11px] text-red-400"
        >
          <span className="h-1 w-1 rounded-full bg-red-400" />
          {error}
        </motion.p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground/60">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export { Input };
export default Input;
