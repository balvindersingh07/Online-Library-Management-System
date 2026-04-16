import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { initialBooks } from '../data/mockBooks'
import type { Book, BorrowRecord, Genre } from '../types'
import { isApiEnabled } from '../api/authApi'
import {
  borrowBookApi,
  borrowsToRecords,
  createBookApi,
  deleteBookApi,
  fetchBooks,
  fetchMyBorrows,
  returnBookApi,
  updateBookApi,
} from '../api/libraryApi'
import { getAccessToken } from '../api/client'

function addDaysISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

type LibraryContextValue = {
  books: Book[]
  borrowed: BorrowRecord[]
  loading: boolean
  error: string | null
  borrowBook: (bookId: string) => void | Promise<void>
  returnBook: (bookId: string) => void | Promise<void>
  addBook: (book: Omit<Book, 'id'>) => void | Promise<void>
  updateBook: (book: Book) => void | Promise<void>
  deleteBook: (id: string) => void | Promise<void>
  isBorrowed: (bookId: string) => boolean
  getDueDate: (bookId: string) => string | undefined
  refreshLibrary: () => Promise<void>
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

const BOOKS_KEY = 'libra-books'
const BORROWED_KEY = 'libra-borrowed'

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(BOOKS_KEY)
    if (raw) return JSON.parse(raw) as Book[]
  } catch {
    /* ignore */
  }
  return initialBooks
}

function loadBorrowed(): BorrowRecord[] {
  try {
    const raw = localStorage.getItem(BORROWED_KEY)
    if (raw) return JSON.parse(raw) as BorrowRecord[]
  } catch {
    /* ignore */
  }
  return []
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const useApi = isApiEnabled()
  const [books, setBooks] = useState<Book[]>(() =>
    useApi ? [] : loadBooks(),
  )
  const [borrowed, setBorrowed] = useState<BorrowRecord[]>(() =>
    useApi ? [] : loadBorrowed(),
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshLibrary = useCallback(async () => {
    if (!useApi) return
    setError(null)
    const list = await fetchBooks()
    setBooks(list)
    const token = getAccessToken()
    if (token) {
      const br = await fetchMyBorrows()
      setBorrowed(borrowsToRecords(br))
    } else {
      setBorrowed([])
    }
  }, [useApi])

  useEffect(() => {
    if (!useApi) {
      const t = window.setTimeout(() => setLoading(false), 400)
      return () => window.clearTimeout(t)
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await refreshLibrary()
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load library')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [useApi, refreshLibrary])

  useEffect(() => {
    if (!useApi) return
    const onAuth = () => {
      void refreshLibrary()
    }
    window.addEventListener('libra-auth-changed', onAuth)
    return () => window.removeEventListener('libra-auth-changed', onAuth)
  }, [useApi, refreshLibrary])

  useEffect(() => {
    if (useApi) return
    localStorage.setItem(BOOKS_KEY, JSON.stringify(books))
  }, [books, useApi])

  useEffect(() => {
    if (useApi) return
    localStorage.setItem(BORROWED_KEY, JSON.stringify(borrowed))
  }, [borrowed, useApi])

  const isBorrowed = useCallback(
    (bookId: string) => borrowed.some((b) => b.bookId === bookId),
    [borrowed],
  )

  const getDueDate = useCallback(
    (bookId: string) => borrowed.find((b) => b.bookId === bookId)?.dueDate,
    [borrowed],
  )

  const borrowBook = useCallback(
    async (bookId: string) => {
      if (useApi) {
        await borrowBookApi(bookId)
        await refreshLibrary()
        return
      }
      setBorrowed((prev) => {
        if (prev.some((b) => b.bookId === bookId)) return prev
        return [...prev, { bookId, dueDate: addDaysISO(14) }]
      })
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? {
                ...b,
                availableCopies: Math.max(0, (b.availableCopies ?? 1) - 1),
              }
            : b,
        ),
      )
    },
    [useApi, refreshLibrary],
  )

  const returnBook = useCallback(
    async (bookId: string) => {
      if (useApi) {
        await returnBookApi(bookId)
        await refreshLibrary()
        return
      }
      setBorrowed((prev) => prev.filter((b) => b.bookId !== bookId))
      setBooks((prev) =>
        prev.map((b) =>
          b.id === bookId
            ? { ...b, availableCopies: (b.availableCopies ?? 1) + 1 }
            : b,
        ),
      )
    },
    [useApi, refreshLibrary],
  )

  const addBook = useCallback(
    async (book: Omit<Book, 'id'>) => {
      if (useApi) {
        const created = await createBookApi({
          ...book,
          availableCopies: book.availableCopies ?? 1,
        })
        setBooks((prev) => [...prev, created])
        return
      }
      setBooks((prev) => {
        const id = String(
          Math.max(0, ...prev.map((b) => Number(b.id) || 0)) + 1,
        )
        return [
          ...prev,
          {
            ...book,
            id,
            availableCopies: book.availableCopies ?? 1,
          },
        ]
      })
    },
    [useApi],
  )

  const updateBook = useCallback(
    async (book: Book) => {
      if (useApi) {
        const updated = await updateBookApi(book)
        setBooks((prev) => prev.map((b) => (b.id === book.id ? updated : b)))
        return
      }
      setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)))
    },
    [useApi],
  )

  const deleteBook = useCallback(
    async (id: string) => {
      if (useApi) {
        await deleteBookApi(id)
        setBooks((prev) => prev.filter((b) => b.id !== id))
        setBorrowed((prev) => prev.filter((b) => b.bookId !== id))
        return
      }
      setBooks((prev) => prev.filter((b) => b.id !== id))
      setBorrowed((prev) => prev.filter((b) => b.bookId !== id))
    },
    [useApi],
  )

  const value = useMemo(
    () => ({
      books,
      borrowed,
      loading,
      error,
      borrowBook,
      returnBook,
      addBook,
      updateBook,
      deleteBook,
      isBorrowed,
      getDueDate,
      refreshLibrary,
    }),
    [
      books,
      borrowed,
      loading,
      error,
      borrowBook,
      returnBook,
      addBook,
      updateBook,
      deleteBook,
      isBorrowed,
      getDueDate,
      refreshLibrary,
    ],
  )

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  )
}

export function useLibrary() {
  const ctx = useContext(LibraryContext)
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider')
  return ctx
}

export type { Genre }
