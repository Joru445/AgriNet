/**
 * AgriNet E2E Encryption — barrel export.
 *
 * Re-exports all encryption services for convenient importing.
 */

export {
  encrypt,
  decrypt,
  bufferToBase64url,
  base64urlToBuffer,
  exportPublicKey,
  importPublicKey,
  generateConversationSalt,
  computePublicKeyFingerprint,
  runE2ESelfTest,
} from "./crypto.service";

export {
  ensureKeyPair,
  getPrivateKey,
  getLocalPublicKey,
  hasLocalKeyPair,
  fetchPublicKey,
  publishPublicKey,
  generateAndStoreKeyPair,
} from "./key.service";

export {
  getConversationKey,
  deriveConversationKey,
  cacheConversationKey,
  clearConversationKeyCache,
  isConversationKeyCached,
} from "./conversation-key.service";
