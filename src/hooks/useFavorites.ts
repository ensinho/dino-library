import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrCreateProfile, mergeFavorites, setFavorite } from '@/services/profileService';

/**
 * Favourite species.
 *
 * Guests keep favourites in localStorage. On sign-in the local list is merged
 * into the Firestore profile once, and from then on writes go to both, so the
 * UI updates instantly and the list follows the user across devices.
 */

const STORAGE_KEY = 'dino-library:favorites';
const listeners = new Set<() => void>();
let favorites: string[] = read();

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(next: string[]) {
  favorites = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode / quota — in-memory state still works for this session.
  }
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

let syncedUid: string | null = null;

export function useFavorites() {
  const { user } = useAuth();
  const ids = useSyncExternalStore(subscribe, () => favorites);

  // One-time reconciliation per signed-in user.
  useEffect(() => {
    if (!user) {
      syncedUid = null;
      return;
    }
    if (syncedUid === user.uid) return;
    syncedUid = user.uid;
    const local = favorites;
    getOrCreateProfile(user.uid)
      .then(async (profile) => {
        const remote = profile.favorites ?? [];
        const missing = local.filter((id) => !remote.includes(id));
        await mergeFavorites(user.uid, missing);
        write(Array.from(new Set([...remote, ...favorites])));
      })
      .catch((e) => console.warn('Favorites sync failed:', e));
  }, [user]);

  const toggle = useCallback(
    (id: string) => {
      const isFav = favorites.includes(id);
      write(isFav ? favorites.filter((x) => x !== id) : [...favorites, id]);
      if (user) setFavorite(user.uid, id, !isFav).catch((e) => console.warn('Favorite save failed:', e));
      return !isFav;
    },
    [user],
  );

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, isFavorite, toggle };
}
