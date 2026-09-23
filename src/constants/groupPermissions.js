// ============================================================
// Group Permissions (Frontend)
// ============================================================
//
// Centralized permission definitions for the group system.
// Mirrors the backend GROUP_PERMISSIONS exactly.
//
// These are used for UI behavior only (showing/hiding actions).
// They are NOT a security boundary — the backend enforces authorization.
//
// To add new permissions:
// 1. Add to backend GROUP_PERMISSIONS
// 2. Add the same entry here
// ============================================================

export const GROUP_PERMISSIONS = {
  APPLICATIONS_VIEW: "applications.view",
  APPLICATIONS_APPROVE: "applications.approve",
  APPLICATIONS_REJECT: "applications.reject",
  MEMBERS_VIEW: "members.view",
  MEMBERS_REMOVE: "members.remove",
  GROUP_EDIT: "group.edit",
};

/**
 * Flat array of all valid permission strings.
 * Derived from GROUP_PERMISSIONS so it stays in sync automatically.
 */
export const GROUP_PERMISSION_VALUES = Object.values(GROUP_PERMISSIONS);

/**
 * Check whether a permission string is valid.
 * @param {string} permission
 * @returns {boolean}
 */
export function isValidGroupPermission(permission) {
  return GROUP_PERMISSION_VALUES.includes(permission);
}

/**
 * Check whether a manager's permission array includes a specific permission.
 * @param {string[]} managerPermissions
 * @param {string} required
 * @returns {boolean}
 */
export function hasGroupPermission(managerPermissions, required) {
  if (!Array.isArray(managerPermissions)) return false;
  return managerPermissions.includes(required);
}
