import type { InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  className?: string
  onSearch?: (value: string) => void
}

export function SearchBar({
  className = '',
  placeholder = 'Search books, authors…',
  onSearch,
  onChange,
  ...rest
}: Props) {
  return (
    <div
      className={`relative flex w-full max-w-2xl items-center ${className}`}
    >
      <span
        className="pointer-events-none absolute left-4 text-[var(--color-muted)]"
        aria-hidden
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.2-5.2M10 18a8 8 0 110-16 8 8 0 010 16z"
          />
        </svg>
      </span>
      <input
        type="search"
        className="w-full rounded-2xl border border-slate-200/80 bg-[var(--color-card)] py-3 pl-12 pr-4 text-sm text-[var(--color-text)] shadow-[var(--shadow-soft)] outline-none ring-[var(--color-primary)]/30 transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:ring-2 dark:border-slate-600"
        placeholder={placeholder}
        onChange={(e) => {
          onSearch?.(e.target.value)
          onChange?.(e)
        }}
        {...rest}
      />
    </div>
  )
}
