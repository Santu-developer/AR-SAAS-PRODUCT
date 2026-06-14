// ─── src/shared/components/ui/Divider.jsx ────────────────────────────────
// Divider component — horizontal rule with optional label
// Uses design tokens for consistent spacing and color.
// ──────────────────────────────────────────────────────────────────────────

import { cn } from '../../lib/utils';

/**
 * Divider — horizontal separator with optional label.
 *
 * @param {Object} props
 * @param {string} props.className
 * @param {React.ReactNode} props.children - Label text (optional)
 * @param {'light'|'default'} props.variant
 */
export function Divider({ className, children, variant = 'default' }) {
  if (children) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className={cn(
          'flex-1 h-px',
          variant === 'light' ? 'bg-white/[0.04]' : 'bg-white/[0.06]'
        )} />
        <span className="text-xs text-muted-foreground/50 whitespace-nowrap">{children}</span>
        <div className={cn(
          'flex-1 h-px',
          variant === 'light' ? 'bg-white/[0.04]' : 'bg-white/[0.06]'
        )} />
      </div>
    );
  }

  return (
    <div className={cn(
      'h-px w-full',
      variant === 'light' ? 'bg-white/[0.04]' : 'bg-white/[0.06]',
      className
    )} />
  );
}

export default Divider;
