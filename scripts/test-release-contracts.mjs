import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = (name) => readFileSync(resolve(root, name), "utf8");
test("product writes use the authenticated backend, not Firestore fallback", () => {
  const service = src("src/services/product.service.js");
  assert.match(service, /apiCreateProduct/);
  assert.match(service, /apiUpdateProduct/);
  assert.match(service, /apiDeleteProduct/);
});
test("marketplace forwards group IDs", () => {
  assert.match(src("src/services/product.service.js"), /groupId/);
});

test("marketplace uses cache-or-fetch, never focus or reconnect revalidation", () => {
  const marketplace = src("src/pages/consumer/Marketplace.jsx");
  const hook = src("src/hooks/useMarketplace.js");
  assert.doesNotMatch(marketplace, /addEventListener\("focus"/);
  assert.doesNotMatch(marketplace, /addEventListener\("online"/);
  assert.match(hook, /if \(restored\)[\s\S]*?else \{[\s\S]*?requestPage\(\{ reset: true \}\)/);
  assert.match(hook, /requestControllerRef\.current\?\.abort\(\)/);
  assert.match(hook, /signal: controller\.signal/);
});

test("marketplace group options are lazy, cached, and deduplicated", () => {
  const filters = src("src/components/consumer/marketplace/FiltersSidebar.jsx");
  const groups = src("src/services/group.service.js");
  assert.doesNotMatch(filters, /getGroups\(\)\s*\.then/);
  assert.match(filters, /onOpenChange=\{\(open\) => \{ if \(open\) loadGroups\(\); \}\}/);
  assert.match(groups, /if \(cached\) return cached/);
  assert.match(groups, /if \(publicGroupsRequest\) return publicGroupsRequest/);
  assert.match(groups, /invalidatePublicGroupsCache\(\)/);
});

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.get(key) ?? null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
}

const savedAccountService = await import("../src/services/savedAccounts.service.js");
const publicMarketplaceCache = await import("../src/utils/publicMarketplaceCache.js");

test("public marketplace cache preserves cursor pagination and is explicitly invalidated", () => {
  globalThis.localStorage = new MemoryStorage();
  publicMarketplaceCache.savePublicMarketplaceCache(
    [{ id: "product-a" }],
    "query-a",
    { cursor: "cursor-a", hasMore: true },
  );
  assert.deepEqual(publicMarketplaceCache.loadPublicMarketplaceCache("query-a").products, [{ id: "product-a" }]);
  assert.equal(publicMarketplaceCache.loadPublicMarketplaceCache("query-a").cursor, "cursor-a");
  assert.equal(publicMarketplaceCache.loadPublicMarketplaceCache("query-a").hasMore, true);
  publicMarketplaceCache.invalidatePublicMarketplaceCache();
  assert.equal(publicMarketplaceCache.loadPublicMarketplaceCache("query-a"), null);
});

test("saved-account migration deduplicates and strips credentials", () => {
  globalThis.localStorage = new MemoryStorage();
  localStorage.setItem("agrinet_saved_accounts", JSON.stringify([
    { uid: "a", email: "a@example.com", displayName: "A", password: "secret", refreshToken: "token", provider: "password" },
    { uid: "a", email: "duplicate@example.com", provider: "google.com" },
    { uid: "b", email: "b@example.com", provider: "google.com", accessToken: "token" },
  ]));

  const accounts = savedAccountService.getSavedAccounts();
  assert.equal(accounts.length, 2);
  assert.deepEqual(Object.keys(accounts[0]).sort(), ["avatar", "displayName", "email", "hasPasskey", "provider", "providers", "role", "uid", "username"]);
  assert.equal(JSON.stringify(accounts).includes("secret"), false);
  assert.equal(JSON.stringify(accounts).includes("refreshToken"), false);
  assert.equal(JSON.stringify(accounts).includes("accessToken"), false);
});

test("saved-account updates are UID-idempotent and retain safe display metadata", () => {
  globalThis.localStorage = new MemoryStorage();
  savedAccountService.saveAccount({ uid: "a", email: "a@example.com", displayName: "A", username: "grower", provider: "password" });
  const accounts = savedAccountService.saveAccount({ uid: "a", email: "a@example.com", providers: ["google.com"] });
  assert.equal(accounts.length, 1);
  assert.equal(accounts[0].displayName, "A");
  assert.equal(accounts[0].username, "grower");
  assert.deepEqual(accounts[0].providers, ["password", "google.com"]);
});

test("public profiles use the dedicated public-safe profile projection", () => {
  const profileHook = src("src/hooks/usePublicProfile.js");
  const userService = src("src/services/user.service.js");
  assert.doesNotMatch(profileHook, /getDoc\(doc\(db, "users", uid\)\)/);
  assert.match(profileHook, /getPublicProfileByUsername/);
  assert.match(profileHook, /getPublicProfile\(uid\)/);
  assert.match(userService, /\/v1\/users\/public\//);
  assert.match(userService, /\/v1\/users\/by-username\//);
});

test("cached private contact fields are visible only to their owner", async () => {
  globalThis.localStorage = new MemoryStorage();
  globalThis.sessionStorage = new MemoryStorage();
  const cache = await import("../src/utils/userProfileCache.js");
  cache.clearUserProfileCache();
  cache.setCachedUserProfile("owner", {
    uid: "owner",
    fullname: "Owner",
    email: "owner@example.com",
    phone: "09170000000",
    profileVisibility: { email: "private", phone: "private" },
  });
  assert.equal(cache.getCachedUserProfile("owner", "owner").email, "owner@example.com");
  assert.equal(cache.getCachedUserProfile("owner", "viewer").email, undefined);
  assert.equal(cache.getCachedUserProfile("owner").phone, undefined);
});

test("persistent auth waits for Firebase local persistence before route state", () => {
  const firebaseAuth = src("src/firebase/auth.js");
  const authContext = src("src/context/AuthContext.jsx");
  assert.match(firebaseAuth, /browserLocalPersistence/);
  assert.match(firebaseAuth, /setPersistence\(auth, browserLocalPersistence\)/);
  assert.match(authContext, /authPersistenceReady\.finally\(subscribe\)/);
  assert.match(authContext, /beforeAuthStateChanged/);
  assert.match(authContext, /pageCache\.clearAll\(\)/);
});

test("quick switching uses Firebase-managed named sessions without token storage", () => {
  const manager = src("src/services/multiAccountSession.service.js");
  assert.match(manager, /initializeApp\(firebaseConfig, name\)/);
  assert.match(manager, /setPersistence\(secondaryAuth, browserLocalPersistence\)/);
  assert.match(manager, /updateCurrentUser\(auth, retainedUser\)/);
  assert.match(manager, /await reload\(retainedUser\)/);
  assert.doesNotMatch(manager, /refreshToken|accessToken|idToken|password/);
});

test("device sessions use an opaque per-account handle and disclose the Firebase boundary", () => {
  const deviceSession = src("src/services/deviceSession.service.js");
  const apiClient = src("src/services/api/api.client.js");
  const sessionsUi = src("src/components/settings/DeviceSessions.jsx");
  assert.match(deviceSession, /agrinet_device_session_v1_/);
  assert.match(deviceSession, /never a Firebase credential/);
  assert.match(apiClient, /X-AgriNet-Session/);
  assert.match(sessionsUi, /scopeNotice/);
  assert.match(sessionsUi, /logoutOtherDeviceSessions/);
  assert.match(sessionsUi, /logoutAllDeviceSessions/);
  assert.match(deviceSession, /registrationByUid/);
  assert.match(deviceSession, /SESSION_REGISTRATION_UNCONFIRMED/);
  assert.match(deviceSession, /authUser: user/);
  assert.match(deviceSession, /deviceSessionId: sessionId/);
  assert.match(src("src/context/AuthContext.jsx"), /deviceSessionReady/);
  assert.match(src("src/context/AuthContext.jsx"), /device-session-missing-recovery/);
  assert.match(apiClient, /agrinet:device-session-missing/);
});

test("private realtime subscriptions use the authenticated backend stream", () => {
  const stream = src("src/services/api/realtime.client.js");
  assert.match(stream, /X-AgriNet-Session/);
  assert.match(stream, /Authorization/);
  assert.doesNotMatch(stream, /\?token=|access_token/);
  assert.match(src("src/services/message.service.js"), /subscribeToRealtime/);
  assert.match(src("src/services/notification.service.js"), /subscribeToRealtime/);
  assert.match(src("src/services/inquiry.service.js"), /subscribeToRealtime/);
  assert.match(stream, /waitingForSession/);
  assert.match(stream, /agrinet:device-session-ready/);
  assert.doesNotMatch(stream, /SESSION_PENDING[\s\S]{0,300}retry\(\)/);
});

test("profile maps keep Leaflet and translation imports separate", () => {
  const map = src("src/components/map/Map.jsx");
  const profile = src("src/pages/shared/UnifiedProfilePage.jsx");
  assert.match(map, /import L from "leaflet"/);
  assert.match(map, /useLanguage/);
  assert.doesNotMatch(map, /import\s*\{[^}]*\bt\b[^}]*\}\s*from\s*["']leaflet["']/);
  assert.match(profile, /PublicProfileHeader/);
  assert.match(src("src/components/location/LocationPicker.jsx"), /LocationMap/);
});

test("the lazy profile map has one explicit Vite optimization group", () => {
  const viteConfig = src("vite.config.js");
  const profile = src("src/pages/shared/UnifiedProfilePage.jsx");
  const map = src("src/components/map/Map.jsx");

  // React Leaflet is first reached through Profile -> LocationPicker -> Map.
  // Keeping its ESM package and Leaflet's CommonJS package in one optimizer
  // group prevents Vite from mixing generated interop exports after a lazy
  // route is discovered.
  assert.match(profile, /FarmerSection/);
  assert.match(map, /from "react-leaflet"/);
  assert.match(viteConfig, /optimizeDeps:\s*\{[\s\S]*?include:\s*\[[\s\S]*?["']leaflet["'][\s\S]*?["']react-leaflet["'][\s\S]*?["']@react-leaflet\/core["']/);
});

test("unified profiles use the public projection and UID-based owner access", () => {
  const page = src("src/pages/shared/UnifiedProfilePage.jsx");
  const hook = src("src/hooks/usePublicProfile.js");
  const routes = src("src/routes/AppRoutes.jsx");

  assert.match(page, /authUser\.uid === profile\.uid/);
  assert.match(page, /isOwner=\{isOwner\}/);
  assert.match(page, /getPublicProfilePath\(updated\)/);
  assert.match(hook, /getPublicProfileByUsername/);
  assert.match(hook, /payload\.profile\.role !== "farmer"/);
  assert.match(hook, /getPublicFarmerProductsPage/);
  assert.match(hook, /Promise\.allSettled/);
  assert.match(routes, /path="\/me" element={<Profile \/>}/);
  assert.match(routes, /path="\/:username" element={<PublicProfile \/>}/);
});
