import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '../types'
import {
  isApiEnabled,
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from '../api/authApi'
import { getAccessToken } from '../api/client'

const USER_KEY = 'libra-user'

function dispatchAuthChanged() {
  window.dispatchEvent(new Event('libra-auth-changed'))
}

type AuthContextValue = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadLocalUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) return JSON.parse(raw) as User
  } catch {
    /* ignore */
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const api = isApiEnabled()
  const [user, setUser] = useState<User | null>(() =>
    api ? null : loadLocalUser(),
  )
  const [loading, setLoading] = useState(Boolean(api))

  useEffect(() => {
    if (!api) {
      setLoading(false)
      return
    }
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const u = await meRequest()
        if (!cancelled) {
          setUser(u)
          localStorage.setItem(USER_KEY, JSON.stringify(u))
        }
      } catch {
        if (!cancelled) {
          logoutRequest()
          setUser(null)
          localStorage.removeItem(USER_KEY)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [api])

  const persist = useCallback((u: User | null) => {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else localStorage.removeItem(USER_KEY)
    setUser(u)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      if (api) {
        const u = await loginRequest(email, password)
        persist(u)
        dispatchAuthChanged()
        return u
      }
      const name =
        (email.split('@')[0] || 'reader').replace(/^./, (c) => c.toUpperCase())
      const u: User = { id: 'u1', email, name, role: 'user' }
      persist(u)
      return u
    },
    [api, persist],
  )

  const register = useCallback(
    async (email: string, password: string) => {
      if (api) {
        const u = await registerRequest(email, password)
        persist(u)
        dispatchAuthChanged()
        return u
      }
      return login(email, password)
    },
    [api, login],
  )

  const logout = useCallback(() => {
    if (api) {
      logoutRequest()
      localStorage.removeItem(USER_KEY)
      setUser(null)
      dispatchAuthChanged()
      return
    }
    persist(null)
  }, [api, persist])

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
