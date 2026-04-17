import Database from 'better-sqlite3'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function dbPath() {
  if (process.env.WEBSITE_INSTANCE_ID) return '/tmp/library.db'
  return join(__dirname, '..', 'library.db')
}

let _db

export function getDb() {
  if (!_db) {
    _db = new Database(dbPath())
    _db.pragma('journal_mode = WAL')
    initSchema(_db)
  }
  return _db
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user'
    );
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      genre TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      available_copies INTEGER NOT NULL DEFAULT 1,
      image_url TEXT
    );
    CREATE TABLE IF NOT EXISTS borrow_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      due_date TEXT NOT NULL,
      returned INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_borrow_user ON borrow_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_borrow_book ON borrow_records(book_id);
  `)
}
