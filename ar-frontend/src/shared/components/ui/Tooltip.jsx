// ─── src/shared/components/ui/Tooltip.jsx ────────────────────────────────
// Tooltip component — lightweight hover/focus tooltip
// Uses CSS transitions for performance, positioned above trigger element.
// ──────────────────────────────────────────────────────────────────────────

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * Tooltip — shows contextual information on hover or focus.
 *
 * @param {Object} props
 * @param {string} props.content - Tooltip text
 * @param {React.ReactNode} props.children - Trigger element
 * @param {'top'|'bottom'|'left'|'right'} props.side - Position (default: 'top')
 * @param {number} props.delay - Show delay in ms (default: 300)
 * @param {string} props.className
 */
export function Tooltip({ content, children, side = 'top', delay = 300, className }) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), delay);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setShow(false);
  };

  if (!content) return children;

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'pointer-events-none absolute z-[600] whitespace-nowrap rounded-lg bg-foreground/90 px-2.5 py-1.5 text-[11px] font-medium text-background shadow-lg backdrop-blur-sm',
              positionClasses[side] || positionClasses.top,
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tooltip;
