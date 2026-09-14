import { apiRequest } from "./api/api.client";

export async function getFavorites({ limit = 20, cursor } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);

  const data = await apiRequest(`/v1/favorites?${params.toString()}`);
  return {
    items: data.data || [],
    total: data.pagination?.total ?? 0,
    cursor: data.pagination?.cursor ?? null,
    hasMore: data.pagination?.hasMore ?? false,
  };
}

export async function getFavoriteIds() {
  const data = await apiRequest("/v1/favorites/ids");
  return data.data;
}

export async function addFavorite(type, targetId) {
  const data = await apiRequest("/v1/favorites", {
    method: "POST",
    body: JSON.stringify({ type, targetId }),
  });
  return data.data;
}

export async function removeFavorite(type, targetId) {
  const data = await apiRequest("/v1/favorites", {
    method: "DELETE",
    body: JSON.stringify({ type, targetId }),
  });
  return data.removed;
}

export async function checkFavorite(type, targetId) {
  const data = await apiRequest(
    `/v1/favorites/check?type=${type}&targetId=${targetId}`,
  );
  return data.data;
}
