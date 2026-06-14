// ─── src/shared/components/ui/Dialog.jsx ─────────────────────────────────
// Dialog component — modal overlay for confirmations, forms, and detail views
// Premium dark theme with glassmorphism, animations, and accessibility.
// ──────────────────────────────────────────────────────────────────────────

import { forwardRef, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useScrollLock } from '../../hooks/useScrollLock';

/**
 * Dialog — accessible modal dialog with backdrop, animations, and keyboard support.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is visible
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Dialog title
 * @param {string} props.description - Optional description
 * @param {React.ReactNode} props.children - Dialog content
 * @param {React.ReactNode} props.footer - Footer actions
 * @param {'sm'|'default'|'lg'|'xl'|'full'} props.size
 * @param {boolean} props.hideClose - Hide the close button
 * @param {boolean} props.closeOnOverlay - Close when clicking overlay (default: true)
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'default',
  hideClose,
  closeOnOverlay = true,
}) {
  const dialogRef = useRef(null);
  useScrollLock(open);

  // Focus trap and escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const sizeStyles = {
    sm: 'max-w-sm',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'dialog-title' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlay ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Panel */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={cn(
              'relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-card shadow-2xl',
              sizeStyles[size] || sizeStyles.default
            )}
          >
            {/* Top gradient line */}
            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-4">
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2 id="dialog-title" className="text-lg font-semibold text-foreground">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
                {!hideClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                    aria-label="Close dialog"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/**
 * DialogTrigger — simple component to open a dialog
 */
export function DialogTrigger({ children, onClick, asChild }) {
  if (asChild) {
    return children;
  }
  return (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default Dialog;
