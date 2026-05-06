/**
 * Resolves the API base URL.
 *
 *   VITE_API_BASE_URL=""                                  → MSW intercepts /api/upay/*
 *   VITE_API_BASE_URL="https://thor-portal.example.com"   → real backend
 *
 * Always pair with `VITE_ENABLE_MOCKS` for the worker behavior.
 */
export const apiUrl = (path: string): string => {
  const base = import.meta.env.VITE_API_BASE_URL ?? ''
  return `${base}${path}`
}
