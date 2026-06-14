// ─── src/shared/components/ui/Textarea.jsx ───────────────────────────────
// Textarea component — auto-resize, character count, error states
// Premium dark theme with glassmorphism and accessible design.
// ──────────────────────────────────────────────────────────────────────────

import { forwardRef, useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../../lib/utils';

const Textarea = forwardRef(function Textarea(
  {
    className,
    label,
    error,
    hint,
    maxLength,
    showCharCount,
    autoResize = true,
    rows = 3,
    containerClassName,
    ...props
  },
  ref
) {
  const [charCount, setCharCount] = useState(0);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);

  const handleRef = useCallback(
    (node) => {
      textareaRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  // Auto-resize logic
  useEffect(() => {
    if (!autoResize || !textareaRef.current) return;
    const textarea = textareaRef.current;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
  }, [autoResize, props.value]);

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    props.onChange?.(e);
  };

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-medium text-foreground/80">
          {label}
          {props.required && <span className="text-destructive">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          ref={handleRef}
          rows={rows}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          onChange={handleChange}
          maxLength={maxLength}
          className={cn(
            'w-full rounded-xl border bg-background/50 px-4 py-3 text-sm text-foreground',
            'placeholder:text-muted-foreground/40',
            'transition-all duration-200',
            'hover:border-white/15',
            'focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/40',
            'resize-none min-h-[80px]',
            error ? 'border-red-400/40' : 'border-white/[0.08]',
            className
          )}
          {...props}
        />

        {/* Focus glow */}
        {focused && (
          <div className="pointer-events-none absolute inset-0 rounded-xl bg-primary/[0.02]" />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1">
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
        {showCharCount && maxLength && (
          <p
            className={cn(
              'text-[11px] tabular-nums',
              charCount > maxLength * 0.9
                ? 'text-amber-400'
                : 'text-muted-foreground/50'
            )}
          >
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
export default Textarea;
