import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useLibrary } from '../context/LibraryContext'
import { bookCoverSrc } from '../lib/covers'
import { StatusBadge } from '../components/ui/StatusBadge'

export function AccountPage() {
  const { user } = useAuth()
  const { books, borrowed, returnBook } = useLibrary()

  const rows = borrowed
    .map((r) => {
      const b = books.find((x) => x.id === r.bookId)
      return b ? { book: b, due: r.dueDate } : null
    })
    .filter(Boolean) as { book: (typeof books)[0]; due: string }[]

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          My account
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Profile details and books you currently have on loan.
        </p>
      </div>

      <section className="rounded-[20px] border border-slate-200/80 bg-[var(--color-card)] p-6 shadow-[var(--shadow-soft)] dark:border-slate-700 sm:p-8">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Profile</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Name
            </dt>
            <dd className="mt-1 text-[var(--color-text)]">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
              Email
            </dt>
            <dd className="mt-1 text-[var(--color-text)]">{user?.email}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h2 className="text-lg font-bold text-[var(--color-text)]">
          Borrowed books
        </h2>
        {rows.length === 0 ? (
          <div className="mt-4 rounded-[20px] border border-dashed border-slate-300 bg-[var(--color-card)] px-6 py-12 text-center dark:border-slate-600">
            <p className="font-medium text-[var(--color-text)]">
              You have no borrowed books
            </p>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Browse the catalog and borrow a title to see it listed here.
            </p>
            <Link
              to="/catalog"
              className="mt-4 inline-block font-semibold text-[var(--color-primary)] hover:underline"
            >
              Go to catalog
            </Link>
          </div>
        ) : (
          <ul className="mt-4 space-y-4">
            {rows.map(({ book, due }) => (
              <li
                key={book.id}
                className="flex flex-col gap-4 rounded-[20px] border border-slate-200/80 bg-[var(--color-card)] p-4 shadow-[var(--shadow-soft)] ring-1 ring-slate-200/40 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:ring-slate-700"
              >
                <div className="flex gap-4">
                  <Link
                    to={`/book/${book.id}`}
                    className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={bookCoverSrc(book, 160, 240)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/book/${book.id}`}
                      className="font-bold text-[var(--color-text)] hover:text-[var(--color-primary)]"
                    >
                      {book.title}
                    </Link>
                    <p className="text-sm text-[var(--color-muted)]">
                      {book.author}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status="borrowed" />
                      <span className="text-sm text-[var(--color-muted)]">
                        Due{' '}
                        <span className="font-semibold text-[var(--color-text)]">
                          {due}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="secondary" onClick={() => returnBook(book.id)}>
                  Return
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
