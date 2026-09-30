import { getStoredToken } from "./roleUtils";

const API_BASE = "http://localhost:1111";

export function resolveUploadUrl(urlPath) {
  if (!urlPath) return "";
  if (/^https?:\/\//i.test(urlPath)) return urlPath;
  if (urlPath.startsWith("/uploads/")) {
    return `${API_BASE}${urlPath}`;
  }
  return urlPath;
}

export async function apiFetch(path, options = {}) {
  const token = getStoredToken();

  const headers = {
    ...(options.headers || {}),
  };

  // Only set JSON content-type when body is present and NOT FormData
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (options.body && !isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}

export { API_BASE };
