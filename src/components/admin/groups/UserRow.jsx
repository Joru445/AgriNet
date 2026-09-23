import { useEffect, useState } from "react";
import { apiRequest } from "../../../services/api/api.client";

/**
 * Fetches a user by ID and renders their identity (avatar + name + username).
 * Used in group management where membership/manager records only contain userId.
 */
export default function UserRow({ userId, className = "" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await apiRequest(`/v1/users/${encodeURIComponent(userId)}`);
        if (!cancelled) setUser(data.data);
      } catch {
        // Silently ignore — render fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="h-8 w-8 animate-pulse rounded-full bg-(--agri-hover)" />
        <div className="space-y-1">
          <div className="h-3 w-24 animate-pulse rounded bg-(--agri-hover)" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-(--agri-hover)" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--agri-hover) text-xs font-bold text-(--agri-text-muted)">
          ?
        </div>
        <span className="text-sm text-(--agri-text-muted)">{userId}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
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
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-(--agri-text)">
            {user.fullname || "Unnamed"}
          </p>
          {user.verificationStatus === "approved" && (
            <i className="ri-verified-badge-fill text-[#2D6A4F] dark:text-(--agri-brand) text-sm shrink-0" />
          )}
        </div>
        {user.username && (
          <p className="truncate text-xs text-(--agri-text-muted)">
            @{user.username}
          </p>
        )}
      </div>
    </div>
  );
}
