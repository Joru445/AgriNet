import { apiRequest } from "./api/api.client";

export async function getFavorites(page = 1, limit = 20) {
  const data = await apiRequest(
    `/favorites?page=${page}&limit=${limit}`,
  );
  return data.data;
}

export async function getFavoriteIds() {
  const data = await apiRequest("/favorites/ids");
  return data.data;
}

export async function addFavorite(type, targetId) {
  const data = await apiRequest("/favorites", {
    method: "POST",
    body: JSON.stringify({ type, targetId }),
  });
  return data.data;
}

export async function removeFavorite(type, targetId) {
  const data = await apiRequest("/favorites", {
    method: "DELETE",
    body: JSON.stringify({ type, targetId }),
  });
  return data.removed;
}

export async function checkFavorite(type, targetId) {
  const data = await apiRequest(
    `/favorites/check?type=${type}&targetId=${targetId}`,
  );
  return data.data;
}
