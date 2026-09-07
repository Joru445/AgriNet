import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { useAuth } from "./AuthContext";
import {
  getFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../services/favorite.service";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    let cancelled = false;

    setLoading(true);

    getFavoriteIds()
      .then((ids) => {
        if (!cancelled) {
          setFavoriteIds(new Set(ids));
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
      const wasFavorited = favoriteIds.has(id);

      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });

      try {
        if (wasFavorited) {
          await removeFavorite(type, targetId);
        } else {
          await addFavorite(type, targetId);
        }
        return !wasFavorited;
      } catch {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorited) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
        return null;
      }
    },
    [user, favoriteIds],
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

// eslint-disable-next-line react-refresh/only-export-components
export const useFavorites = () => useContext(FavoritesContext);
