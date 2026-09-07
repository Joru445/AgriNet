/**
 * Low-level Web Crypto API wrapper for AgriNet E2E encryption.
 *
 * Provides:
 *  - ECDH key pair generation (P-256)
 *  - AES-GCM encrypt/decrypt
 *  - HKDF key derivation
 *  - Base64url encoding/decoding for storage & transport
 *
 * All operations use browser-native Web Crypto primitives.
 * No third-party libraries.
 */

const AES_KEY_LENGTH = 256;
const AES_IV_LENGTH = 12;
const HKDF_INFO = new TextEncoder().encode("AgriNet E2E v1");

// ============================================================
// BASE64URL HELPERS
// ============================================================

export function bufferToBase64url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64urlToBuffer(base64url) {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================================
// ECDH KEY PAIR GENERATION
// ============================================================

/**
 * Generate an ECDH P-256 key pair for a user.
 *
 * Returns { privateKey: CryptoKey, publicKey: CryptoKey }
 * The private key is non-extractable (cannot be exported).
 * The public key is extractable (can be stored in Firestore).
 */
export async function generateECDHKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey", "deriveBits"],
  );
  return keyPair;
}

// ============================================================
// HKDF KEY DERIVATION
// ============================================================

/**
 * Derive an AES-GCM key from an ECDH shared secret using HKDF.
 *
 * @param {CryptoKey} privateKey - The local user's ECDH private key
 * @param {CryptoKey} publicKey - The remote user's ECDH public key
 * @param {Uint8Array} salt - Unique salt per conversation (e.g., sorted participant UIDs)
 * @returns {Promise<CryptoKey>} - AES-GCM key for encrypt/decrypt
 */
export async function deriveSharedSecret(privateKey, publicKey, salt) {
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: publicKey },
    privateKey,
    AES_KEY_LENGTH,
  );

  const hkdfKey = await crypto.subtle.importKey(
    "raw",
    sharedBits,
    { name: "HKDF" },
    false,
    ["deriveKey"],
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt,
      info: HKDF_INFO,
    },
    hkdfKey,
    { name: "AES-GCM", length: AES_KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  );

  return aesKey;
}

// ============================================================
// AES-GCM ENCRYPT / DECRYPT
// ============================================================

/**
 * Encrypt plaintext with AES-GCM.
 *
 * @param {string} plaintext - The text to encrypt
 * @param {CryptoKey} key - AES-GCM key
 * @returns {Promise<{ ciphertext: string, iv: string }>}
 *   ciphertext and iv as base64url strings
 */
export async function encrypt(plaintext, key) {
  const iv = crypto.getRandomValues(new Uint8Array(AES_IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded,
  );

  return {
    ciphertext: bufferToBase64url(ciphertextBuffer),
    iv: bufferToBase64url(iv),
  };
}

/**
 * Decrypt ciphertext with AES-GCM.
 *
 * @param {string} ciphertext - Base64url encoded ciphertext
 * @param {string} iv - Base64url encoded IV
 * @param {CryptoKey} key - AES-GCM key
 * @returns {Promise<string>} - Decrypted plaintext
 */
export async function decrypt(ciphertext, iv, key) {
  const ciphertextBuffer = base64urlToBuffer(ciphertext);
  const ivBuffer = base64urlToBuffer(iv);

  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuffer) },
    key,
    ciphertextBuffer,
  );

  return new TextDecoder().decode(plaintextBuffer);
}

// ============================================================
// PUBLIC KEY EXPORT / IMPORT
// ============================================================

/**
 * Export a public CryptoKey to JWK format for Firestore storage.
 */
export async function exportPublicKey(publicKey) {
  const jwk = await crypto.subtle.exportKey("jwk", publicKey);
  return JSON.stringify(jwk);
}

/**
 * Import a JWK public key string back to a CryptoKey.
 */
export async function importPublicKey(jwkString) {
  const jwk = JSON.parse(jwkString);
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );
}

// ============================================================
// SALT GENERATION
// ============================================================

/**
 * Generate a deterministic salt for a conversation from participant UIDs.
 * Both participants will derive the same salt.
 */
export function generateConversationSalt(participantUids) {
  const sorted = [...participantUids].sort();
  return new TextEncoder().encode(`agrinet-e2e-v1:${sorted.join(":")}`);
}
