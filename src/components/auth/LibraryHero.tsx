/** Decorative SVG illustration for auth split panel */
export function LibraryHero() {
  return (
    <div className="relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-[20px] bg-gradient-to-br from-[var(--color-primary)] via-indigo-600 to-violet-700 p-8 text-white shadow-[var(--shadow-soft-lg)] md:min-h-0">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-8 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10">
        <p className="text-sm font-medium uppercase tracking-widest text-white/80">
          Online Library
        </p>
        <h1 className="mt-2 max-w-sm text-3xl font-bold leading-tight sm:text-4xl">
          Your next chapter starts here.
        </h1>
        <p className="mt-4 max-w-sm text-sm text-white/85">
          Discover fiction, science, and technology titles. Borrow in seconds and
          track due dates from one calm, modern place.
        </p>
      </div>

      <div className="relative z-10 mt-8 flex items-end justify-center gap-3">
        <svg
          viewBox="0 0 400 240"
          className="h-auto w-full max-w-md drop-shadow-xl"
          aria-hidden
        >
          <defs>
            <linearGradient id="shelf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="book1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
            <linearGradient id="book2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
            <linearGradient id="book3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <rect x="40" y="160" width="320" height="12" rx="4" fill="url(#shelf)" />
          <rect x="40" y="100" width="320" height="12" rx="4" fill="url(#shelf)" />
          <rect x="60" y="52" width="44" height="108" rx="6" fill="url(#book1)" />
          <rect x="118" y="40" width="52" height="120" rx="6" fill="url(#book2)" />
          <rect x="184" y="60" width="40" height="100" rx="6" fill="url(#book3)" />
          <rect x="236" y="48" width="48" height="112" rx="6" fill="#f1f5f9" />
          <rect x="296" y="56" width="36" height="104" rx="6" fill="#38bdf8" />
          <rect x="70" y="112" width="48" height="108" rx="6" fill="#f97316" />
          <rect x="132" y="124" width="44" height="96" rx="6" fill="#ec4899" />
          <rect x="192" y="108" width="52" height="112" rx="6" fill="#4f46e5" />
          <rect x="256" y="116" width="40" height="104" rx="6" fill="#14b8a6" />
          <rect x="312" y="128" width="44" height="92" rx="6" fill="#eab308" />
          <ellipse cx="200" cy="228" rx="140" ry="8" fill="black" opacity="0.15" />
        </svg>
      </div>
    </div>
  )
}
