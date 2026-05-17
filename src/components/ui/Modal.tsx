import { useEffect, useState, type ReactNode } from 'react'
import { Button } from './Button'

type Props = {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  onClose: () => void
  variant?: 'primary' | 'danger'
}

export function Modal({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  variant = 'primary',
}: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    setBusy(false)
    setError(null)
    onClose()
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close dialog"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-[20px] bg-[var(--color-card)] p-6 shadow-[var(--shadow-soft-lg)] ring-1 ring-slate-200/60 dark:ring-slate-700">
        <h2
          id="modal-title"
          className="text-lg font-bold text-[var(--color-text)]"
        >
          {title}
        </h2>
        {children ? (
          <div className="mt-3 text-sm text-[var(--color-muted)]">{children}</div>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={handleClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              setError(null)
              try {
                await Promise.resolve(onConfirm())
                handleClose()
              } catch (err) {
                const msg =
                  err instanceof Error
                    ? err.message
                    : typeof err === 'string'
                      ? err
                      : 'Request failed. Please try again.'
                setError(msg)
              } finally {
                setBusy(false)
              }
            }}
          >
            {busy ? 'Please wait...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
