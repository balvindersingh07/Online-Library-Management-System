import { apiFetch } from './client'
import type { Book, BorrowRecord, Genre } from '../types'

const GENRES: Genre[] = ['Fiction', 'Non-fiction', 'Science', 'Technology']

function toGenre(g: string): Genre {
  return GENRES.includes(g as Genre) ? (g as Genre) : 'Fiction'
}

/** Raw book from REST API */
export type ApiBook = {
  id: number
  title: string
  author: string
  genre: string
  description: string
  available_copies: number
  image_url: string | null
}

export type ApiActiveBorrow = {
  id: number
  due_date: string
  returned: boolean
  book: ApiBook
}

export function mapApiBookToBook(b: ApiBook): Book {
  return {
    id: String(b.id),
    title: b.title,
    author: b.author,
    description: b.description,
    genre: toGenre(b.genre),
    availableCopies: b.available_copies,
    imageUrl: b.image_url,
  }
}

export async function fetchBooks(): Promise<Book[]> {
  const rows = await apiFetch<ApiBook[]>('/books', { auth: false })
  return rows.map(mapApiBookToBook)
}

export async function fetchMyBorrows(): Promise<
  { recordId: number; bookId: string; dueDate: string }[]
> {
  const rows = await apiFetch<ApiActiveBorrow[]>('/me/borrows')
  return rows.map((r) => ({
    recordId: r.id,
    bookId: String(r.book.id),
    dueDate: r.due_date.slice(0, 10),
  }))
}

export async function borrowBookApi(bookId: string): Promise<void> {
  await apiFetch(`/borrow/${encodeURIComponent(bookId)}`, { method: 'POST' })
}

export async function returnBookApi(bookId: string): Promise<void> {
  await apiFetch(`/return/${encodeURIComponent(bookId)}`, { method: 'POST' })
}

export async function createBookApi(
  body: Omit<Book, 'id'> & { availableCopies?: number },
): Promise<Book> {
  const payload = {
    title: body.title,
    author: body.author,
    genre: body.genre,
    description: body.description,
    available_copies: body.availableCopies ?? 1,
    image_url: body.imageUrl?.trim() ? body.imageUrl : null,
  }
  const b = await apiFetch<ApiBook>('/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return mapApiBookToBook(b)
}

export async function updateBookApi(book: Book): Promise<Book> {
  const payload = {
    title: book.title,
    author: book.author,
    genre: book.genre,
    description: book.description,
    available_copies: book.availableCopies ?? 1,
    image_url: book.imageUrl?.trim() ? book.imageUrl : null,
  }
  const b = await apiFetch<ApiBook>(`/books/${encodeURIComponent(book.id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return mapApiBookToBook(b)
}

export async function deleteBookApi(id: string): Promise<void> {
  await apiFetch(`/books/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

/** Map API borrow list to legacy BorrowRecord[] for UI */
export function borrowsToRecords(
  rows: { bookId: string; dueDate: string }[],
): BorrowRecord[] {
  return rows.map((r) => ({ bookId: r.bookId, dueDate: r.dueDate }))
}
