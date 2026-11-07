export function getPublicProfileRouteKey({ uid, username } = {}) {
  return username
    ? `publicProfile:username:${username.trim().toLowerCase()}`
    : uid
      ? `publicProfile:uid:${uid}`
      : "publicProfile:invalid";
}

export function selectPublicProfileRouteState(state, routeKey, cached, emptyState) {
  if (state?.routeKey === routeKey) return state;
  if (cached) return { ...emptyState(routeKey, false), ...cached, routeKey };
  return emptyState(routeKey);
}

export function selectAccountScopedValue(uid, state, cachedValue) {
  if (!uid) return null;
  return state?.uid === uid ? state.value : cachedValue ?? null;
}
