/**
 * Conversation-level shared key derivation and caching.
 *
 * Each two-party conversation has a unique AES-GCM key derived via ECDH
 * from both participants' key pairs. The shared key is cached in memory
 * (never persisted) and derived fresh on each page load.
 */

import { deriveSharedSecret, importPublicKey, generateConversationSalt } from "./crypto.service";
import { getPrivateKey, fetchPublicKey } from "./key.service";

// In-memory cache: conversationId → CryptoKey
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
 * Check if a conversation key is cached.
 */
export function isConversationKeyCached(conversationId) {
  return conversationKeyCache.has(conversationId);
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
 * @param {string} myUid - The authenticated user's UID
 * @param {string} otherUid - The other participant's UID
 * @param {string} conversationId - The conversation document ID
 * @returns {Promise<CryptoKey>} - AES-GCM key for encrypt/decrypt
 */
export async function getConversationKey(myUid, otherUid, conversationId) {
  // Check cache first
  if (conversationKeyCache.has(conversationId)) {
    return conversationKeyCache.get(conversationId);
  }

  // Get local private key
  const privateKey = await getPrivateKey(myUid);
  if (!privateKey) {
    throw new Error("No local encryption key. Cannot derive conversation key.");
  }

  // Fetch remote user's public key
  const remoteKeyData = await fetchPublicKey(otherUid);
  if (!remoteKeyData?.publicKeyJwk) {
    throw new Error("Recipient has no encryption key. Cannot send encrypted message.");
  }

  const remotePublicKey = await importPublicKey(remoteKeyData.publicKeyJwk);

  // Generate deterministic salt from participant UIDs
  const salt = generateConversationSalt([myUid, otherUid]);

  // Derive shared AES-GCM key
  const sharedKey = await deriveSharedSecret(privateKey, remotePublicKey, salt);

  // Cache for subsequent calls
  conversationKeyCache.set(conversationId, sharedKey);

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
  const privateKey = await getPrivateKey(myUid);
  if (!privateKey) {
    throw new Error("No local encryption key.");
  }

  const remoteKeyData = await fetchPublicKey(otherUid);
  if (!remoteKeyData?.publicKeyJwk) {
    throw new Error("Recipient has no encryption key.");
  }

  const remotePublicKey = await importPublicKey(remoteKeyData.publicKeyJwk);
  const salt = generateConversationSalt([myUid, otherUid]);
  return deriveSharedSecret(privateKey, remotePublicKey, salt);
}

/**
 * Pre-cache a conversation key (used after deriving for a new conversation).
 */
export function cacheConversationKey(conversationId, key) {
  conversationKeyCache.set(conversationId, key);
}
