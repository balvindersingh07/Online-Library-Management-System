import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { StatusBadge } from '../components/ui/StatusBadge'
import { bookCoverSrc } from '../lib/covers'
import { useLibrary } from '../context/LibraryContext'
import { useAuth } from '../context/AuthContext'

export function BookDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { books, borrowBook, returnBook, isBorrowed, getDueDate, loading } =
    useLibrary()
  const [borrowOpen, setBorrowOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)

  const book = useMemo(
    () => books.find((b) => b.id === id),
    [books, id],
  )

  const borrowed = book ? isBorrowed(book.id) : false
  const due = book ? getDueDate(book.id) : undefined
  const copies = book?.availableCopies ?? 1
  const detailStatus = book
    ? borrowed
      ? 'borrowed'
      : copies <= 0
        ? 'unavailable'
        : 'available'
    : 'available'
  const canBorrow = book && !borrowed && copies > 0

  if (!loading && !book) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-[var(--color-card)] p-12 text-center shadow-[var(--shadow-soft)] dark:border-slate-700">
        <p className="text-lg font-semibold text-[var(--color-text)]">
          Book not found
        </p>
        <Link
          to="/catalog"
          className="mt-4 inline-block font-medium text-[var(--color-primary)] hover:underline"
        >
          Back to catalog
        </Link>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-2/3 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,320px),1fr]">
          <div className="aspect-[2/3] rounded-[20px] bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-3">
            <div className="h-6 w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-6 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    )
  }

  function requireAuth(): boolean {
    if (!user) {
      navigate('/login', {
        state: { from: { pathname: id ? `/book/${id}` : '/catalog' } },
      })
      return false
    }
    return true
  }

  return (
    <div className="space-y-8">
      <nav className="text-sm text-[var(--color-muted)]">
        <Link to="/catalog" className="hover:text-[var(--color-primary)]">
          Catalog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--color-text)]">{book.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,340px),1fr] lg:items-start">
        <div className="overflow-hidden rounded-[20px] bg-[var(--color-card)] shadow-[var(--shadow-soft-lg)] ring-1 ring-slate-200/60 dark:ring-slate-700">
          <img
            src={bookCoverSrc(book, 480, 720)}
            alt=""
            className="aspect-[2/3] w-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
                {book.title}
              </h1>
              <StatusBadge status={detailStatus} />
            </div>
            <p className="mt-2 text-lg text-[var(--color-muted)]">{book.author}</p>
            <p className="mt-3 inline-block rounded-xl bg-slate-100 px-3 py-1 text-sm font-medium text-[var(--color-muted)] dark:bg-slate-800">
              {book.genre}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-muted)]">
              About
            </h2>
            <p className="mt-2 max-w-2xl leading-relaxed text-[var(--color-text)]">
              {book.description}
            </p>
          </div>

          {borrowed && due ? (
            <p className="text-sm text-[var(--color-muted)]">
              Due date:{' '}
              <span className="font-semibold text-[var(--color-text)]">
                {due}
              </span>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              disabled={!canBorrow}
              onClick={() => {
                if (!requireAuth()) return
                if (canBorrow) setBorrowOpen(true)
              }}
            >
              Borrow book
            </Button>
            <Button
              variant="secondary"
              disabled={!borrowed}
              onClick={() => {
                if (!requireAuth()) return
                if (borrowed) setReturnOpen(true)
              }}
            >
              Return book
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={borrowOpen}
        onClose={() => setBorrowOpen(false)}
        title="Confirm borrow"
        confirmLabel="Borrow"
        onConfirm={() => borrowBook(book.id)}
      >
        You are borrowing <strong>{book.title}</strong> for 14 days. You can
        return it early from this page or My Account.
      </Modal>

      <Modal
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        title="Confirm return"
        confirmLabel="Return"
        variant="danger"
        onConfirm={() => returnBook(book.id)}
      >
        Mark <strong>{book.title}</strong> as returned? It will become available
        in the catalog again.
      </Modal>
    </div>
  )
}
