import { auth } from "../../firebase/auth";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not configured.");
}

export async function apiRequest(endpoint, options = {}) {
  const currentUser = auth.currentUser;

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (currentUser) {
    const token = await currentUser.getIdToken();

    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || "API request failed.",
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}