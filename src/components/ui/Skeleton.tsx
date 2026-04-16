type Props = {
  className?: string
}

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/90 dark:bg-slate-700/80 ${className}`}
      aria-hidden
    />
  )
}

export function BookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-[var(--color-card)] shadow-[var(--shadow-soft)] ring-1 ring-slate-200/50 dark:ring-slate-700">
      <Skeleton className="aspect-[2/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  )
}
