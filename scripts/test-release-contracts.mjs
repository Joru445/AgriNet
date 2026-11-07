import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("eligible available products survive the default/filter/reset catalog flow", () => {
  const hook = src("src/hooks/useMarketplace.js");
  const catalog = src("src/utils/marketplaceCatalog.js");
  assert.match(hook, /filterMarketplaceProducts\(products, filters, userLocation\)/);
  assert.match(catalog, /getProductAvailability\(product\)\.allowed/);
  assert.match(catalog, /isProductExpired\(product\) && !filters\.showUnavailable/);
  assert.match(catalog, /filters\.minPrice/);
  assert.match(catalog, /filters\.maxPrice/);
  assert.match(hook, /resetFilters: \(\) =>/);
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

test("marketplace measures columns from the always-mounted catalog and matches skeleton widths", () => {
  const marketplace = src("src/pages/consumer/Marketplace.jsx");
  const grid = src("src/components/consumer/marketplace/ProductGrid.jsx");
  const skeleton = src("src/components/products/ProductGridSkeleton.jsx");
  assert.match(marketplace, /useLayoutEffect/);
  assert.match(marketplace, /ref=\{catalogRef\}/);
  assert.doesNotMatch(marketplace, /gridRef/);
  assert.doesNotMatch(grid, /gridRef/);
  assert.match(skeleton, /columns/);
});

test("empty marketplace cache entries expire sooner than populated entries", () => {
  const hook = src("src/hooks/useMarketplace.js");
  const cache = src("src/utils/publicMarketplaceCache.js");
  assert.match(hook, /EMPTY_CACHE_TTL/);
  assert.match(hook, /filteredProducts\.length \? CACHE_TTL : EMPTY_CACHE_TTL/);
  assert.match(cache, /EMPTY_RESULT_MAX_AGE_MS/);
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

test("P1 navigation and profile transaction shortcuts stay canonical and owner-only", () => {
  const bottom = src("src/components/layout/BottomTab.jsx");
  const profile = src("src/pages/shared/Profile.jsx");
  const shortcuts = src("src/components/profile/ProfileTransactions.jsx");
  assert.match(src("src/constants/navigation.js"), /kind: "profile"/);
  assert.match(bottom, /getProfilePath/);
  assert.match(profile, /isOwner && <ProfileTransactions/);
  for (const group of ["requests", "in-progress", "completed", "cancelled"]) {
    assert.match(shortcuts, new RegExp(group));
  }
});

test("P1 favorites and transaction groups are bounded, cursor-based queries", () => {
  const favorites = src("src/pages/shared/Favorites.jsx");
  const inquiryClient = src("src/services/inquiry.service.js");
  const favoriteClient = src("src/services/favorite.service.js");
  assert.doesNotMatch(favorites, /getProducts\(|getFarmers\(/);
  assert.match(favoriteClient, /params\.set\("type"/);
  assert.match(inquiryClient, /params\.set\("group"/);
  assert.match(src("src/utils/accountQueryCache.js"), /accountCacheRequest/);
});

test("revised P1 navigation removes mobile transactions/settings and uses profile avatars", () => {
  const navigation = src("src/constants/navigation.js");
  const bottom = src("src/components/layout/BottomNavigation.jsx");
  const header = src("src/components/layout/Header.jsx");
  const layout = src("src/layouts/AppLayout.jsx");
  assert.match(navigation, /kind: "profile"/);
  assert.match(bottom, /<Avatar/);
  assert.doesNotMatch(header, /UserIdentity/);
  assert.match(layout, /getLayoutRouteMembership/);
});

test("transaction group counts are lightweight and account-scoped", () => {
  assert.match(src("src/services/inquiry.service.js"), /apiGetInquiryGroupCounts/);
  assert.match(src("src/components/profile/ProfileTransactions.jsx"), /inquiry-group-counts/);
});

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.get(key) ?? null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
}

const savedAccountService = await import("../src/services/savedAccounts.service.js");
const publicMarketplaceCache = await import("../src/utils/publicMarketplaceCache.js");
const accountQueryCache = await import("../src/utils/accountQueryCache.js");
const swipeGesture = await import("../src/hooks/useMobileTabSwipe.js");

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

test("private query cache deduplicates requests and isolates account keys", async () => {
  accountQueryCache.clearAccountQueryCache();
  let calls = 0;
  const fetcher = () => new Promise((resolve) => {
    calls += 1;
    setTimeout(() => resolve({ owner: "account-a" }), 5);
  });
  const first = accountQueryCache.accountCacheRequest("account-a:favorites:product", fetcher);
  const second = accountQueryCache.accountCacheRequest("account-a:favorites:product", fetcher);
  assert.strictEqual(await first, await second);
  assert.equal(calls, 1);
  assert.equal(accountQueryCache.getAccountCache("account-b:favorites:product"), undefined);
  assert.equal(accountQueryCache.getAccountCacheMetrics().deduped, 1);
});

test("invalidating a private query prevents a late response from repopulating it", async () => {
  accountQueryCache.clearAccountQueryCache();
  let resolve;
  const request = accountQueryCache.accountCacheRequest(
    "account-a:messages:conversation-1",
    () => new Promise((complete) => { resolve = complete; }),
  );
  await Promise.resolve();
  accountQueryCache.invalidateAccountCache("account-a:messages:");
  resolve({ private: true });
  await request;
  assert.equal(accountQueryCache.getAccountCache("account-a:messages:conversation-1"), undefined);
});

test("favorites pages avoid repeating total-count aggregation on cursor requests", () => {
  assert.match(src("src/services/favorite.service.js"), /includeTotal = !cursor/);
  assert.match(src("src/pages/shared/Favorites.jsx"), /includeTotal: !append/);
  assert.match(src("src/pages/shared/Favorites.jsx"), /page\.total \?\? current\.total/);
  assert.match(src("src/utils/messaging/messageCache.js"), /MAX_CACHED_CONVERSATIONS/);
  assert.match(src("src/hooks/messages/useMessageSubscription.js"), /cached\.cursor/);
  assert.match(src("src/hooks/messages/useMessageSubscription.js"), /readRequestRef/);
  assert.doesNotMatch(src("src/services/message.service.js"), /falling back to Firestore/);
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
  const profile = src("src/pages/shared/Profile.jsx");
  assert.match(map, /import L from "leaflet"/);
  assert.match(map, /useLanguage/);
  assert.doesNotMatch(map, /import\s*\{[^}]*\bt\b[^}]*\}\s*from\s*["']leaflet["']/);
  assert.match(profile, /PublicProfileHeader/);
  assert.match(src("src/components/location/LocationPicker.jsx"), /LocationMap/);
});

test("the lazy profile map has one explicit Vite optimization group", () => {
  const viteConfig = src("vite.config.js");
  const profile = src("src/pages/shared/Profile.jsx");
  const editor = src("src/components/profile/ProfileEditor.jsx");
  const map = src("src/components/map/Map.jsx");

  // React Leaflet is first reached through the lazy owner editor ->
  // LocationPicker -> Map.
  // Keeping its ESM package and Leaflet's CommonJS package in one optimizer
  // group prevents Vite from mixing generated interop exports after a lazy
  // route is discovered.
  assert.match(editor, /FarmerSection/);
  assert.match(map, /from "react-leaflet"/);
  assert.match(viteConfig, /optimizeDeps:\s*\{[\s\S]*?include:\s*\[[\s\S]*?["']leaflet["'][\s\S]*?["']react-leaflet["'][\s\S]*?["']@react-leaflet\/core["']/);
});

test("unified profiles use the public projection and UID-based owner access", () => {
  const page = src("src/pages/shared/Profile.jsx");
  const hook = src("src/hooks/usePublicProfile.js");
  const routes = src("src/routes/AppRoutes.jsx");

  assert.match(page, /authUser\.uid === profile\.uid/);
  assert.match(page, /isOwner=\{isOwner\}/);
  assert.match(page, /getProfilePath\(updated\.username\)/);
  assert.match(hook, /getPublicProfileByUsername/);
  assert.match(hook, /payload\.profile\.role !== "farmer"/);
  assert.match(hook, /getPublicFarmerProductsPage/);
  assert.match(hook, /productsRequest[\s\S]*reviewsRequest/);
  assert.match(hook, /Promise\.all\(\[/);
  assert.match(routes, /const Profile = lazy\(\(\) => import\("\.\.\/pages\/shared\/Profile"\)\)/);
  assert.match(routes, /path="\/:username" element={<Profile \/>}/);
  for (const legacyPath of ["/profile/:uid", "/farmer/profile/:uid", "/farmer/me", "/admin/me"]) {
    assert.doesNotMatch(routes, new RegExp(`path="${legacyPath.replace(/[/:]/g, "\\$&")}"`));
  }
  assert.match(routes, /path="\/me" element={<NotFound \/>}/);
});

test("profile routes use one canonical page and lazy owner editing", () => {
  const routes = src("src/routes/AppRoutes.jsx");
  const page = src("src/pages/shared/Profile.jsx");
  const editor = src("src/components/profile/ProfileEditor.jsx");
  assert.doesNotMatch(routes, /UnifiedProfilePage|PublicProfile|OwnProfileRedirect|LegacyProfileRedirect/);
  assert.doesNotMatch(page, /useProfile/);
  assert.match(page, /editOpen && isOwner/);
  assert.match(page, /<ProfileEditor/);
  assert.match(editor, /useProfile/);
  assert.match(src("src/utils/routes.js"), /export function getProfilePath\(username\)/);
  assert.doesNotMatch(src("src/utils/routes.js"), /legacyPublicProfile|getPublicProfilePath|getMePath/);
  for (const obsolete of [
    "src/pages/shared/UnifiedProfilePage.jsx",
    "src/pages/shared/PublicProfile.jsx",
    "src/pages/shared/OwnProfileRedirect.jsx",
    "src/components/profile/LegacyProfileRedirect.jsx",
  ]) {
    assert.equal(existsSync(resolve(root, obsolete)), false, `${obsolete} should be removed`);
  }
});

test("P2 mobile refresh and tab swipe remain section-scoped", () => {
  const refresh = src("src/hooks/useSectionPullToRefresh.js");
  const swipe = src("src/hooks/useMobileTabSwipe.js");
  const layout = src("src/layouts/AppLayout.jsx");
  const indicator = src("src/components/ui/SectionPullIndicator.jsx");
  const marketplace = src("src/pages/consumer/Marketplace.jsx");
  assert.match(refresh, /data-app-scroll/);
  assert.match(refresh, /section\.contains/);
  assert.match(refresh, /section\.addEventListener\("touchstart"/);
  assert.match(refresh, /touchcancel.*resetGesture|resetGesture.*touchcancel/s);
  assert.match(refresh, /touchmove/);
  assert.doesNotMatch(refresh, /style\.transform|translateY/);
  assert.match(indicator, /ri-loader-4-line/);
  assert.doesNotMatch(indicator, /Pull to refresh|Release to refresh|Refreshing/);
  assert.match(marketplace, /data-pull-section="marketplace-products"/);
  assert.match(marketplace, /productListRef/);
  assert.match(swipe, /data-swipe-ignore/);
  assert.match(swipe, /MIN_SWIPE_DISTANCE = 160/);
  assert.match(swipe, /MIN_SWIPE_VIEWPORT_RATIO = 0\.45/);
  assert.match(swipe, /HORIZONTAL_INTENT_RATIO = 2/);
  assert.match(swipe, /MAX_VERTICAL_DRIFT = 60/);
  assert.match(swipe, /EDGE_EXCLUSION_PX = 24/);
  assert.match(swipe, /touchmove/);
  assert.match(swipe, /touchcancel.*reset|reset.*touchcancel/s);
  assert.match(swipe, /requiredDistance/);
  assert.match(swipe, /data-tab-swipe-region='true'/);
  assert.match(layout, /data-tab-swipe-region=\{showBottomNav/);
  assert.match(swipe, /hasNestedScrollOwner/);
  assert.doesNotMatch(swipe, /navigate\(destination\)[\s\S]{0,80}touchmove/);
  assert.match(layout, /useMobileTabSwipe/);
});

test("mobile tab swipe requires a deliberate completed horizontal gesture", () => {
  const required = swipeGesture.requiredSwipeDistance(390);
  assert.equal(required, 175.5);
  for (const distance of [20, 50, 100, 150]) {
    assert.equal(swipeGesture.classifySwipeGesture(distance, 0, required), false);
  }
  assert.equal(swipeGesture.classifySwipeGesture(180, 0, required), true);
  assert.equal(swipeGesture.classifySwipeGesture(220, 61, required), false);
  assert.equal(swipeGesture.classifySwipeGesture(220, 110, required), false);
  assert.equal(swipeGesture.classifySwipeGesture(220, 0, required), true);
});

test("profile and group loading keep their page shells mounted", () => {
  const profile = src("src/pages/shared/Profile.jsx");
  const profileHook = src("src/hooks/usePublicProfile.js");
  const groups = src("src/pages/shared/Groups.jsx");
  assert.doesNotMatch(profile, /if \(loading\) return <PublicProfileSkeleton/);
  assert.match(profile, /ProfileHeaderSkeleton/);
  assert.match(profile, /ProfileStatsSkeleton/);
  assert.match(profile, /ProfileContentSkeleton/);
  assert.match(profileHook, /setLoadingProducts\(false\)/);
  assert.match(profileHook, /setLoadingReviews\(false\)/);
  assert.doesNotMatch(groups, /if \(loading\) \{\s*return \(/);
  assert.match(groups, /loading \? \([\s\S]*?SkeletonBox/);
});

test("username availability checks are debounced and stale-safe", () => {
  const hook = src("src/hooks/useUsernameAvailability.js");
  const service = src("src/services/user.service.js");
  assert.match(hook, /setTimeout/);
  assert.match(hook, /requestId/);
  assert.match(service, /username-availability/);
});

test("inquiry realtime errors preserve safe fields and back off", () => {
  const realtime = src("src/services/api/realtime.client.js");
  const context = src("src/context/InquiriesContext.jsx");
  assert.match(realtime, /retryable/);
  assert.match(realtime, /data\.message/);
  assert.match(realtime, /attempts = 0/);
  assert.doesNotMatch(context, /setInquiries\(\[\]\);\s*setError\(err\)/);
});
