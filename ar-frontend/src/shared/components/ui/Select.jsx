// ─── src/shared/components/ui/Select.jsx ─────────────────────────────────
// Select component — native <select> with premium styling
// Built for accessibility, touch devices, and keyboard navigation.
// ──────────────────────────────────────────────────────────────────────────

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Select = forwardRef(function Select(
  { className, label, error, hint, options = [], placeholder, containerClassName, ...props },
  ref
) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
          {label}
          {props.required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'w-full appearance-none rounded-xl border bg-background/50 py-2.5 pl-4 pr-10 text-sm text-foreground',
            'transition-all duration-200',
            'hover:border-white/15',
            'focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40',
            'min-h-[44px]',
            error ? 'border-red-400/40' : 'border-white/[0.08]',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
          <ChevronDown size={16} />
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-400">
          <span className="h-1 w-1 rounded-full bg-red-400" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground/60">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
export default Select;
