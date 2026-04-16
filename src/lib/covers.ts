import type { Book } from '../types'

export function bookCoverUrl(bookId: string, w = 400, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(bookId)}/${w}/${h}`
}

/** Prefer uploaded blob URL when present. */
export function bookCoverSrc(book: Book, w: number, h: number): string {
  if (book.imageUrl) return book.imageUrl
  return bookCoverUrl(book.id, w, h)
}
