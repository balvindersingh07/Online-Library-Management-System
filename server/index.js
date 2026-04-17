import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import swaggerUi from 'swagger-ui-express'
import { getDb } from './db.js'
import {
  createAccessToken,
  decodeTokenSafe,
  hashPassword,
  verifyPassword,
  userOut,
} from './auth.js'
import { uploadBytes } from './blob.js'
import { openApiSpec } from './openapi.js'
import { seedIfEmpty } from './seed.js'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
})

function corsOrigins() {
  const raw =
    process.env.CORS_ORIGINS ||
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173'
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function requireAuth(req, res, next) {
  const h = req.headers.authorization
  if (!h || !h.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ detail: 'Not authenticated' })
  }
  const payload = decodeTokenSafe(h.slice(7).trim())
  if (!payload?.sub) {
    return res.status(401).json({ detail: 'Invalid or expired token' })
  }
  const userId = parseInt(String(payload.sub), 10)
  if (Number.isNaN(userId)) {
    return res.status(401).json({ detail: 'Invalid token subject' })
  }
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
  if (!user) return res.status(401).json({ detail: 'User not found' })
  req.user = user
  next()
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ detail: 'Admin only' })
  }
  next()
}

function bookRowToOut(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    genre: row.genre,
    description: row.description,
    available_copies: row.available_copies,
    image_url: row.image_url,
  }
}

const app = express()
app.use(cors({ origin: corsOrigins(), credentials: true }))
app.use(express.json())

app.get('/', (req, res) => res.redirect(307, '/docs'))

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))
app.get('/openapi.json', (req, res) => res.json(openApiSpec))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.post('/auth/register', (req, res) => {
  const email = String(req.body?.email || '')
    .toLowerCase()
    .trim()
  const password = String(req.body?.password || '')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ detail: 'Invalid email' })
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ detail: 'Password too short' })
  }
  const db = getDb()
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(400).json({ detail: 'Email already registered' })
  }
  const hash = hashPassword(password)
  const r = db
    .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
    .run(email, hash, 'user')
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(r.lastInsertRowid)
  res.status(201).json(userOut(row))
})

app.post('/auth/login', (req, res) => {
  const email = String(req.body?.email || '')
    .toLowerCase()
    .trim()
  const password = String(req.body?.password || '')
  const db = getDb()
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ detail: 'Incorrect email or password' })
  }
  const token = createAccessToken(row.id, row.email, row.role)
  res.json({
    access_token: token,
    token_type: 'bearer',
    user: userOut(row),
  })
})

app.get('/auth/me', requireAuth, (req, res) => {
  res.json(userOut(req.user))
})

app.get('/books', (req, res) => {
  const db = getDb()
  const rows = db.prepare('SELECT * FROM books ORDER BY id').all()
  res.json(rows.map(bookRowToOut))
})

app.get('/books/:bookId', (req, res) => {
  const id = parseInt(req.params.bookId, 10)
  const db = getDb()
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ detail: 'Book not found' })
  res.json(bookRowToOut(row))
})

app.post('/books', requireAuth, requireAdmin, (req, res) => {
  const b = req.body || {}
  if (!String(b.title || '').trim()) {
    return res.status(422).json({ detail: [{ msg: 'title required' }] })
  }
  const db = getDb()
  const r = db
    .prepare(
      'INSERT INTO books (title, author, genre, description, available_copies, image_url) VALUES (?,?,?,?,?,?)',
    )
    .run(
      String(b.title).slice(0, 512),
      String(b.author || '').slice(0, 255),
      String(b.genre || '').slice(0, 128),
      String(b.description ?? ''),
      Math.max(0, Number(b.available_copies ?? 1)),
      b.image_url?.trim() ? String(b.image_url) : null,
    )
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(r.lastInsertRowid)
  res.status(201).json(bookRowToOut(row))
})

app.put('/books/:bookId', requireAuth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.bookId, 10)
  const db = getDb()
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ detail: 'Book not found' })
  const b = req.body || {}
  const title = b.title !== undefined ? String(b.title).slice(0, 512) : row.title
  const author = b.author !== undefined ? String(b.author).slice(0, 255) : row.author
  const genre = b.genre !== undefined ? String(b.genre).slice(0, 128) : row.genre
  const description =
    b.description !== undefined ? String(b.description) : row.description
  const ac =
    b.available_copies !== undefined
      ? Math.max(0, Number(b.available_copies))
      : row.available_copies
  const image_url =
    b.image_url !== undefined ? (b.image_url?.trim() ? String(b.image_url) : null) : row.image_url
  db.prepare(
    'UPDATE books SET title=?, author=?, genre=?, description=?, available_copies=?, image_url=? WHERE id=?',
  ).run(title, author, genre, description, ac, image_url, id)
  const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(id)
  res.json(bookRowToOut(updated))
})

app.delete('/books/:bookId', requireAuth, requireAdmin, (req, res) => {
  const id = parseInt(req.params.bookId, 10)
  const db = getDb()
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(id)
  if (!row) return res.status(404).json({ detail: 'Book not found' })
  db.prepare('DELETE FROM books WHERE id = ?').run(id)
  res.status(204).send()
})

app.post('/borrow/:bookId', requireAuth, (req, res) => {
  const bookId = parseInt(req.params.bookId, 10)
  const userId = req.user.id
  const db = getDb()
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId)
  if (!book) return res.status(404).json({ detail: 'Book not found' })
  if (book.available_copies <= 0) {
    return res.status(400).json({ detail: 'No copies available' })
  }
  const dup = db
    .prepare(
      'SELECT * FROM borrow_records WHERE user_id=? AND book_id=? AND returned=0',
    )
    .get(userId, bookId)
  if (dup) {
    return res.status(400).json({ detail: 'You already have this book borrowed' })
  }
  const due = new Date(Date.now() + 14 * 864e5).toISOString()
  db.prepare('UPDATE books SET available_copies = available_copies - 1 WHERE id = ?').run(
    bookId,
  )
  const ins = db
    .prepare(
      'INSERT INTO borrow_records (user_id, book_id, due_date, returned) VALUES (?,?,?,0)',
    )
    .run(userId, bookId, due)
  const rec = db.prepare('SELECT * FROM borrow_records WHERE id = ?').get(ins.lastInsertRowid)
  res.json({
    id: rec.id,
    book_id: rec.book_id,
    due_date: rec.due_date,
    returned: Boolean(rec.returned),
  })
})

app.post('/return/:bookId', requireAuth, (req, res) => {
  const bookId = parseInt(req.params.bookId, 10)
  const userId = req.user.id
  const db = getDb()
  const rec = db
    .prepare(
      'SELECT * FROM borrow_records WHERE user_id=? AND book_id=? AND returned=0',
    )
    .get(userId, bookId)
  if (!rec) {
    return res.status(400).json({ detail: 'No active loan for this book' })
  }
  db.prepare('UPDATE books SET available_copies = available_copies + 1 WHERE id = ?').run(
    bookId,
  )
  db.prepare('UPDATE borrow_records SET returned = 1 WHERE id = ?').run(rec.id)
  const updated = db.prepare('SELECT * FROM borrow_records WHERE id = ?').get(rec.id)
  res.json({
    id: updated.id,
    book_id: updated.book_id,
    due_date: updated.due_date,
    returned: Boolean(updated.returned),
  })
})

app.get('/me/borrows', requireAuth, (req, res) => {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT br.id as rid, br.due_date, br.returned,
              b.id as bid, b.title, b.author, b.genre, b.description, b.available_copies, b.image_url
       FROM borrow_records br JOIN books b ON b.id = br.book_id
       WHERE br.user_id = ? AND br.returned = 0 ORDER BY br.due_date`,
    )
    .all(req.user.id)
  const out = rows.map((r) => ({
    id: r.rid,
    due_date: r.due_date,
    returned: Boolean(r.returned),
    book: {
      id: r.bid,
      title: r.title,
      author: r.author,
      genre: r.genre,
      description: r.description,
      available_copies: r.available_copies,
      image_url: r.image_url,
    },
  }))
  res.json(out)
})

app.post(
  '/upload',
  requireAuth,
  requireAdmin,
  upload.single('file'),
  async (req, res) => {
    if (!req.file?.buffer?.length) {
      return res.status(400).json({ detail: 'Empty file' })
    }
    try {
      const url = await uploadBytes(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname || 'cover.bin',
      )
      res.json({ url })
    } catch (e) {
      res
        .status(503)
        .json({ detail: String(e?.message || e) || 'Blob storage not configured' })
    }
  },
)

getDb()
seedIfEmpty()
const port = Number(process.env.PORT || process.env.WEBSITES_PORT || 8000)
app.listen(port, '0.0.0.0', () => {
  console.log(`[libra-api] listening on 0.0.0.0:${port}`)
})
