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

// ============================================================
// PUBLIC KEY FINGERPRINTING (SAFE DIAGNOSTICS)
// ============================================================

/**
 * Generate a SHA-256 fingerprint of a public JWK.
 * Canonicalizes { crv, kty, x, y } to guarantee identical hashes
 * regardless of key ordering or whitespace.
 *
 * Safe for logging — reveals zero private key or secret data.
 *
 * @param {string|object} jwkOrString - JWK JSON string or object
 * @returns {Promise<string|null>} - Hex fingerprint (e.g., "sha256:abcd1234...")
 */
export async function computePublicKeyFingerprint(jwkOrString) {
  if (!jwkOrString) return null;
  try {
    const jwk = typeof jwkOrString === "string" ? JSON.parse(jwkOrString) : jwkOrString;
    if (!jwk || !jwk.x || !jwk.y) return null;
    const canonical = JSON.stringify({
      crv: jwk.crv || "P-256",
      kty: jwk.kty || "EC",
      x: jwk.x,
      y: jwk.y,
    });
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(canonical),
    );
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `sha256:${hashHex.slice(0, 16)}`;
  } catch {
    return null;
  }
}

// ============================================================
// DEVELOPMENT ECDH DIAGNOSTIC / SELF-TEST
// ============================================================

/**
 * Verify ECDH invariant and two-way encryption/decryption in dev environment.
 * Generates ephemeral key pairs for User A and User B:
 * - A.private + B.public
 * - B.private + A.public
 * Proves that both derive identical AES-GCM keys.
 * Never logs raw keys or secrets.
 *
 * @returns {Promise<{ success: boolean, report: object }>}
 */
export async function runE2ESelfTest() {
  try {
    const userA_id = "test_user_A";
    const userB_id = "test_user_B";

    // 1. Generate key pairs
    const pairA = await generateECDHKeyPair();
    const pairB = await generateECDHKeyPair();

    // 2. Export & fingerprint public keys
    const jwkA = await exportPublicKey(pairA.publicKey);
    const jwkB = await exportPublicKey(pairB.publicKey);
    const fpA = await computePublicKeyFingerprint(jwkA);
    const fpB = await computePublicKeyFingerprint(jwkB);

    // 3. Derive keys on both sides
    const saltA = generateConversationSalt([userA_id, userB_id]);
    const saltB = generateConversationSalt([userB_id, userA_id]);

    const keyDerivedByA = await deriveSharedSecret(pairA.privateKey, pairB.publicKey, saltA);
    const keyDerivedByB = await deriveSharedSecret(pairB.privateKey, pairA.publicKey, saltB);

    // 4. Test A -> B: encrypt with A's derived key, decrypt with B's derived key
    const testMsgA = "AgriNet E2E test message: A to B";
    const encryptedByA = await encrypt(testMsgA, keyDerivedByA);
    const decryptedByB = await decrypt(encryptedByA.ciphertext, encryptedByA.iv, keyDerivedByB);

    // 5. Test B -> A: encrypt with B's derived key, decrypt with A's derived key
    const testMsgB = "AgriNet E2E test message: B to A";
    const encryptedByB = await encrypt(testMsgB, keyDerivedByB);
    const decryptedByA = await decrypt(encryptedByB.ciphertext, encryptedByB.iv, keyDerivedByA);

    // 6. Safe key equivalence check:
    // Encrypt identical known fixed block with zero IV using both keys and verify identical ciphertext
    const fixedBlock = new TextEncoder().encode("AgriNet:SharedKeyEquivalenceVerificationBlock");
    const zeroIv = new Uint8Array(AES_IV_LENGTH);
    const ctA = await crypto.subtle.encrypt({ name: "AES-GCM", iv: zeroIv }, keyDerivedByA, fixedBlock);
    const ctB = await crypto.subtle.encrypt({ name: "AES-GCM", iv: zeroIv }, keyDerivedByB, fixedBlock);
    const hashA = await crypto.subtle.digest("SHA-256", ctA);
    const hashB = await crypto.subtle.digest("SHA-256", ctB);
    const keyFpA = Array.from(new Uint8Array(hashA)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
    const keyFpB = Array.from(new Uint8Array(hashB)).map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);

    const keysEquivalent = keyFpA === keyFpB;
    const aToBWorks = decryptedByB === testMsgA;
    const bToAWorks = decryptedByA === testMsgB;
    const success = keysEquivalent && aToBWorks && bToAWorks;

    const report = {
      success,
      keysEquivalent,
      aToBWorks,
      bToAWorks,
      userAPublicKeyFingerprint: fpA,
      userBPublicKeyFingerprint: fpB,
      derivedKeyFingerprintA: `sha256:${keyFpA}`,
      derivedKeyFingerprintB: `sha256:${keyFpB}`,
      saltsMatch: bufferToBase64url(saltA) === bufferToBase64url(saltB),
    };

    if (success) {
      console.log("[E2E Self-Test] PASSED: ECDH P-256 + HKDF-SHA256 + AES-256-GCM invariant holds.", report);
    } else {
      console.error("[E2E Self-Test] FAILED:", report);
    }

    return { success, report };
  } catch (error) {
    console.error("[E2E Self-Test] ERROR during self-test:", error);
    return { success: false, error: error.message };
  }
}

if (typeof window !== "undefined") {
  window.__AGRINET_E2E_SELF_TEST__ = runE2ESelfTest;
}
