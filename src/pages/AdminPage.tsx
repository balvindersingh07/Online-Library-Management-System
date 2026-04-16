import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { useLibrary } from '../context/LibraryContext'
import type { Book, Genre } from '../types'
import { ApiError } from '../api/client'

const genres: Genre[] = [
  'Fiction',
  'Non-fiction',
  'Science',
  'Technology',
]

const emptyForm: Omit<Book, 'id'> = {
  title: '',
  author: '',
  description: '',
  genre: 'Fiction',
  availableCopies: 1,
  imageUrl: '',
}

export function AdminPage() {
  const { books, addBook, updateBook, deleteBook } = useLibrary()
  const [editing, setEditing] = useState<Book | null>(null)
  const [form, setForm] = useState<Omit<Book, 'id'>>(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  function startCreate() {
    setEditing(null)
    setForm(emptyForm)
    setFormError(null)
  }

  function startEdit(book: Book) {
    setEditing(book)
    setForm({
      title: book.title,
      author: book.author,
      description: book.description,
      genre: book.genre,
      availableCopies: book.availableCopies ?? 1,
      imageUrl: book.imageUrl ?? '',
    })
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.author.trim()) return
    setFormError(null)
    try {
      if (editing) {
        await updateBook({
          ...editing,
          ...form,
          imageUrl: form.imageUrl || null,
        })
      } else {
        await addBook({
          ...form,
          imageUrl: form.imageUrl || null,
        })
      }
      startCreate()
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Request failed'
      setFormError(msg)
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          Admin panel
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Add, edit, or remove books (requires an admin account in the API).
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),340px]">
        <div className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-[var(--color-card)] shadow-[var(--shadow-soft)] dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text)]">
                    Title
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text)]">
                    Author
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text)]">
                    Genre
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text)]">
                    Copies
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                      {b.title}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">
                      {b.author}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">
                      {b.genre}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted)]">
                      {b.availableCopies ?? 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => startEdit(b)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          className="!px-3 !py-1.5 text-xs"
                          onClick={() => {
                            if (
                              confirm(
                                `Delete “${b.title}”? This cannot be undone.`,
                              )
                            ) {
                              void Promise.resolve(deleteBook(b.id)).catch(
                                () => {
                                  /* optional: toast */
                                },
                              )
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="sticky top-24 space-y-4 rounded-[20px] border border-slate-200/80 bg-[var(--color-card)] p-6 shadow-[var(--shadow-soft)] dark:border-slate-700"
          >
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              {editing ? 'Edit book' : 'Add book'}
            </h2>
            {formError ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
                {formError}
              </p>
            ) : null}
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Title
              <input
                required
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-[var(--color-page)] px-3 py-2 text-sm dark:border-slate-600"
              />
            </label>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Author
              <input
                required
                value={form.author}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-[var(--color-page)] px-3 py-2 text-sm dark:border-slate-600"
              />
            </label>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Genre
              <select
                value={form.genre}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    genre: e.target.value as Genre,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-[var(--color-page)] px-3 py-2 text-sm dark:border-slate-600"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Available copies
              <input
                type="number"
                min={0}
                required
                value={form.availableCopies ?? 1}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    availableCopies: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-[var(--color-page)] px-3 py-2 text-sm dark:border-slate-600"
              />
            </label>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Cover image URL
              <input
                type="url"
                value={form.imageUrl ?? ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, imageUrl: e.target.value }))
                }
                placeholder="https://… (from POST /upload)"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-[var(--color-page)] px-3 py-2 text-sm dark:border-slate-600"
              />
            </label>
            <label className="block text-sm font-medium text-[var(--color-text)]">
              Description
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="mt-1 w-full resize-y rounded-xl border border-slate-200 bg-[var(--color-page)] px-3 py-2 text-sm dark:border-slate-600"
              />
            </label>
            <div className="flex gap-2 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                {editing ? 'Save changes' : 'Add book'}
              </Button>
              {editing ? (
                <Button type="button" variant="ghost" onClick={startCreate}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>

          <div className="mt-6 rounded-[20px] border border-dashed border-slate-300 bg-slate-50/50 p-4 text-sm text-[var(--color-muted)] dark:border-slate-600 dark:bg-slate-900/40">
            <p className="font-semibold text-[var(--color-text)]">
              User management
            </p>
            <p className="mt-2">
              Promote a librarian with SQL:{' '}
              <code className="text-xs text-[var(--color-text)]">
                UPDATE users SET role=&apos;admin&apos; WHERE email=&apos;…&apos;;
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
