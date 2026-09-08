/**
 * Conversation-level shared key derivation and caching.
 *
 * Each two-party conversation has a unique AES-GCM key derived via ECDH
 * from both participants' key pairs. The shared key is cached in memory
 * (never persisted) and validated against the remote public key's fingerprint.
 */

import {
  deriveSharedSecret,
  importPublicKey,
  generateConversationSalt,
  computePublicKeyFingerprint,
} from "./crypto.service";
import { getPrivateKey, fetchPublicKey } from "./key.service";

// In-memory cache: conversationId → { key: CryptoKey, remoteUid: string, remotePublicKeyFingerprint: string }
const conversationKeyCache = new Map();

// ============================================================
// CACHE MANAGEMENT
// ============================================================

/**
 * Clear all cached conversation keys.
 * Called on logout.
 */
export function clearConversationKeyCache() {
  conversationKeyCache.clear();
}

/**
 * Check if a conversation key is cached and optionally matches the expected remote UID.
 */
export function isConversationKeyCached(conversationId, otherUid = null, remoteFp = null) {
  if (!conversationKeyCache.has(conversationId)) return false;
  if (!otherUid) return true;
  const cached = conversationKeyCache.get(conversationId);
  if (!cached) return false;
  if (cached.remoteUid !== otherUid) return false;
  if (remoteFp && cached.remotePublicKeyFingerprint !== remoteFp) return false;
  return true;
}

// ============================================================
// KEY DERIVATION
// ============================================================

/**
 * Derive or retrieve the shared AES-GCM key for a conversation.
 *
 * The key is derived using ECDH between the local user's private key
 * and the remote user's public key from Firestore.
 *
 * Checks cached metadata (remoteUid, remotePublicKeyFingerprint) and only
 * reuses the cached key if the remote public key fingerprint is unchanged.
 *
 * @param {string} myUid - The authenticated local user's UID (holds private key)
 * @param {string} otherUid - The remote participant's UID (holds public key)
 * @param {string} [conversationId] - The conversation document ID
 * @returns {Promise<CryptoKey>} - AES-GCM key for encrypt/decrypt
 */
export async function getConversationKey(myUid, otherUid, conversationId = null) {
  if (!myUid) {
    throw new Error("Cannot derive conversation key: missing local user ID.");
  }
  if (!otherUid) {
    throw new Error("Cannot derive conversation key: missing remote user ID.");
  }
  if (myUid === otherUid) {
    throw new Error("Cannot derive conversation key: local user and remote user cannot be identical.");
  }

  // 1. Fetch remote user's public key from Firestore
  const remoteKeyData = await fetchPublicKey(otherUid);
  if (!remoteKeyData?.publicKeyJwk) {
    throw new Error("Recipient has no encryption key in Firestore.");
  }

  // 2. Fingerprint the remote public key
  const remotePublicKeyFingerprint = await computePublicKeyFingerprint(remoteKeyData.publicKeyJwk);

  // 3. Check cached metadata for this conversation
  if (conversationId && conversationKeyCache.has(conversationId)) {
    const cached = conversationKeyCache.get(conversationId);
    if (
      cached &&
      cached.remoteUid === otherUid &&
      cached.remotePublicKeyFingerprint === remotePublicKeyFingerprint
    ) {
      return cached.key;
    }
  }

  // 4. Retrieve local private key
  const privateKey = await getPrivateKey(myUid);
  if (!privateKey) {
    throw new Error("No local encryption private key found for current user.");
  }

  // 5. Import remote public key
  const remotePublicKey = await importPublicKey(remoteKeyData.publicKeyJwk);

  // 6. Generate deterministic salt from sorted participant UIDs
  const salt = generateConversationSalt([myUid, otherUid]);

  // 7. Derive shared AES-GCM key
  const sharedKey = await deriveSharedSecret(privateKey, remotePublicKey, salt);

  // 8. Cache with remote identity metadata
  if (conversationId) {
    conversationKeyCache.set(conversationId, {
      key: sharedKey,
      remoteUid,
      remotePublicKeyFingerprint,
    });
  }

  return sharedKey;
}

/**
 * Derive a conversation key when the conversation ID is not yet known
 * (e.g., before conversation creation).
 *
 * @param {string} myUid
 * @param {string} otherUid
 * @returns {Promise<CryptoKey>}
 */
export async function deriveConversationKey(myUid, otherUid) {
  return getConversationKey(myUid, otherUid, null);
}

/**
 * Pre-cache a conversation key (used after deriving for a new conversation).
 */
export function cacheConversationKey(conversationId, key, remoteUid = null, remotePublicKeyFingerprint = null) {
  conversationKeyCache.set(conversationId, {
    key,
    remoteUid: remoteUid || null,
    remotePublicKeyFingerprint: remotePublicKeyFingerprint || null,
  });
}
