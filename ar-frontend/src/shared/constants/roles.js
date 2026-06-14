// ─── src/shared/constants/roles.js ─────────────────────────────────────────
// Role definitions and dashboard routing helpers
// Used across auth guards, navigation, and route configuration.
// ────────────────────────────────────────────────────────────────────────────

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
  MANAGER: 'MANAGER',
  STAFF: 'STAFF',
  CUSTOMER: 'CUSTOMER',
};

/**
 * Roles that have access to the Owner / dashboard layout.
 */
export const DASHBOARD_ROLES = [
  ROLES.RESTAURANT_OWNER,
  ROLES.MANAGER,
  ROLES.STAFF,
];

/**
 * Roles that have access to the Super Admin layout.
 */
export const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
];

/**
 * All authenticated platform roles (excluding CUSTOMER).
 */
export const PLATFORM_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.RESTAURANT_OWNER,
  ROLES.MANAGER,
  ROLES.STAFF,
];

/**
 * Get the default dashboard path for a given user role.
 * This is the single source of truth for post-login and route guard redirects.
 *
 * @param {string} role - User role from ROLES enum
 * @returns {string} Default dashboard path
 */
export function getDefaultDashboardPath(role) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return '/admin/dashboard';
    case ROLES.RESTAURANT_OWNER:
    case ROLES.MANAGER:
    case ROLES.STAFF:
      return '/dashboard/home';
    default:
      return '/login';
  }
}

/**
 * Check if a role belongs to the dashboard (owner) group.
 *
 * @param {string} role
 * @returns {boolean}
 */
export function isDashboardRole(role) {
  return DASHBOARD_ROLES.includes(role);
}

/**
 * Check if a role belongs to the admin group.
 *
 * @param {string} role
 * @returns {boolean}
 */
export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}
