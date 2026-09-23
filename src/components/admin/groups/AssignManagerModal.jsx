import { useEffect, useState } from "react";

import ResponsiveModal from "../../ui/ResponsiveModal";
import Button from "../../ui/Button";
import SkeletonBox from "../../ui/SkeletonBox";

import { useLanguage } from "../../../context/LanguageContext";
import { GROUP_PERMISSION_VALUES } from "../../../constants/groupPermissions";
import { assignGroupManager } from "../../../services/group.service";
import { searchUsers } from "../../../services/user.service";
import { showToast } from "../../../utils/toast";

export default function AssignManagerModal({
  groupId,
  open,
  onClose,
  onAssigned,
  existingManagerIds = [],
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([
    ...GROUP_PERMISSION_VALUES,
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery("");
      setUsers([]);
      setSearchError("");
      setHasSearched(false);
      setSelectedUser(null);
      setSelectedPermissions([...GROUP_PERMISSION_VALUES]);
    }
  }, [open]);

  useEffect(() => {
    const keyword = query.trim();

    if (!open || !keyword) {
      setUsers([]);
      setSearchError("");
      setHasSearched(false);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setUsers([]);
    setSearchError("");
    setHasSearched(false);
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchUsers(keyword, { includeSelf: true });
        if (!cancelled) {
          setUsers(results);
          setHasSearched(true);
        }
      } catch (error) {
        if (!cancelled) {
          setUsers([]);
          setSearchError(error?.message || "Failed to search users.");
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query]);

  function togglePermission(perm) {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  }

  async function handleAssign() {
    if (!selectedUser) return;
    try {
      setLoading(true);
      await assignGroupManager(groupId, selectedUser.uid, selectedPermissions);
      showToast.success(t("adminGroups.managers.assignedSuccess"));
      onAssigned();
      onClose();
    } catch (err) {
      showToast.error(err?.message || "Failed to assign manager.");
    } finally {
      setLoading(false);
    }
  }

  const permissionLabels = t("adminGroups.permissionLabels");

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      title={t("adminGroups.assignModal.title")}
      maxWidth="max-w-md"
    >
      <div className="mt-4 space-y-4">
        {/* Search */}
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("adminGroups.assignModal.searchPlaceholder")}
            className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-sm text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10"
            autoFocus
          />
        </div>

        {/* Search Results */}
        {searching && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <SkeletonBox key={i} className="h-12" />
            ))}
          </div>
        )}

        {!searching && users.length > 0 && !selectedUser && (
          <div className="max-h-48 overflow-y-auto rounded-xl border border-(--agri-border-subtle)">
            {users.map((user) => {
              const isExisting = existingManagerIds.includes(user.uid);
              const isSuspended = user.status === "suspended";
              const disabled = isExisting || isSuspended;
              return (
                <button
                  key={user.uid}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelectedUser(user)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                    disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-(--agri-hover)/60"
                  }`}
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.fullname}
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-xs font-bold text-[#2D6A4F] dark:text-(--agri-brand)">
                      {(user.fullname || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-(--agri-text)">
                      {user.fullname || "Unnamed"}
                    </p>
                    <p className="truncate text-xs text-(--agri-text-muted)">
                      @{user.username || user.email}
                    </p>
                  </div>
                  {isExisting && (
                    <span className="text-[10px] text-(--agri-text-muted)">
                      {t("adminGroups.assignModal.alreadyManager")}
                    </span>
                  )}
                  {isSuspended && (
                    <span className="text-[10px] text-(--agri-text-muted)">
                      {t("adminUser.suspended")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {!searching && searchError && !selectedUser && (
          <p className="text-center text-sm text-red-600 dark:text-red-400">
            {searchError}
          </p>
        )}

        {!searching && hasSearched && users.length === 0 && !selectedUser && (
          <p className="text-center text-sm text-(--agri-text-muted)">
            {t("adminGroups.assignModal.noResults")}
          </p>
        )}

        {/* Selected User */}
        {selectedUser && (
          <div className="rounded-xl border border-[#2D6A4F]/30 bg-[#D8F3DC]/50 dark:bg-(--agri-brand-bg)/50 p-3">
            <div className="flex items-center gap-3">
              {selectedUser.profilePicture ? (
                <img
                  src={selectedUser.profilePicture}
                  alt={selectedUser.fullname}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-xs font-bold text-[#2D6A4F] dark:text-(--agri-brand)">
                  {(selectedUser.fullname || "?")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-(--agri-text)">
                  {selectedUser.fullname}
                </p>
                <p className="truncate text-xs text-(--agri-text-muted)">
                  @{selectedUser.username || selectedUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-(--agri-text-muted) hover:text-(--agri-text)"
              >
                <i className="ri-close-line" />
              </button>
            </div>
          </div>
        )}

        {/* Permissions */}
        {selectedUser && (
          <div>
            <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
              {t("adminGroups.assignModal.selectPermissions")}
            </label>
            <div className="space-y-1.5">
              {GROUP_PERMISSION_VALUES.map((perm) => (
                <label
                  key={perm}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition hover:bg-(--agri-hover)/60"
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="h-4 w-4 rounded border-(--agri-border-subtle) text-[#2D6A4F] focus:ring-[#2D6A4F]/20"
                  />
                  <span className="text-sm text-(--agri-text)">
                    {permissionLabels?.[perm] || perm}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-(--agri-border-subtle)">
          <Button variant="cancel" size="sm" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleAssign}
            disabled={!selectedUser || loading}
            loading={loading}
          >
            {t("adminGroups.assignModal.assign")}
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
