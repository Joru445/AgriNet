import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { app } from "./config";

/**
 * Initialize Firestore with offline persistence.
 *
 * - persistentLocalCache: enables IndexedDB-based offline persistence
 * - persistentMultipleTabManager: allows multiple tabs to share the cache
 *
 * Firebase v12.x handles sync automatically when connectivity resumes.
 * Offline writes are queued and committed when the device reconnects.
 */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
