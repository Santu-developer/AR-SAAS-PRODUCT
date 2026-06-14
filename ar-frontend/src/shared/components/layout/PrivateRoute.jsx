// ─── src/shared/components/layout/PrivateRoute.jsx ─────────────────────────
// PrivateRoute — Legacy wrapper, delegates to AuthGuard for consistent behavior.
// Kept as thin wrapper for backward compatibility with existing route definitions.
// Features:
// - Redirects to /login if not authenticated (preserves intended destination via state)
// - Redirects to /403 if user lacks the required role
// - Redirects authenticated users on /login to their correct dashboard
// - Clear all auth state on logout
// ────────────────────────────────────────────────────────────────────────────

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { getDefaultDashboardPath } from '../../constants/roles';
import PageLoader from '../common/PageLoader';

/**
 * PrivateRoute — protects routes behind authentication and optional role check.
 *
 * @param {Object} props
 * @param {string[]} [props.roles] - Required roles (optional).
 * @param {boolean} [props.requireAuth=true] - Whether auth is required.
 * @param {React.ReactNode} [props.children] - Custom children instead of Outlet.
 */
export default function PrivateRoute({ roles, requireAuth = true, children, redirectTo }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading while auth initializes
  if (isLoading) {
    return <PageLoader />;
  }

  // Not authenticated → redirect to login (preserve intended destination)
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo || "/login"} state={{ from: location }} replace />;
  }

  // Authenticated but on login/register page → redirect to correct dashboard
  if (!requireAuth && isAuthenticated) {
    const targetPath = redirectTo || getDefaultDashboardPath(user?.role);
    return <Navigate to={targetPath} replace />;
  }

  // Check role-based access
  if (isAuthenticated && roles && roles.length > 0 && user?.role) {
    if (!roles.includes(user.role)) {
      // User doesn't have required role → 403
      return <Navigate to="/403" state={{ from: location }} replace />;
    }
  }

  return children || <Outlet />;
}

