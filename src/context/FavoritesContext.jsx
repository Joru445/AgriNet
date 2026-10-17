import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

import { useAuth } from "./AuthContext";
import {
  getFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../services/favorite.service";
import {
  accountCacheKey,
  accountCacheRequest,
  getAccountCache,
  setAccountCache,
  invalidateAccountCache,
} from "../utils/accountQueryCache";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const favoriteIdsRef = useRef(favoriteIds);
  const favoriteOperationsRef = useRef(new Map());
  const favoriteVersionsRef = useRef(new Map());
  useEffect(() => {
    favoriteIdsRef.current = favoriteIds;
  }, [favoriteIds]);

  const updateFavoriteIds = useCallback((updater) => {
    const next = updater(new Set(favoriteIdsRef.current));
    favoriteIdsRef.current = next;
    setFavoriteIds(next);
  }, []);

  useEffect(() => {
    // Always clear stale data when the effect re-runs (user change or mount).
    favoriteIdsRef.current = new Set();
    setFavoriteIds(new Set());
    setLoading(true);

    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const listenerUid = user.uid;

    const cacheKey = accountCacheKey(listenerUid, "favorite-ids");
    const cached = getAccountCache(cacheKey, 2 * 60 * 1000);
    if (cached) {
      favoriteIdsRef.current = new Set(cached);
      setFavoriteIds(new Set(cached));
      setLoading(false);
      return () => { cancelled = true; };
    }

    accountCacheRequest(cacheKey, () => getFavoriteIds())
      .then((ids) => {
        if (!cancelled && user?.uid === listenerUid) {
          setFavoriteIds(new Set(ids));
          setAccountCache(cacheKey, ids);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const isFavorite = useCallback(
    (type, targetId) => favoriteIds.has(`${type}_${targetId}`),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (type, targetId) => {
      if (!user) return false;

      const id = `${type}_${targetId}`;
      const wasFavorited = favoriteIdsRef.current.has(id);

      updateFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      const version = (favoriteVersionsRef.current.get(id) || 0) + 1;
      favoriteVersionsRef.current.set(id, version);
      const previous = favoriteOperationsRef.current.get(id) || Promise.resolve();
      const operation = previous.catch(() => {}).then(async () => {
        try {
          if (wasFavorited) await removeFavorite(type, targetId);
          else await addFavorite(type, targetId);
          invalidateAccountCache(accountCacheKey(user.uid, "favorite-ids"));
          window.dispatchEvent(new CustomEvent("agrinet:favorite-mutated", {
            detail: { uid: listenerSafeUid(user), type, targetId, favorited: !wasFavorited },
          }));
          return !wasFavorited;
        } catch {
          if (favoriteVersionsRef.current.get(id) === version) {
            updateFavoriteIds((current) => {
              const next = new Set(current);
              if (wasFavorited) next.add(id);
              else next.delete(id);
              return next;
            });
          }
          return null;
        }
      });
      let trackedOperation;
      trackedOperation = operation.finally(() => {
        if (favoriteOperationsRef.current.get(id) === trackedOperation) favoriteOperationsRef.current.delete(id);
      });
      favoriteOperationsRef.current.set(id, trackedOperation);
      return operation;
    },
    [user, updateFavoriteIds],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        loading,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

function listenerSafeUid(user) {
  return user?.uid || null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => useContext(FavoritesContext);
