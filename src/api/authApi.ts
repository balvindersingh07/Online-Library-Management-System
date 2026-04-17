import { apiFetch, setAccessToken } from './client'
import type { User } from '../types'

export type TokenResponse = {
  access_token: string
  token_type: string
  user: {
    id: number
    email: string
    role: string
    name: string | null
  }
}

export type UserMe = {
  id: number
  email: string
  role: string
  name: string | null
}

function mapUser(u: TokenResponse['user'] | UserMe): User {
  const name =
    u.name ||
    (u.email.split('@')[0] || 'reader').replace(/^./, (c) => c.toUpperCase())
  return {
    id: String(u.id),
    email: u.email,
    name,
    role: u.role,
  }
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<User> {
  const res = await apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    auth: false,
  })
  setAccessToken(res.access_token)
  return mapUser(res.user)
}

export async function registerRequest(
  email: string,
  password: string,
): Promise<User> {
  await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    auth: false,
  })
  return loginRequest(email, password)
}

export async function meRequest(): Promise<User> {
  const u = await apiFetch<UserMe>('/auth/me')
  return mapUser(u)
}

export function logoutRequest(): void {
  setAccessToken(null)
}

export { isApiEnabled } from './config'
