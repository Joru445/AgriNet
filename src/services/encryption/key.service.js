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
      };
    }
  }

  return null;
}

/**
 * Ensure the current user has a local key pair and publishes the public key.
 * Called on app init after authentication.
 *
 * @param {string} uid
 * @param {string} [role]
 * @returns {Promise<boolean>} - true if keys are ready, false if generation failed
 */
export async function ensureKeyPair(uid, role) {
  try {
    const existing = await hasLocalKeyPair(uid);
    if (existing) {
      // Ensure public key is published (in case it was missed)
      const localPub = await getLocalPublicKey(uid);
      if (localPub) {
        await publishPublicKey(uid, localPub, role);
      }
      return true;
    }

    const { publicKeyJwk } = await generateAndStoreKeyPair(uid);
    await publishPublicKey(uid, publicKeyJwk, role);
    return true;
  } catch (error) {
    console.error("[E2E] Failed to ensure key pair:", error);
    return false;
  }
}
