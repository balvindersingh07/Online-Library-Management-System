import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchBar } from '../components/ui/SearchBar'
import { BookCard } from '../components/books/BookCard'
import { useAuth } from '../context/AuthContext'
import { useLibrary } from '../context/LibraryContext'
import type { Genre } from '../types'

const categories: { label: string; genre: Genre }[] = [
  { label: 'Fiction', genre: 'Fiction' },
  { label: 'Non-fiction', genre: 'Non-fiction' },
  { label: 'Science', genre: 'Science' },
  { label: 'Technology', genre: 'Technology' },
]

export function DashboardPage() {
  const { user } = useAuth()
  const { books } = useLibrary()
  const featured = books.slice(0, 8)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
          Welcome back{user ? `, ${user.name}` : ''}!
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Search the collection or jump into a category to find your next read.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const t = q.trim()
          navigate(t ? `/catalog?q=${encodeURIComponent(t)}` : '/catalog')
        }}
      >
        <SearchBar
          placeholder="Search books, authors, genres…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      <section>
        <h2 className="text-lg font-bold text-[var(--color-text)]">Categories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map(({ label, genre }) => (
            <Link
              key={genre}
              to={`/catalog?genre=${encodeURIComponent(genre)}`}
              className="rounded-2xl border border-slate-200/80 bg-[var(--color-card)] px-4 py-4 text-center text-sm font-semibold text-[var(--color-text)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-soft-lg)] dark:border-slate-700"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            Featured books
          </h2>
          <Link
            to="/catalog"
            className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featured.map((book) => (
            <div
              key={book.id}
              className="w-[220px] flex-shrink-0 sm:w-[240px]"
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
