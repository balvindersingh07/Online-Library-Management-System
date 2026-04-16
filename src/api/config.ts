/** Base URL for FastAPI backend (no trailing slash). */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || ''

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  if (!API_BASE_URL) return p
  return `${API_BASE_URL}${p}`
}
