// ─── src/features/auth/store/authStore.js ──────────────────────────────────
// Enhanced Auth Store — persisted in sessionStorage (cleared on tab close)
// Manages JWT tokens, user profile, authentication state, and user roles.
// ────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ROLES } from '../../../shared/constants/roles';

/**
 * @typedef {'SUPER_ADMIN'|'RESTAURANT_OWNER'|'STAFF'|'CUSTOMER'} UserRole
 */

/**
 * @typedef {Object} User
 * @property {number|string} id - User ID
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {string} [phone] - Phone number
 * @property {UserRole} role - User role
 * @property {number|string} [tenantId] - Tenant ID (null for Super Admin)
 * @property {string} [status] - Account status
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user
 * @property {string|null} accessToken
 * @property {string|null} refreshToken
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 */

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        // ─── State ────────────────────────────────────────────────────────
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,

        // ─── Actions ──────────────────────────────────────────────────────

        /**
         * Set authentication data after successful login/register.
         * Stores user profile + JWT tokens.
         */
        setAuth: ({ user, accessToken, refreshToken }) => {
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: !!accessToken,
            isLoading: false,
          });
        },

        /**
         * Set loading state for auth operations.
         */
        setLoading: (loading) => set({ isLoading: loading }),

        /**
         * Clear all auth state — used on logout or token refresh failure.
         * Also calls logout API if token exists.
         */
        logout: async () => {
          const { accessToken } = get();
          try {
            // Attempt server-side logout (best-effort)
            if (accessToken) {
              await fetch(
                `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/auth/logout`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
            }
          } catch {
            // Ignore logout API failures
          } finally {
            set({
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        },

        /**
         * Update only the access token — used after silent refresh.
         */
        setToken: (newAccessToken) => {
          set({ accessToken: newAccessToken, isAuthenticated: !!newAccessToken });
        },

        /**
         * Update user profile data without affecting tokens.
         */
        updateUser: (userData) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : userData,
          }));
        },

        // ─── Computed / Helpers ──────────────────────────────────────────

        /**
         * Check if current user has a specific role.
         * @param {UserRole|UserRole[]} roleOrRoles
         * @returns {boolean}
         */
        hasRole: (roleOrRoles) => {
          const { user } = get();
          if (!user?.role) return false;
          if (Array.isArray(roleOrRoles)) {
            return roleOrRoles.includes(user.role);
          }
          return user.role === roleOrRoles;
        },

        /** Check if user is Super Admin. */
        isSuperAdmin: () => get().user?.role === ROLES.SUPER_ADMIN,

        /** Check if user is Restaurant Owner. */
        isOwner: () => get().user?.role === ROLES.RESTAURANT_OWNER,

        /** Check if user is Staff. */
        isStaff: () => get().user?.role === ROLES.STAFF,

        /** Get the default dashboard path based on user role. */
        getDefaultPath: () => {
          const { user } = get();
          if (!user) return '/login';
          switch (user.role) {
            case ROLES.SUPER_ADMIN:
              return '/admin/dashboard';
            case ROLES.RESTAURANT_OWNER:
            case ROLES.STAFF:
              return '/dashboard/home';
            default:
              return '/login';
          }
        },
      }),
      {
        name: 'ar-auth-storage',
        // Only persist tokens and user — not loading state
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

// ─── Helper Selectors ─────────────────────────────────────────────────────────

/** Get current user (for use outside React components). */
export const getCurrentUser = () => useAuthStore.getState().user;

/** Get current access token (for axios interceptor). */
export const getAccessToken = () => useAuthStore.getState().accessToken;

/** Check if authenticated (for axios interceptor). */
export const isAuthenticated = () => useAuthStore.getState().isAuthenticated;

export default useAuthStore;
