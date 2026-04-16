import { Link } from 'react-router-dom'
import type { Book } from '../../types'
import { bookCoverSrc } from '../../lib/covers'
import { StatusBadge } from '../ui/StatusBadge'
import { useLibrary } from '../../context/LibraryContext'

type Props = {
  book: Book
  className?: string
}

function cardStatus(book: Book, borrowedByMe: boolean): 'borrowed' | 'unavailable' | 'available' {
  const copies = book.availableCopies ?? 1
  if (borrowedByMe) return 'borrowed'
  if (copies <= 0) return 'unavailable'
  return 'available'
}

export function BookCard({ book, className = '' }: Props) {
  const { isBorrowed } = useLibrary()
  const borrowed = isBorrowed(book.id)
  const status = cardStatus(book, borrowed)

  return (
    <Link
      to={`/book/${book.id}`}
      className={`group block overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-soft)] ring-1 ring-slate-200/60 transition-card hover:-translate-y-1 hover:shadow-[var(--shadow-soft-lg)] dark:ring-slate-700 ${className}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={bookCoverSrc(book, 320, 480)}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute right-2 top-2">
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="p-4 text-left">
        <p className="line-clamp-2 text-base font-bold leading-snug text-[var(--color-text)]">
          {book.title}
        </p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{book.author}</p>
        <p className="mt-2 inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-[var(--color-muted)] dark:bg-slate-800">
          {book.genre}
        </p>
      </div>
    </Link>
  )
}
