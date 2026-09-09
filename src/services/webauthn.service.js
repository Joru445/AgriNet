import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

import { apiRequest } from "./api/api.client.js";

/**
 * Error types for passkey authentication failures.
 */
export const PasskeyErrorType = {
  CANCELLED: "cancelled",
  NOT_FOUND: "not_found",
  WRONG_ACCOUNT: "wrong_account",
  UNSUPPORTED: "unsupported",
  NETWORK: "network",
  UNKNOWN: "unknown",
};

/**
 * Custom error class for passkey operations with structured error info.
 */
export class PasskeyError extends Error {
  constructor(type, originalError) {
    super(getPasskeyErrorMessage(type));
    this.type = type;
    this.originalError = originalError;
  }
}

function getPasskeyErrorMessage(type) {
  switch (type) {
    case PasskeyErrorType.CANCELLED:
      return "Passkey authentication was cancelled.";
    case PasskeyErrorType.NOT_FOUND:
      return "No passkey found for this account.";
    case PasskeyErrorType.WRONG_ACCOUNT:
      return "This passkey belongs to a different account.";
    case PasskeyErrorType.UNSUPPORTED:
      return "Passkeys are not supported on this device.";
    case PasskeyErrorType.NETWORK:
      return "Network error. Please try again.";
    default:
      return "Passkey authentication failed. Please try again.";
  }
}

/**
 * Classify an error from the WebAuthn flow into a PasskeyErrorType.
 */
function classifyPasskeyError(error) {
  if (error.name === "NotAllowedError") {
    return PasskeyErrorType.CANCELLED;
  }

  if (error.name === "InvalidStateError") {
    return PasskeyErrorType.NOT_FOUND;
  }

  // Check for network errors
  if (
    error.message?.includes("Failed to fetch") ||
    error.message?.includes("NetworkError") ||
    error.code === "ERR_NETWORK"
  ) {
    return PasskeyErrorType.NETWORK;
  }

  // Check for wrong-account signals from backend
  if (error.message?.includes("wrong_account") || error.status === 403) {
    return PasskeyErrorType.WRONG_ACCOUNT;
  }

  return PasskeyErrorType.UNKNOWN;
}

/**
 * Wrap an async operation with passkey error classification.
 */
async function withPasskeyErrors(fn) {
  try {
    return await fn();
  } catch (error) {
    const type = classifyPasskeyError(error);
    throw new PasskeyError(type, error);
  }
}

export async function registerPasskey() {
  return withPasskeyErrors(async () => {
    const optionsResponse = await apiRequest("/api/webauthn/register/options", {
      method: "POST",
    });

    const options = optionsResponse.data;

    const registrationResponse = await startRegistration({ optionsJSON: options });

    const verificationResponse = await apiRequest(
      "/api/webauthn/register/verify",
      {
        method: "POST",
        body: JSON.stringify({ response: registrationResponse }),
      },
    );

    return verificationResponse.data;
  });
}

export async function authenticateWithPasskey(email) {
  return withPasskeyErrors(async () => {
    const optionsResponse = await apiRequest(
      "/api/webauthn/authenticate/options",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      },
    );

    const { options, challengeKey } = optionsResponse.data;

    const authenticationResponse = await startAuthentication({
      optionsJSON: options,
    });

    const verificationResponse = await apiRequest(
      "/api/webauthn/authenticate/verify",
      {
        method: "POST",
        body: JSON.stringify({
          response: authenticationResponse,
          challengeKey,
        }),
      },
    );

    return verificationResponse.data;
  });
}

export async function getRegisteredPasskeys() {
  const response = await apiRequest("/api/webauthn/passkeys", {
    method: "GET",
  });

  return response.data;
}

export async function removePasskey(credentialId) {
  const response = await apiRequest(
    `/api/webauthn/passkeys/${encodeURIComponent(credentialId)}`,
    {
      method: "DELETE",
    },
  );

  return response;
}

export async function isPasskeyAvailable() {
  if (!window.PublicKeyCredential) {
    return false;
  }

  try {
    const available =
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch {
    return false;
  }
}
