// ─── src/App.jsx ───────────────────────────────────────────────────────────────

import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import AppProviders from './app/providers';

/**
 * Root application component.
 * Wraps the router with shared providers (React Query, Toaster).
 */
export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
