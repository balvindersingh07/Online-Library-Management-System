import { dbGet, dbRun } from './db.js'
import { hashPassword } from './auth.js'

/** Same catalog as `src/data/mockBooks.ts` (IDs assigned by SQLite). */
const DEMO_BOOKS = [
  [
    'Atomic Habits',
    'James Clear',
    'Productivity',
    'A practical guide to building better habits through small, consistent behavior changes.',
    7,
    'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
  ],
  [
    "Harry Potter and the Sorcerer's Stone",
    'J.K. Rowling',
    'Fantasy',
    'Harry discovers he is a wizard and begins his first year at Hogwarts School of Witchcraft and Wizardry.',
    8,
    'https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg',
  ],
  [
    'The Psychology of Money',
    'Morgan Housel',
    'Psychology',
    'Practical lessons on behavior, risk, and why long-term financial success is mostly about mindset.',
    7,
    'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg',
  ],
  [
    'Rich Dad Poor Dad',
    'Robert T. Kiyosaki',
    'Business',
    'A bestselling introduction to financial literacy, asset building, and money-thinking frameworks.',
    6,
    'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg',
  ],
  [
    'Deep Work',
    'Cal Newport',
    'Productivity',
    'Explains how focused, distraction-free work creates outsized value in a noisy digital world.',
    5,
    'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg',
  ],
  [
    'Clean Code',
    'Robert C. Martin',
    'Technology',
    'A software engineering handbook on writing readable, maintainable, and professional code.',
    6,
    'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
  ],
  [
    'Sapiens',
    'Yuval Noah Harari',
    'Non-fiction',
    'A global history of Homo sapiens from ancient foragers to modern technological civilizations.',
    6,
    'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg',
  ],
  [
    'The Hobbit',
    'J.R.R. Tolkien',
    'Fantasy',
    'Bilbo Baggins joins a quest to reclaim a lost dwarven kingdom from the dragon Smaug.',
    6,
    'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg',
  ],
  [
    'The Alchemist',
    'Paulo Coelho',
    'Fiction',
    'A timeless novel about purpose, courage, and following one’s personal legend.',
    5,
    'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg',
  ],
  [
    'Ikigai',
    'Hector Garcia and Francesc Miralles',
    'Self-help',
    'A concise guide to purposeful living inspired by Japanese longevity and lifestyle philosophy.',
    4,
    'https://covers.openlibrary.org/b/isbn/9780143130727-L.jpg',
  ],
  [
    'The Lean Startup',
    'Eric Ries',
    'Business',
    'Introduces build-measure-learn loops for creating products quickly while reducing startup risk.',
    5,
    'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg',
  ],
  [
    'Zero to One',
    'Peter Thiel',
    'Business',
    'A contrarian guide to building innovative companies that create new markets, not just competition.',
    4,
    'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg',
  ],
  [
    "Can't Hurt Me",
    'David Goggins',
    'Self-help',
    'An intense memoir on mental toughness, discipline, and pushing beyond perceived limits.',
    5,
    'https://covers.openlibrary.org/b/isbn/9781544512280-L.jpg',
  ],
  [
    'The 48 Laws of Power',
    'Robert Greene',
    'Business',
    'A modern classic on influence, strategy, and real-world power dynamics.',
    4,
    'https://covers.openlibrary.org/b/isbn/9780140280197-L.jpg',
  ],
  [
    'Think and Grow Rich',
    'Napoleon Hill',
    'Self-help',
    'A foundational self-improvement title on goal clarity, persistence, and achievement psychology.',
    5,
    'https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg',
  ],
  [
    'The Pragmatic Programmer',
    'Andrew Hunt and David Thomas',
    'Technology',
    'Timeless software development principles for craftsmanship, debugging, and long-term code quality.',
    5,
    'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg',
  ],
  [
    'The Silent Patient',
    'Alex Michaelides',
    'Fiction',
    'A bestselling psychological thriller centered on trauma, silence, and a shocking reveal.',
    5,
    'https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg',
  ],
  [
    'Dune',
    'Frank Herbert',
    'Fantasy',
    'Epic science-fantasy saga of politics, prophecy, and survival on the desert world Arrakis.',
    6,
    'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg',
  ],
  [
    'The Great Gatsby',
    'F. Scott Fitzgerald',
    'Fiction',
    'A classic portrait of ambition, love, and illusion in the glittering Jazz Age.',
    5,
    'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg',
  ],
  [
    'To Kill a Mockingbird',
    'Harper Lee',
    'Fiction',
    'A landmark novel on justice, empathy, and moral courage in a divided community.',
    6,
    'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg',
  ],
  [
    'Thinking, Fast and Slow',
    'Daniel Kahneman',
    'Psychology',
    'Explains two modes of thinking and how cognitive biases affect judgment and decision-making.',
    4,
    'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg',
  ],
]

export async function seedIfEmpty() {
  const row = await dbGet('SELECT COUNT(*) AS c FROM books')
  const c = Number(row?.c || 0)
  if (c > 0) return
  for (const row of DEMO_BOOKS) {
    await dbRun(
      'INSERT INTO books (title, author, genre, description, available_copies, image_url) VALUES (?,?,?,?,?,?)',
      row,
    )
  }
  console.log(`[libra-api] seeded ${DEMO_BOOKS.length} demo books (empty catalog)`)
}

/**
 * Creates a dev admin if missing (local / non-production by default).
 * Set SEED_DEV_ADMIN=0 to disable, or SEED_DEV_ADMIN=1 on production for first boot only.
 */
export async function seedDevAdminIfMissing() {
  const disabled =
    process.env.SEED_DEV_ADMIN === '0' || process.env.SEED_DEV_ADMIN === 'false'
  if (disabled) return

  const enabledExplicit =
    process.env.SEED_DEV_ADMIN === '1' || process.env.SEED_DEV_ADMIN === 'true'
  const isProd = process.env.NODE_ENV === 'production'
  if (isProd && !enabledExplicit) return

  const email = String(process.env.DEV_ADMIN_EMAIL || 'admin@libra.local')
    .toLowerCase()
    .trim()
  const password = String(process.env.DEV_ADMIN_PASSWORD || 'LibraAdmin123!')
  const hash = hashPassword(password)

  const row = await dbGet('SELECT id, role FROM users WHERE email = ?', [email])

  const allowRepair = enabledExplicit || !isProd

  if (!row) {
    await dbRun('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [
      email,
      hash,
      'admin',
    ])
    console.log(
      `[libra-api] seeded dev admin user ${email} (set SEED_DEV_ADMIN=0 after first login; change password in production)`,
    )
    return
  }

  if (!allowRepair) return

  if (row.role === 'admin') {
    const resync =
      process.env.DEV_ADMIN_RESYNC === '1' ||
      process.env.DEV_ADMIN_RESYNC === 'true'
    if (resync) {
      await dbRun('UPDATE users SET password_hash = ? WHERE email = ?', [
        hash,
        email,
      ])
      console.log(`[libra-api] resynced dev admin password for ${email}`)
    }
    return
  }

  await dbRun('UPDATE users SET role = ?, password_hash = ? WHERE email = ?', [
    'admin',
    hash,
    email,
  ])
  console.log(
    `[libra-api] dev admin ${email}: promoted from "${row.role}" to admin and set dev password (was blocking staff login after reader signup)`,
  )
}
