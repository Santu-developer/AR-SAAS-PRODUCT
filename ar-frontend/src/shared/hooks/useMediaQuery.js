// ─── src/shared/hooks/useMediaQuery.js ───────────────────────────────────
// Media query hook — tracks whether a CSS media query matches
// Essential for responsive component logic and adaptive layouts.
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  mobile: '(max-width: 639px)',
  tablet: '(min-width: 640px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  touch: '(hover: none) and (pointer: coarse)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
};

/**
 * useMediaQuery — returns whether a CSS media query currently matches.
 *
 * @param {string} query - CSS media query string or breakpoint key
 * @returns {boolean} - Whether the query matches
 *
 * @example
 * const isMobile = useMediaQuery('mobile');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 */
export function useMediaQuery(query) {
  const resolvedQuery = breakpoints[query] || query;
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(resolvedQuery).matches;
    }
    return false;
  });

  useEffect(() => {
    const mql = window.matchMedia(resolvedQuery);
    const handler = (e) => setMatches(e.matches);

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [resolvedQuery]);

  return matches;
}

/**
 * Convenience breakpoint hooks
 */
export const useIsMobile = () => useMediaQuery('mobile');
export const useIsTablet = () => useMediaQuery('tablet');
export const useIsDesktop = () => useMediaQuery('desktop');
export const useIsTouch = () => useMediaQuery('touch');
export const useReducedMotion = () => useMediaQuery('reducedMotion');

export default useMediaQuery;
