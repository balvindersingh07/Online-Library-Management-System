type Status = 'available' | 'borrowed' | 'unavailable'

const styles: Record<Status, string> = {
  available:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-950/50 dark:text-emerald-300',
  borrowed: 'bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-950/40 dark:text-red-300',
  unavailable:
    'bg-slate-100 text-slate-600 ring-slate-400/20 dark:bg-slate-800 dark:text-slate-300',
}

const labels: Record<Status, string> = {
  available: 'Available',
  borrowed: 'Borrowed',
  unavailable: 'Unavailable',
}

type Props = {
  status: Status
  className?: string
}

export function StatusBadge({ status, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles[status]} ${className}`}
    >
      {labels[status]}
    </span>
  )
}
