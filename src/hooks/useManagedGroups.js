import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getMyManagedGroups } from "../services/group.service";

/**
 * Fetches the authenticated user's managed groups.
 * Returns { managedGroups, loading, hasManagedGroups, reload }.
 * Only fetches if the user is authenticated.
 */
export default function useManagedGroups() {
  const { user } = useAuth();
  const [managedGroups, setManagedGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setManagedGroups([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await getMyManagedGroups();
        if (!cancelled) {
          setManagedGroups(data);
        }
      } catch {
        if (!cancelled) {
          setManagedGroups([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  function reload() {
    if (!user) return;
    setLoading(true);
    getMyManagedGroups()
      .then((data) => setManagedGroups(data))
      .catch(() => setManagedGroups([]))
      .finally(() => setLoading(false));
  }

  return {
    managedGroups,
    loading,
    hasManagedGroups: managedGroups.length > 0,
    reload,
  };
}
