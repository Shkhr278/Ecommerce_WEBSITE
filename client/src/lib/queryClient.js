import { QueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Helper: throw on non-2xx
async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Generic request helper for mutations (POST/PUT/DELETE)
export async function apiRequest(method, path, body) {
  const url = path.startsWith("http") ? path : API_BASE_URL + path;

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  await throwIfResNotOk(res);

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/**
 * queryFn for react-query.
 * Expects queryKey like: ["/api/cart"] or ["/api/products?search=foo"]
 */
export function getQueryFn({ on401 = "throw" } = {}) {
  return async ({ queryKey } = {}) => {
    const first = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    const rawUrl = typeof first === "string" ? first : "";
    const url = rawUrl.startsWith("http") ? rawUrl : API_BASE_URL + rawUrl;

    const res = await fetch(url, {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return res.json();
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
