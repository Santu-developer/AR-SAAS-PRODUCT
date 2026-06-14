// ─── src/shared/components/ui/Card.jsx ───────────────────────────────────────

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Enhanced shadcn‑ui Card implementation with premium micro-interactions.
 * - Subtle hover lift with shadow elevation
 * - Smooth spring transitions for natural feel
 * - Consistent border and background tokens
 * Provides: Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter
 */

export function Card({ className = '', children, hoverable = false, ...props }) {
  return (
    <motion.div
      className={cn(
        'rounded-lg border border-border bg-card shadow-sm',
        hoverable && 'cursor-pointer',
        className
      )}
      whileHover={hoverable ? { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={cn('font-semibold text-foreground tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...props }) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={cn('p-4 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={cn('flex items-center p-4 pt-0', className)} {...props}>
      {children}
    </div>
  );
}
