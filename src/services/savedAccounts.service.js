const STORAGE_KEY = "agrinet_saved_accounts";
const MAX_ACCOUNTS = 5;
const ALLOWED_PROVIDERS = ["password", "google.com", "facebook.com"];

function safeAccount(candidate) {
  if (!candidate?.uid || typeof candidate.uid !== "string") return null;
  const providers = [...new Set(
    (Array.isArray(candidate.providers) ? candidate.providers : [candidate.provider])
      .filter((provider) => ALLOWED_PROVIDERS.includes(provider)),
  )];
  return {
    uid: candidate.uid,
    email: typeof candidate.email === "string" ? candidate.email : "",
    displayName: typeof candidate.displayName === "string" ? candidate.displayName : "",
    username: typeof candidate.username === "string" ? candidate.username : "",
    avatar: typeof candidate.avatar === "string" ? candidate.avatar : "",
    role: typeof candidate.role === "string" ? candidate.role : "consumer",
    provider: ALLOWED_PROVIDERS.includes(candidate.provider)
      ? candidate.provider
      : providers[0] || null,
    providers,
    hasPasskey: candidate.hasPasskey === true,
  };
}

/**
 * Returns the list of saved accounts from localStorage.
 * Each entry contains only display and account-selection metadata.
 *
 * provider: "password" | "google.com" | "facebook.com" | null
 * hasPasskey: boolean (metadata only — no credential data stored)
 */
export function getSavedAccounts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Migrate legacy entries and persist only safe selection metadata. This
    // registry never contains passwords, OAuth tokens, or Firebase tokens.
    const seen = new Set();
    const accounts = parsed.reduce((list, candidate) => {
      const account = safeAccount(candidate);
      if (!account || seen.has(account.uid)) return list;
      seen.add(account.uid);
      list.push(account);
      return list;
    }, []);
    if (JSON.stringify(accounts) !== JSON.stringify(parsed)) persist(accounts);
    return accounts;
  } catch {
    return [];
  }
}

/**
 * Persists the saved accounts array to localStorage.
 */
function persist(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

/**
 * Saves or updates an account entry by UID (idempotent).
 * Returns the updated list.
 */
export function saveAccount({
  uid,
  email,
  displayName,
  username,
  avatar,
  role,
  provider,
  providers,
  hasPasskey,
}) {
  if (!uid) return getSavedAccounts();

  const accounts = getSavedAccounts();
  const existingIndex = accounts.findIndex((a) => a.uid === uid);

  const existing = existingIndex >= 0 ? accounts[existingIndex] : {};

  const providerList = [...new Set([
    ...(Array.isArray(existing.providers) ? existing.providers : [existing.provider]),
    ...(Array.isArray(providers) ? providers : []),
    provider,
  ].filter((value) => ALLOWED_PROVIDERS.includes(value)))];
  const entry = {
    uid,
    email: email || existing.email || "",
    displayName: displayName || existing.displayName || "",
    username: username || existing.username || "",
    avatar: avatar || existing.avatar || "",
    role: role || existing.role || "consumer",
    provider: provider || providerList[0] || null,
    providers: providerList,
    hasPasskey:
      typeof hasPasskey === "boolean" ? hasPasskey : existing.hasPasskey || false,
  };

  if (existingIndex >= 0) {
    accounts[existingIndex] = entry;
  } else {
    accounts.unshift(entry);
  }

  // Cap at MAX_ACCOUNTS, removing oldest entries
  if (accounts.length > MAX_ACCOUNTS) {
    accounts.length = MAX_ACCOUNTS;
  }

  persist(accounts);
  return accounts;
}

/**
 * Updates the hasPasskey metadata for a specific account.
 * Returns the updated list.
 */
export function updatePasskeyStatus(uid, hasPasskey) {
  if (!uid) return getSavedAccounts();

  const accounts = getSavedAccounts();
  const index = accounts.findIndex((a) => a.uid === uid);

  if (index >= 0) {
    accounts[index] = { ...accounts[index], hasPasskey };
    persist(accounts);
  }

  return accounts;
}

/**
 * Removes an account entry by UID.
 * Returns the updated list.
 */
export function removeAccount(uid) {
  if (!uid) return getSavedAccounts();

  const accounts = getSavedAccounts().filter((a) => a.uid !== uid);
  persist(accounts);
  return accounts;
}

/**
 * Clears all saved accounts.
 */
export function clearSavedAccounts() {
  localStorage.removeItem(STORAGE_KEY);
}
