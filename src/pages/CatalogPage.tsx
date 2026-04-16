import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookCard } from '../components/books/BookCard'
import { SearchBar } from '../components/ui/SearchBar'
import { BookCardSkeleton } from '../components/ui/Skeleton'
import { useLibrary } from '../context/LibraryContext'
import type { Genre } from '../types'

const genres: Genre[] = [
  'Fiction',
  'Non-fiction',
  'Science',
  'Technology',
]

const availabilityOptions = [
  { value: '', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'borrowed', label: 'Borrowed' },
] as const

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialGenre = searchParams.get('genre') as Genre | null
  const qParam = searchParams.get('q') || ''
  const { books, loading, isBorrowed, error } = useLibrary()
  const [query, setQuery] = useState(qParam)
  const [genre, setGenre] = useState<Genre | ''>(initialGenre || '')

  useEffect(() => {
    setQuery(qParam)
  }, [qParam])
  const [author, setAuthor] = useState('')
  const [availability, setAvailability] = useState<
    '' | 'available' | 'borrowed'
  >('')

  const authors = useMemo(() => {
    const s = new Set(books.map((b) => b.author))
    return [...s].sort()
  }, [books])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return books.filter((b) => {
      if (genre && b.genre !== genre) return false
      if (author && b.author !== author) return false
      if (availability === 'available') {
        if (isBorrowed(b.id)) return false
        if ((b.availableCopies ?? 1) <= 0) return false
      }
      if (availability === 'borrowed' && !isBorrowed(b.id)) return false
      if (q) {
        const hay = `${b.title} ${b.author} ${b.genre}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [books, query, genre, author, availability, isBorrowed])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">Catalog</h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Explore every title. Filter by genre, author, or availability.
        </p>
      </div>

      {error ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <SearchBar
        placeholder="Filter by typing title, author…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        name="catalog-search"
      />

      <div className="flex flex-col gap-4 rounded-[20px] border border-slate-200/80 bg-[var(--color-card)] p-4 shadow-[var(--shadow-soft)] dark:border-slate-700 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[140px] flex-1 flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
          Genre
          <select
            value={genre}
            onChange={(e) => {
              const v = e.target.value as Genre | ''
              setGenre(v)
              if (v) setSearchParams({ genre: v })
              else setSearchParams({})
            }}
            className="rounded-2xl border border-slate-200 bg-[var(--color-page)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none ring-[var(--color-primary)]/25 focus:ring-2 dark:border-slate-600"
          >
            <option value="">All genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[160px] flex-1 flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
          Author
          <select
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-[var(--color-page)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none ring-[var(--color-primary)]/25 focus:ring-2 dark:border-slate-600"
          >
            <option value="">All authors</option>
            {authors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-[140px] flex-1 flex-col gap-1.5 text-sm font-medium text-[var(--color-text)]">
          Availability
          <select
            value={availability}
            onChange={(e) =>
              setAvailability(e.target.value as '' | 'available' | 'borrowed')
            }
            className="rounded-2xl border border-slate-200 bg-[var(--color-page)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none ring-[var(--color-primary)]/25 focus:ring-2 dark:border-slate-600"
          >
            {availabilityOptions.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-slate-300 bg-[var(--color-card)] px-8 py-16 text-center dark:border-slate-600">
          <p className="text-lg font-semibold text-[var(--color-text)]">
            No books match your filters
          </p>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Try clearing search or pick a different genre or author.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  )
}
