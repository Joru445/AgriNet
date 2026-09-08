/**
 * User encryption key pair management.
 *
 * Generates, stores, and retrieves the user's ECDH identity key pair.
 * Private keys are stored in IndexedDB as non-extractable CryptoKey objects.
 * Public keys are published to Firestore for other participants to derive shared secrets.
 */

import { db } from "../../firebase/firestore";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  generateECDHKeyPair,
  exportPublicKey,
  computePublicKeyFingerprint,
} from "./crypto.service";

const DB_NAME = "agrinet-e2e-keys";
const DB_VERSION = 1;
const STORE_NAME = "identity-keys";
const PUBLIC_KEY_FIELD = "encryptionPublicKey";
const PUBLIC_KEY_VERSION_FIELD = "encryptionKeyVersion";
const CURRENT_KEY_VERSION = 1;

// ============================================================
// INDEXEDDB HELPERS
// ============================================================

function openKeyDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet(uid) {
  const db = await openKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(uid);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(uid, value) {
  const db = await openKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(value, uid);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================================
// KEY GENERATION & STORAGE
// ============================================================

/**
 * Generate a new ECDH key pair and store it locally.
 * The public key is NOT uploaded to Firestore here — call publishPublicKey() separately.
 *
 * @param {string} uid - The authenticated user's UID
 * @returns {Promise<{ publicKeyJwk: string }>}
 */
export async function generateAndStoreKeyPair(uid) {
  const keyPair = await generateECDHKeyPair();

  const publicKeyJwk = await exportPublicKey(keyPair.publicKey);

  // Store private key in IndexedDB (non-extractable CryptoKey)
  await idbSet(uid, {
    privateKey: keyPair.privateKey,
    publicKeyJwk,
    createdAt: Date.now(),
  });

  return { publicKeyJwk };
}

/**
 * Retrieve the user's private key from IndexedDB.
 * Returns null if no key exists (new device / first login).
 *
 * @param {string} uid
 * @returns {Promise<CryptoKey|null>}
 */
export async function getPrivateKey(uid) {
  const stored = await idbGet(uid);
  return stored?.privateKey || null;
}

/**
 * Retrieve the user's public key JWK from IndexedDB.
 *
 * @param {string} uid
 * @returns {Promise<string|null>}
 */
export async function getLocalPublicKey(uid) {
  const stored = await idbGet(uid);
  return stored?.publicKeyJwk || null;
}

/**
 * Check if the user has a local key pair.
 *
 * @param {string} uid
 * @returns {Promise<boolean>}
 */
export async function hasLocalKeyPair(uid) {
  const stored = await idbGet(uid);
  return Boolean(stored?.privateKey);
}

// ============================================================
// PUBLIC KEY PUBLISHING (FIRESTORE)
// ============================================================

/**
 * Publish the user's public key to Firestore.
 * Stored at users/{uid} and farmers/{uid} if applicable.
 *
 * @param {string} uid
 * @param {string} publicKeyJwk - JWK-formatted public key
 * @param {string} [role] - User role (consumer/farmer)
 */
export async function publishPublicKey(uid, publicKeyJwk, role) {
  const updateData = {
    [PUBLIC_KEY_FIELD]: publicKeyJwk,
    [PUBLIC_KEY_VERSION_FIELD]: CURRENT_KEY_VERSION,
  };

  // Update users/{uid}
  await setDoc(doc(db, "users", uid), updateData, { merge: true });

  // Also update farmers/{uid} if the user is a farmer
  if (role === "farmer") {
    await setDoc(doc(db, "farmers", uid), updateData, { merge: true });
  }
}

/**
 * Fetch a remote user's public key from Firestore.
 *
 * @param {string} uid - The remote user's UID
 * @returns {Promise<{ publicKeyJwk: string, keyVersion: number }|null>}
 */
export async function fetchPublicKey(uid) {
  // Try users/{uid} first
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    if (data[PUBLIC_KEY_FIELD]) {
      return {
        publicKeyJwk: data[PUBLIC_KEY_FIELD],
        keyVersion: data[PUBLIC_KEY_VERSION_FIELD] || 1,
        source: "users",
      };
    }
  }

  // Try farmers/{uid} as fallback
  const farmerDoc = await getDoc(doc(db, "farmers", uid));
  if (farmerDoc.exists()) {
    const data = farmerDoc.data();
    if (data[PUBLIC_KEY_FIELD]) {
      return {
        publicKeyJwk: data[PUBLIC_KEY_FIELD],
        keyVersion: data[PUBLIC_KEY_VERSION_FIELD] || 1,
        source: "farmers",
      };
    }
  }

  return null;
}

/**
 * Ensure the current user has a local key pair and publishes the public key.
 * Called on app init after authentication.
 *
 * CRITICAL E2E RULES:
 * 1. If local key exists:
 *    - Check Firestore public key.
 *    - If fingerprints match: healthy, do nothing.
 *    - If Firestore key is missing: publish local public key.
 *    - If fingerprints differ: DO NOT silently overwrite! Report key mismatch.
 * 2. If local key does NOT exist:
 *    - Check Firestore public key.
 *    - If Firestore already has a key: DO NOT overwrite (multi-device limitation).
 *    - If Firestore has no key: first-time setup; generate and publish.
 *
 * @param {string} uid
 * @param {string} [role]
 * @returns {Promise<boolean>} - true if keys are ready, false if generation/sync failed
 */
export async function ensureKeyPair(uid, role) {
  try {
    const existing = await hasLocalKeyPair(uid);

    if (existing) {
      const localPub = await getLocalPublicKey(uid);
      const localFp = await computePublicKeyFingerprint(localPub);
      const remoteData = await fetchPublicKey(uid);

      if (!remoteData?.publicKeyJwk) {
        // Firestore is missing public key — publish local key
        console.log("[E2E] Publishing missing public key to Firestore:", {
          currentUid: uid,
          localPublicKeyFingerprint: localFp,
          keyVersion: CURRENT_KEY_VERSION,
        });
        await publishPublicKey(uid, localPub, role);
        return true;
      }

      const firestoreFp = await computePublicKeyFingerprint(remoteData.publicKeyJwk);

      if (localFp && firestoreFp && localFp === firestoreFp) {
        // Key is healthy and verified — do not touch Firestore
        console.log("[E2E] Identity key pair healthy and verified:", {
          currentUid: uid,
          localPublicKeyFingerprint: localFp,
          firestorePublicKeyFingerprint: firestoreFp,
          lookupSource: remoteData.source,
          keyVersion: remoteData.keyVersion,
        });
        return true;
      }

      // Fingerprints differ: DO NOT silently overwrite!
      console.warn(
        "[E2E] PUBLIC KEY MISMATCH: Local public key does not match Firestore public key. " +
        "Preserving existing local key and Firestore key to avoid silent overwrite.",
        {
          currentUid: uid,
          localPublicKeyFingerprint: localFp,
          firestorePublicKeyFingerprint: firestoreFp,
          lookupSource: remoteData.source,
          keyVersion: remoteData.keyVersion,
        },
      );
      return false;
    }

    // Local key does NOT exist on this browser/device
    const remoteData = await fetchPublicKey(uid);
    if (remoteData?.publicKeyJwk) {
      // User has an existing public key on another device/browser
      const firestoreFp = await computePublicKeyFingerprint(remoteData.publicKeyJwk);
      console.warn(
        "[E2E] MULTI-DEVICE LIMITATION: User already has an encryption identity in Firestore, " +
        "but this browser does not have the corresponding private key. " +
        "Preventing silent key replacement to protect existing conversations.",
        {
          currentUid: uid,
          firestorePublicKeyFingerprint: firestoreFp,
          lookupSource: remoteData.source,
          keyVersion: remoteData.keyVersion,
        },
      );
      return false;
    }

    // First-time setup for user with no key anywhere
    console.log("[E2E] Generating initial identity key pair for user:", { currentUid: uid });
    const { publicKeyJwk } = await generateAndStoreKeyPair(uid);
    const newFp = await computePublicKeyFingerprint(publicKeyJwk);
    await publishPublicKey(uid, publicKeyJwk, role);
    console.log("[E2E] Generated and published initial identity public key:", {
      currentUid: uid,
      localPublicKeyFingerprint: newFp,
      firestorePublicKeyFingerprint: newFp,
      keyVersion: CURRENT_KEY_VERSION,
    });
    return true;
  } catch (error) {
    console.error("[E2E] Failed to ensure key pair:", error);
    return false;
  }
}
