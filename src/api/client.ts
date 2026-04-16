import { apiUrl } from './config'

const TOKEN_KEY = 'libra-access-token'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  body?: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (init.auth !== false) {
    const t = getAccessToken()
    if (t) headers.set('Authorization', `Bearer ${t}`)
  }

  const res = await fetch(apiUrl(path), { ...init, headers })

  if (res.status === 204) {
    return undefined as T
  }

  const data = await parseJson(res)

  if (!res.ok) {
    let detail = res.statusText
    if (typeof data === 'object' && data !== null && 'detail' in data) {
      const d = (data as { detail: unknown }).detail
      if (typeof d === 'string') detail = d
      else if (Array.isArray(d))
        detail = d
          .map((x) =>
            typeof x === 'object' && x && 'msg' in x
              ? String((x as { msg: unknown }).msg)
              : String(x),
          )
          .join(', ')
    }
    throw new ApiError(detail || 'Request failed', res.status, data)
  }

  return data as T
}
