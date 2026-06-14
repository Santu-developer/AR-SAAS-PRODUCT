// ─── src/shared/hooks/index.js ───────────────────────────────────────────
// Barrel export for all shared hooks
// ──────────────────────────────────────────────────────────────────────────

export { useDebounce } from './useDebounce';
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsTouch,
  useReducedMotion,
} from './useMediaQuery';
export { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
export { useScrollLock } from './useScrollLock';
