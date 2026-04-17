/**
 * API base URL (no trailing slash).
 * In `vite` dev: an Azure/production URL in `.env.local` is ignored unless
 * `VITE_FORCE_REMOTE_API=1`, so requests go same-origin → Vite proxy → local `npm start`.
 */
function resolveApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
  const forceRemote =
    import.meta.env.VITE_FORCE_REMOTE_API === '1' ||
    import.meta.env.VITE_FORCE_REMOTE_API === 'true'
  if (import.meta.env.DEV && raw && !forceRemote) {
    return ''
  }
  return raw
}

export const API_BASE_URL = resolveApiBase()

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  if (API_BASE_URL) return `${API_BASE_URL}${p}`
  if (import.meta.env.DEV) return p
  return p
}

/**
 * Use REST API for auth + library. Dev defaults to on (local proxy).
 * Set `VITE_MOCK_LIBRARY=1` for mock catalog/auth without a server.
 */
export function isApiEnabled(): boolean {
  if (
    import.meta.env.VITE_MOCK_LIBRARY === 'true' ||
    import.meta.env.VITE_MOCK_LIBRARY === '1'
  ) {
    return false
  }
  if (import.meta.env.DEV) return true
  return Boolean(API_BASE_URL)
}
