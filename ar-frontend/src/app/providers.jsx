// ─── src/app/providers.jsx ───────────────────────────────────────────────────

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from "../shared/lib/queryClient";

/**
 * Top‑level providers wrapping the entire application.
 * Includes React Query client and toast notifications.
 */
export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Global toast container */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </QueryClientProvider>
  );
}
