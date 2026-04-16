import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { LibraryHero } from '../components/auth/LibraryHero'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'

export function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from
    ?.pathname
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const data = new FormData(form)
    const intent = data.get('intent') as string
    const email = String(data.get('email') || '').trim()
    const password = String(data.get('password') || '')
    if (!email) return
    try {
      if (intent === 'register') await register(email, password)
      else await login(email, password)
      navigate(from || '/', { replace: true })
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Something went wrong'
      setError(msg)
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--color-page)]">
      <div className="mx-auto grid min-h-dvh max-w-6xl grid-cols-1 lg:grid-cols-2">
        <div className="hidden lg:block lg:p-8 lg:pr-4">
          <LibraryHero />
        </div>

        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:p-12">
          <div className="mb-8 lg:hidden">
            <LibraryHero />
          </div>

          <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
              Sign in to Libra
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Browse the catalog, borrow titles, and manage returns from your
              account.
            </p>

            {error ? (
              <p
                className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-8 space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] shadow-[var(--shadow-soft)] outline-none ring-[var(--color-primary)]/25 focus:border-[var(--color-primary)] focus:ring-2 dark:border-slate-600"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-[var(--color-card)] px-4 py-3 text-sm text-[var(--color-text)] shadow-[var(--shadow-soft)] outline-none ring-[var(--color-primary)]/25 focus:border-[var(--color-primary)] focus:ring-2 dark:border-slate-600"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Button
                  type="submit"
                  name="intent"
                  value="login"
                  variant="primary"
                  className="flex-1 !py-3"
                >
                  Login
                </Button>
                <Button
                  type="submit"
                  name="intent"
                  value="register"
                  variant="secondary"
                  className="flex-1 !py-3"
                >
                  Register
                </Button>
              </div>
            </form>

            <p className="mt-8 text-center">
              <Link
                to="/"
                className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-text)]"
              >
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
