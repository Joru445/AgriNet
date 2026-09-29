import { useEffect, useState } from "react";
import { getUserProfile } from "../../../services/user.service";

/**
 * Fetches a user by ID and renders their identity (avatar + name + username).
 * Used in group management where membership/manager records only contain userId.
 */
export default function UserRow({ userId, className = "" }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function load() {
      try {
        const data = await getUserProfile(userId);
        if (!cancelled && data) {
          setUser(data);
        }
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

  const displayName = user.fullname || user.displayName || user.fullName || user.username || "User";
  const initial = (displayName || "?")[0].toUpperCase();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={displayName}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-xs font-bold text-[#2D6A4F] dark:text-(--agri-brand)">
          {initial}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-(--agri-text)">
            {displayName}
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
