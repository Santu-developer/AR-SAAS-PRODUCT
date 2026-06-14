// ─── src/shared/components/ui/Sheet.jsx ──────────────────────────────────
// Sheet component — slide-in panel for mobile menus, filters, and details
// Bottom sheet on mobile, side panel on desktop.
// Premium dark theme with spring animations and accessibility.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollLock } from '../../hooks/useScrollLock';

/**
 * Sheet — slide-in panel that adapts to screen size.
 * Bottom sheet on mobile (< 768px), right panel on desktop.
 *
 * @param {Object} props
 * @param {boolean} props.open - Visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Panel title
 * @param {React.ReactNode} props.children - Panel content
 * @param {string} props.side - 'right' | 'left' (desktop only)
 * @param {string} props.size - 'sm' | 'default' | 'lg' | 'full'
 * @param {boolean} props.closeOnOverlay - (default: true)
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
  side = 'right',
  size = 'default',
  closeOnOverlay = true,
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  useScrollLock(open && !isDesktop);

  // Escape key handler
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const desktopWidths = {
    sm: 'max-w-sm',
    default: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnOverlay ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          {isDesktop ? (
            // Desktop: side panel
            <motion.div
              initial={{ x: side === 'right' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: side === 'right' ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'absolute top-0 bottom-0 flex flex-col bg-card/95 backdrop-blur-xl border-l border-white/[0.08] shadow-2xl',
                side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
                desktopWidths[size] || desktopWidths.default,
                'w-full'
              )}
            >
              <SheetHeader title={title} onClose={onClose} />
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {children}
              </div>
            </motion.div>
          ) : (
            // Mobile: bottom sheet
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-card/95 backdrop-blur-xl border-t border-white/[0.08] shadow-2xl"
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>
              <SheetHeader title={title} onClose={onClose} />
              <div className="flex-1 overflow-y-auto px-6 py-2 pb-6">
                {children}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

function SheetHeader({ title, onClose }) {
  if (!title && !onClose) return null;
  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
      {title ? (
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      ) : (
        <div />
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          aria-label="Close panel"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default Sheet;
