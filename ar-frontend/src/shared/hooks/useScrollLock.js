// ─── src/shared/hooks/useScrollLock.js ───────────────────────────────────
// Scroll lock hook — prevents body scroll when modals/drawers are open
// Handles iOS Safari overscroll and maintains scroll position.
// ──────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';

/**
 * useScrollLock — locks body scroll when `locked` is true.
 * Preserves the current scroll position and restores it on unlock.
 *
 * @param {boolean} locked - Whether to lock scrolling
 */
export function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [locked]);
}

export default useScrollLock;
