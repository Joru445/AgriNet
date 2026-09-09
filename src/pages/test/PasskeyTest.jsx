import { useState, useEffect, useCallback } from "react";
import { signInWithCustomToken } from "firebase/auth";

import { auth } from "../../firebase/auth";
import { useAuth } from "../../context/AuthContext";
import {
  registerPasskey,
  authenticateWithPasskey,
  getRegisteredPasskeys,
  removePasskey,
  isPasskeyAvailable,
} from "../../services/webauthn.service";

export default function PasskeyTest() {
  const { user } = useAuth();
  const [passkeySupported, setPasskeySupported] = useState(null);
  const [passkeys, setPasskeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [email, setEmail] = useState("");

  const showMessage = useCallback((text, type = "info") => {
    setMessage({ text, type });
  }, []);

  useEffect(() => {
    isPasskeyAvailable().then(setPasskeySupported);
  }, []);

  const loadPasskeys = useCallback(async () => {
    if (!user) return;
    try {
      const keys = await getRegisteredPasskeys();
      setPasskeys(keys);
    } catch (error) {
      showMessage(error.message, "error");
    }
  }, [user, showMessage]);

  useEffect(() => {
    if (user) {
      loadPasskeys();
    }
  }, [user, loadPasskeys]);

  async function handleRegister() {
    if (!user) {
      showMessage("Please log in first to register a passkey.", "error");
      return;
    }

    setLoading(true);
    showMessage(null);

    try {
      const result = await registerPasskey();
      showMessage(
        `Passkey registered! ID: ${result.credentialId.substring(0, 24)}...`,
        "success",
      );
      await loadPasskeys();
    } catch (error) {
      if (error.name === "NotAllowedError") {
        showMessage("Registration was cancelled.", "error");
      } else {
        showMessage(`Registration failed: ${error.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthenticate() {
    if (!email) {
      showMessage("Please enter an email to search for passkeys.", "error");
      return;
    }

    setLoading(true);
    showMessage(null);

    try {
      const result = await authenticateWithPasskey(email);

      await signInWithCustomToken(auth, result.customToken);

      showMessage("Authenticated successfully!", "success");
    } catch (error) {
      if (error.name === "NotAllowedError") {
        showMessage("Authentication was cancelled.", "error");
      } else {
        showMessage(`Authentication failed: ${error.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(credentialId) {
    setLoading(true);
    showMessage(null);

    try {
      await removePasskey(credentialId);
      showMessage("Passkey removed.", "success");
      await loadPasskeys();
    } catch (error) {
      showMessage(`Remove failed: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Passkey PoC Test
          </h1>
          <p className="mt-2 text-gray-600">
            WebAuthn / Passkey Authentication Proof of Concept
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            System Status
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">WebAuthn Supported:</span>
              <span
                className={`font-medium ${passkeySupported === true ? "text-green-600" : passkeySupported === false ? "text-red-600" : "text-gray-400"}`}
              >
                {passkeySupported === true
                  ? "Yes"
                  : passkeySupported === false
                    ? "No"
                    : "Checking..."}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Firebase User:</span>
              <span
                className={`font-medium ${user ? "text-green-600" : "text-gray-400"}`}
              >
                {user ? user.email || user.uid : "Not logged in"}
              </span>
            </div>
            {user && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Passkey Count:</span>
                <span className="font-medium text-gray-900">
                  {passkeys.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : message.type === "error"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Register Passkey
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Register a new passkey for your authenticated account. This requires
            you to be logged in.
          </p>
          <button
            onClick={handleRegister}
            disabled={loading || !user || passkeySupported === false}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing..." : "Register Passkey"}
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Authenticate with Passkey
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Sign in using a registered passkey. Enter the email associated with
            the passkey to search for credentials.
          </p>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleAuthenticate}
            disabled={loading || passkeySupported === false}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Processing..." : "Authenticate with Passkey"}
          </button>
        </div>

        {user && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Registered Passkeys
            </h2>
            {passkeys.length === 0 ? (
              <p className="text-gray-500 text-sm">No passkeys registered.</p>
            ) : (
              <div className="space-y-3">
                {passkeys.map((key) => (
                  <div
                    key={key.credentialId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {key.credentialId.substring(0, 32)}...
                      </p>
                      <p className="text-xs text-gray-500">
                        {key.deviceType} | Backed up:{" "}
                        {key.backedUp ? "Yes" : "No"} | Last used:{" "}
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleDateString()
                          : "Never"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(key.credentialId)}
                      disabled={loading}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
