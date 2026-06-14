// ─── src/shared/hooks/useIsomorphicLayoutEffect.js ───────────────────────
// SSR-safe version of useLayoutEffect — uses useEffect on server, useLayoutEffect in browser
// ──────────────────────────────────────────────────────────────────────────

import { useEffect, useLayoutEffect } from 'react';

export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
