export type Genre =
  | 'Fiction'
  | 'Non-fiction'
  | 'Science'
  | 'Technology'

export type Book = {
  id: string
  title: string
  author: string
  description: string
  genre: Genre
  /** From API: copies left in library */
  availableCopies?: number
  /** Azure Blob or CDN URL */
  imageUrl?: string | null
}

export type BorrowRecord = {
  bookId: string
  dueDate: string
}

export type User = {
  id: string
  name: string
  email: string
  role?: string
}
