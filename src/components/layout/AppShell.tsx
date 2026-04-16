import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200/80 py-6 text-center text-xs text-[var(--color-muted)] dark:border-slate-800">
        © {new Date().getFullYear()} Libra Library — Browse, borrow, return.
      </footer>
    </div>
  )
}
