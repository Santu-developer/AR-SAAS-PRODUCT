// ─── src/shared/lib/queryClient.js ───────────────────────────────────────────────

import { QueryClient } from '@tanstack/react-query';

// Default React Query client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time aligns with backend Redis TTL where applicable
      staleTime: 60_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
