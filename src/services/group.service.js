// ============================================================
// Groups API Service
// ============================================================
//
// Frontend service for the Groups API.
// Uses the centralized apiRequest client for all HTTP calls.
//
// Follows the project's service conventions:
// - apiRequest handles auth tokens, retries, timeouts
// - Responses are normalized: { success, data } → data.data
// - Errors preserve status codes and backend messages
// ============================================================

import { apiRequest } from "./api/api.client";

const GROUPS_BASE = "/v1/groups";

// ============================================================
// GROUP CRUD
// ============================================================

/**
 * List all active groups.
 * @returns {Promise<Array>} Array of group objects
 */
export async function getGroups() {
  const data = await apiRequest(`${GROUPS_BASE}?active=true`);
  return data.data ?? [];
}

/**
 * Get a single group by ID.
 * @param {string} groupId
 * @returns {Promise<Object|null>} Group object or null
 */
export async function getGroup(groupId) {
  const data = await apiRequest(`${GROUPS_BASE}/${encodeURIComponent(groupId)}`);
  return data.data ?? null;
}

/**
 * Create a new group (admin only).
 * @param {Object} groupData - { name, description?, imageUrl? }
 * @returns {Promise<Object>} Created group
 */
export async function createGroup(groupData) {
  const data = await apiRequest(GROUPS_BASE, {
    method: "POST",
    body: JSON.stringify(groupData),
  });
  return data.data;
}

/**
 * Update a group (admin or manager with group.edit).
 * @param {string} groupId
 * @param {Object} updates - { name?, description?, imageUrl?, active? }
 * @returns {Promise<Object>} Updated group
 */
export async function updateGroup(groupId, updates) {
  const data = await apiRequest(`${GROUPS_BASE}/${encodeURIComponent(groupId)}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return data.data;
}

/**
 * Delete a group (admin only).
 * @param {string} groupId
 * @returns {Promise<boolean>}
 */
export async function deleteGroup(groupId) {
  await apiRequest(`${GROUPS_BASE}/${encodeURIComponent(groupId)}`, {
    method: "DELETE",
  });
  return true;
}

// ============================================================
// MEMBERSHIP — AUTHENTICATED USER (/me)
// ============================================================

/**
 * Apply to join a group.
 * Backend derives applicant from the authenticated token.
 * @param {string} groupId
 * @returns {Promise<Object>} Membership object
 */
export async function applyToGroup(groupId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/apply`,
    { method: "POST" },
  );
  return data.data;
}

/**
 * Get the authenticated user's memberships across all groups.
 * @returns {Promise<Array>} Array of membership objects
 */
export async function getMyMemberships() {
  const data = await apiRequest(`${GROUPS_BASE}/me/memberships`);
  return data.data ?? [];
}

/**
 * Get the authenticated user's membership for a specific group.
 * @param {string} groupId
 * @returns {Promise<Object|null>} Membership object or null
 */
export async function getMyMembership(groupId) {
  const memberships = await getMyMemberships();
  return memberships.find((m) => m.groupId === groupId) ?? null;
}

// ============================================================
// MEMBERSHIP — ADMIN/MANAGER
// ============================================================

/**
 * Get a specific membership for a group member.
 * Requires members.view permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getMembership(groupId, userId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}`,
  );
  return data.data ?? null;
}

/**
 * Get approved members of a group.
 * Requires members.view permission.
 * @param {string} groupId
 * @returns {Promise<Array>}
 */
export async function getGroupMembers(groupId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships`,
  );
  return data.data ?? [];
}

/**
 * Get pending applications for a group.
 * Requires applications.view permission.
 * @param {string} groupId
 * @returns {Promise<Array>}
 */
export async function getGroupApplications(groupId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/applications`,
  );
  return data.data ?? [];
}

/**
 * Approve a membership application.
 * Requires applications.approve permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Updated membership
 */
export async function approveApplication(groupId, userId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}/approve`,
    { method: "POST" },
  );
  return data.data;
}

/**
 * Reject a membership application.
 * Requires applications.reject permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Updated membership
 */
export async function rejectApplication(groupId, userId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}/reject`,
    { method: "POST" },
  );
  return data.data;
}

/**
 * Remove a member from a group.
 * Requires members.remove permission.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Updated membership
 */
export async function removeGroupMember(groupId, userId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/memberships/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
  return data.data;
}

/**
 * Get the count of approved members in a group.
 * @param {string} groupId
 * @returns {Promise<number>}
 */
export async function getGroupMemberCount(groupId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/member-count`,
  );
  return data.data?.count ?? 0;
}

// ============================================================
// USER GROUPS — PUBLIC DISPLAY
// ============================================================

/**
 * Get a user's approved group memberships enriched with group info.
 * Used for profile display.
 * @param {string} userId
 * @returns {Promise<Array>} Array of { groupId, groupName, groupImageUrl, appliedAt }
 */
export async function getUserApprovedGroups(userId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/user/${encodeURIComponent(userId)}/approved-groups`,
  );
  return data.data ?? [];
}

// ============================================================
// MANAGER — AUTHENTICATED USER (/me)
// ============================================================

/**
 * Get the authenticated user's managed groups.
 * @returns {Promise<Array>} Array of manager objects
 */
export async function getMyManagedGroups() {
  const data = await apiRequest(`${GROUPS_BASE}/me/managed`);
  return data.data ?? [];
}

// ============================================================
// MANAGER — ADMIN
// ============================================================

/**
 * Get all active managers for a group.
 * Requires group manager status.
 * @param {string} groupId
 * @returns {Promise<Array>}
 */
export async function getGroupManagers(groupId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers`,
  );
  return data.data ?? [];
}

/**
 * Get a specific manager record.
 * Requires group manager status.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getGroupManager(groupId, userId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers/${encodeURIComponent(userId)}`,
  );
  return data.data ?? null;
}

/**
 * Assign a user as manager of a group (admin only).
 * @param {string} groupId
 * @param {string} userId
 * @param {string[]} permissions
 * @returns {Promise<Object>} Manager record
 */
export async function assignGroupManager(groupId, userId, permissions) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers`,
    {
      method: "POST",
      body: JSON.stringify({ userId, permissions }),
    },
  );
  return data.data;
}

/**
 * Update a manager's permissions (admin only).
 * @param {string} groupId
 * @param {string} userId
 * @param {string[]} permissions
 * @returns {Promise<Object>} Updated manager record
 */
export async function updateManagerPermissions(groupId, userId, permissions) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers/${encodeURIComponent(userId)}/permissions`,
    {
      method: "PATCH",
      body: JSON.stringify({ permissions }),
    },
  );
  return data.data;
}

/**
 * Remove a manager from a group (admin only).
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} Deactivated manager record
 */
export async function removeGroupManager(groupId, userId) {
  const data = await apiRequest(
    `${GROUPS_BASE}/${encodeURIComponent(groupId)}/managers/${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );
  return data.data;
}
