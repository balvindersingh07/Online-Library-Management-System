import { getDb } from './db.js'
import { hashPassword } from './auth.js'

/** Same catalog as `src/data/mockBooks.ts` (IDs assigned by SQLite). */
const DEMO_BOOKS = [
  ['The Midnight Library', 'Matt Haig', 'Fiction', 'Between life and death there is a library, and within that library, the shelves go on forever.', 3, null],
  ['Sapiens', 'Yuval Noah Harari', 'Non-fiction', 'A brief history of humankind — from the Stone Age to the Silicon Age.', 3, null],
  ['A Brief History of Time', 'Stephen Hawking', 'Science', 'Explores fundamental questions about the universe, black holes, and time.', 3, null],
  ['Clean Code', 'Robert C. Martin', 'Technology', 'A handbook of agile software craftsmanship with principles for readable, maintainable code.', 3, null],
  ['Project Hail Mary', 'Andy Weir', 'Science', 'A lone astronaut races against time to save Earth in this science-driven thriller.', 3, null],
  ['Educated', 'Tara Westover', 'Non-fiction', 'A memoir about family, survival, and the transformative power of education.', 3, null],
  ['The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 'Fiction', 'A reclusive Hollywood legend finally tells her unforgettable life story.', 3, null],
  ['Designing Data-Intensive Applications', 'Martin Kleppmann', 'Technology', 'Foundations for building reliable, scalable, and maintainable data systems.', 3, null],
  ['Thinking, Fast and Slow', 'Daniel Kahneman', 'Non-fiction', 'How intuition and deliberation shape our judgments and decisions.', 3, null],
  ['Dune', 'Frank Herbert', 'Fiction', 'Epic science fiction set on the desert planet Arrakis and its precious spice.', 3, null],
  ['The Gene', 'Siddhartha Mukherjee', 'Science', 'An intimate history of heredity, medicine, and what makes us human.', 3, null],
  ['Refactoring', 'Martin Fowler', 'Technology', 'Improving the design of existing code with safe, incremental techniques.', 3, null],
]

export function seedIfEmpty() {
  const db = getDb()
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM books').get()
  if (c > 0) return
  const ins = db.prepare(
    'INSERT INTO books (title, author, genre, description, available_copies, image_url) VALUES (?,?,?,?,?,?)',
  )
  for (const row of DEMO_BOOKS) {
    ins.run(...row)
  }
  console.log(`[libra-api] seeded ${DEMO_BOOKS.length} demo books (empty catalog)`)
}

/**
 * Creates a dev admin if missing (local / non-production by default).
 * Set SEED_DEV_ADMIN=0 to disable, or SEED_DEV_ADMIN=1 on production for first boot only.
 */
export function seedDevAdminIfMissing() {
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

  const db = getDb()
  const row = db
    .prepare('SELECT id, role FROM users WHERE email = ?')
    .get(email)

  const allowRepair = enabledExplicit || !isProd

  if (!row) {
    db.prepare(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    ).run(email, hash, 'admin')
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
      db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(
        hash,
        email,
      )
      console.log(`[libra-api] resynced dev admin password for ${email}`)
    }
    return
  }

  db.prepare(
    'UPDATE users SET role = ?, password_hash = ? WHERE email = ?',
  ).run('admin', hash, email)
  console.log(
    `[libra-api] dev admin ${email}: promoted from "${row.role}" to admin and set dev password (was blocking staff login after reader signup)`,
  )
}
