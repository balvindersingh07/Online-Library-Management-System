import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Button } from '../ui/Button'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
      : 'text-[var(--color-muted)] hover:bg-slate-100 hover:text-[var(--color-text)] dark:hover:bg-slate-800'
  }`

export function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const homeTo = user ? '/' : '/catalog'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[var(--color-card)]/90 backdrop-blur-md dark:border-slate-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          to={homeTo}
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--color-text)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-[var(--shadow-soft)]">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </span>
          Libra
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          <NavLink to={homeTo} end className={linkClass}>
            {user ? 'Home' : 'Browse'}
          </NavLink>
          <NavLink to="/catalog" className={linkClass}>
            Catalog
          </NavLink>
          <NavLink to="/account" className={linkClass}>
            My Account
          </NavLink>
          {user?.role === 'admin' ? (
            <NavLink to="/admin" className={linkClass}>
              Admin
            </NavLink>
          ) : null}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200 p-2 text-[var(--color-muted)] transition hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
          {user ? (
            <>
              <span className="hidden text-sm text-[var(--color-muted)] sm:inline">
                {user.name}
              </span>
              <Button variant="ghost" className="!px-3 !py-2 text-sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="primary" className="!px-4 !py-2 text-sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden dark:border-slate-800"
        aria-label="Mobile"
      >
        <NavLink to={homeTo} end className={linkClass}>
          {user ? 'Home' : 'Browse'}
        </NavLink>
        <NavLink to="/catalog" className={linkClass}>
          Catalog
        </NavLink>
        <NavLink to="/account" className={linkClass}>
          Account
        </NavLink>
        {user?.role === 'admin' ? (
          <NavLink to="/admin" className={linkClass}>
            Admin
          </NavLink>
        ) : null}
      </nav>
    </header>
  )
}
