import { QueryClient } from "@tanstack/react-query";

// Backend base URL:
// - In production: set VITE_API_BASE_URL in Vercel (e.g. https://your-backend.onrender.com)
// - In development: falls back to http://localhost:8000
const API_BASE_URL =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:8000";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// For POST / PUT / DELETE etc.
export async function apiRequest(method, path, body) {
  const url = path.startsWith("http") ? path : API_BASE_URL + path;

  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  await throwIfResNotOk(res);
  // Callers don't currently use the response body, so return the Response
  return res;
}

/**
 * Returns a react-query queryFn which expects `queryKey` to be an array
 * where the first element is the URL (or URL parts).
 *
 * options.on401: "returnNull" | "throw"
 */
export function getQueryFn({ on401 = "throw" } = {}) {
  return async ({ queryKey } = {}) => {
    // Normalize queryKey -> url string
    let url = "";

    if (Array.isArray(queryKey)) {
      // Your code usually passes single-element arrays like ["/api/products?..."]
      url = queryKey.join("");
    } else if (queryKey != null) {
      url = String(queryKey);
    }

    const finalUrl = url.startsWith("http") ? url : API_BASE_URL + url;

    const res = await fetch(finalUrl, {
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
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
