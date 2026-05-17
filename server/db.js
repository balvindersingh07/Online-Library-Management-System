import Database from 'better-sqlite3'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import mssql from 'mssql'

const __dirname = dirname(fileURLToPath(import.meta.url))

export function dbPath() {
  if (process.env.WEBSITE_INSTANCE_ID) return '/tmp/library.db'
  return join(__dirname, '..', 'library.db')
}

let _sqliteDb
let _sqlPool
let _schemaReady = false

export function dbProvider() {
  const raw = String(process.env.DB_PROVIDER || 'sqlite')
    .trim()
    .toLowerCase()
  if (raw === 'sqlite' || raw === 'sqlserver') return raw
  throw new Error(
    `[libra-api] Startup error: Unsupported DB_PROVIDER "${raw}". Use "sqlite" or "sqlserver".`,
  )
}

function sqlEncrypt() {
  const raw = String(process.env.SQL_ENCRYPT || 'true')
    .trim()
    .toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes'
}

function requiredEnv(name) {
  const v = String(process.env[name] || '').trim()
  if (!v) {
    throw new Error(
      `[libra-api] Startup error: ${name} is required when DB_PROVIDER=sqlserver.`,
    )
  }
  return v
}

function initSqliteIfNeeded() {
  if (!_sqliteDb) {
    _sqliteDb = new Database(dbPath())
    _sqliteDb.pragma('journal_mode = WAL')
    initSchemaSqlite(_sqliteDb)
  }
  return _sqliteDb
}

async function initSqlServerPoolIfNeeded() {
  if (_sqlPool) return _sqlPool
  const config = {
    server: requiredEnv('SQL_SERVER'),
    database: requiredEnv('SQL_DATABASE'),
    user: requiredEnv('SQL_USER'),
    password: requiredEnv('SQL_PASSWORD'),
    options: {
      encrypt: sqlEncrypt(),
      trustServerCertificate: false,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  }
  _sqlPool = await new mssql.ConnectionPool(config).connect()
  return _sqlPool
}

export async function getDb() {
  return dbProvider() === 'sqlserver'
    ? initSqlServerPoolIfNeeded()
    : initSqliteIfNeeded()
}

function initSchemaSqlite(db) {
  db.exec(`
    PRAGMA foreign_keys = ON;
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
    CREATE UNIQUE INDEX IF NOT EXISTS idx_borrow_active_unique
      ON borrow_records(user_id, book_id) WHERE returned = 0;
    CREATE TRIGGER IF NOT EXISTS trg_books_available_nonnegative_insert
      BEFORE INSERT ON books
      FOR EACH ROW
      WHEN NEW.available_copies < 0
    BEGIN
      SELECT RAISE(ABORT, 'available_copies cannot be negative');
    END;
    CREATE TRIGGER IF NOT EXISTS trg_books_available_nonnegative_update
      BEFORE UPDATE OF available_copies ON books
      FOR EACH ROW
      WHEN NEW.available_copies < 0
    BEGIN
      SELECT RAISE(ABORT, 'available_copies cannot be negative');
    END;
  `)
}

async function initSchemaSqlServer(pool) {
  await pool.request().query(`
    IF OBJECT_ID('dbo.users', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(320) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(32) NOT NULL CONSTRAINT DF_users_role DEFAULT 'user'
      );
    END;

    IF OBJECT_ID('dbo.books', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.books (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(512) NOT NULL,
        author NVARCHAR(255) NOT NULL,
        genre NVARCHAR(128) NOT NULL,
        description NVARCHAR(MAX) NOT NULL CONSTRAINT DF_books_description DEFAULT '',
        available_copies INT NOT NULL CONSTRAINT DF_books_available_copies DEFAULT 1,
        image_url NVARCHAR(2048) NULL
      );
    END;

    IF OBJECT_ID('dbo.borrow_records', 'U') IS NULL
    BEGIN
      CREATE TABLE dbo.borrow_records (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        due_date NVARCHAR(64) NOT NULL,
        returned BIT NOT NULL CONSTRAINT DF_borrow_records_returned DEFAULT 0,
        CONSTRAINT FK_borrow_records_user FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE,
        CONSTRAINT FK_borrow_records_book FOREIGN KEY (book_id) REFERENCES dbo.books(id) ON DELETE CASCADE
      );
    END;

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_borrow_user' AND object_id = OBJECT_ID('dbo.borrow_records'))
      CREATE INDEX idx_borrow_user ON dbo.borrow_records(user_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_borrow_book' AND object_id = OBJECT_ID('dbo.borrow_records'))
      CREATE INDEX idx_borrow_book ON dbo.borrow_records(book_id);

    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_borrow_active_unique' AND object_id = OBJECT_ID('dbo.borrow_records'))
      CREATE UNIQUE INDEX idx_borrow_active_unique ON dbo.borrow_records(user_id, book_id) WHERE returned = 0;

    IF NOT EXISTS (
      SELECT 1 FROM sys.check_constraints
      WHERE name = 'CK_books_available_nonnegative'
        AND parent_object_id = OBJECT_ID('dbo.books')
    )
      ALTER TABLE dbo.books
      ADD CONSTRAINT CK_books_available_nonnegative CHECK (available_copies >= 0);
  `)
}

export async function ensureSchema() {
  if (_schemaReady) return
  const db = await getDb()
  if (dbProvider() === 'sqlserver') {
    await initSchemaSqlServer(db)
  }
  _schemaReady = true
}

function buildSqlServerStatement(sql, params) {
  let i = 0
  const text = String(sql).replace(/\?/g, () => {
    i += 1
    return `@p${i}`
  })
  if (i !== params.length) {
    throw new Error('[libra-api] SQL parameter count mismatch')
  }
  return { text, names: Array.from({ length: i }, (_, x) => `p${x + 1}`) }
}

async function sqlServerRequest(sql, params) {
  const pool = await getDb()
  return sqlServerRequestWithFactory(pool, sql, params)
}

function sqlServerRequestWithFactory(factory, sql, params) {
  const { text, names } = buildSqlServerStatement(sql, params)
  const req = factory.request()
  names.forEach((name, idx) => {
    req.input(name, params[idx])
  })
  return req.query(text)
}

function isInsertStatement(sql) {
  return /^\s*insert\b/i.test(String(sql))
}

function changesFromRowsAffected(rowsAffected = []) {
  return rowsAffected.reduce((sum, n) => sum + Number(n || 0), 0)
}

export async function dbGet(sql, params = []) {
  await ensureSchema()
  if (dbProvider() === 'sqlserver') {
    const r = await sqlServerRequest(sql, params)
    return r.recordset?.[0]
  }
  const db = await getDb()
  return db.prepare(sql).get(...params)
}

export async function dbAll(sql, params = []) {
  await ensureSchema()
  if (dbProvider() === 'sqlserver') {
    const r = await sqlServerRequest(sql, params)
    return r.recordset || []
  }
  const db = await getDb()
  return db.prepare(sql).all(...params)
}

export async function dbRun(sql, params = []) {
  await ensureSchema()
  if (dbProvider() === 'sqlserver') {
    if (isInsertStatement(sql)) {
      const r = await sqlServerRequest(
        `${sql}; SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS lastInsertRowid;`,
        params,
      )
      const rec = r.recordset?.[0]
      return {
        changes: changesFromRowsAffected(r.rowsAffected),
        lastInsertRowid: rec?.lastInsertRowid ? Number(rec.lastInsertRowid) : 0,
      }
    }
    const r = await sqlServerRequest(sql, params)
    return { changes: changesFromRowsAffected(r.rowsAffected), lastInsertRowid: 0 }
  }
  const db = await getDb()
  const r = db.prepare(sql).run(...params)
  return { changes: Number(r.changes || 0), lastInsertRowid: Number(r.lastInsertRowid || 0) }
}

function createSqliteExecutor(db) {
  return {
    get(sql, params = []) {
      return db.prepare(sql).get(...params)
    },
    all(sql, params = []) {
      return db.prepare(sql).all(...params)
    },
    run(sql, params = []) {
      const r = db.prepare(sql).run(...params)
      return {
        changes: Number(r.changes || 0),
        lastInsertRowid: Number(r.lastInsertRowid || 0),
      }
    },
  }
}

function createSqlServerExecutor(transaction) {
  return {
    async get(sql, params = []) {
      const r = await sqlServerRequestWithFactory(transaction, sql, params)
      return r.recordset?.[0]
    },
    async all(sql, params = []) {
      const r = await sqlServerRequestWithFactory(transaction, sql, params)
      return r.recordset || []
    },
    async run(sql, params = []) {
      if (isInsertStatement(sql)) {
        const r = await sqlServerRequestWithFactory(
          transaction,
          `${sql}; SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS lastInsertRowid;`,
          params,
        )
        const rec = r.recordset?.[0]
        return {
          changes: changesFromRowsAffected(r.rowsAffected),
          lastInsertRowid: rec?.lastInsertRowid ? Number(rec.lastInsertRowid) : 0,
        }
      }
      const r = await sqlServerRequestWithFactory(transaction, sql, params)
      return { changes: changesFromRowsAffected(r.rowsAffected), lastInsertRowid: 0 }
    },
  }
}

export async function withTransaction(work) {
  await ensureSchema()
  if (dbProvider() === 'sqlserver') {
    const pool = await getDb()
    const tx = new mssql.Transaction(pool)
    await tx.begin()
    const exec = createSqlServerExecutor(tx)
    try {
      const out = await work(exec)
      await tx.commit()
      return out
    } catch (err) {
      try {
        await tx.rollback()
      } catch {
        /* ignore rollback error */
      }
      throw err
    }
  }

  const db = await getDb()
  db.exec('BEGIN IMMEDIATE')
  const exec = createSqliteExecutor(db)
  try {
    const out = await work(exec)
    db.exec('COMMIT')
    return out
  } catch (err) {
    try {
      db.exec('ROLLBACK')
    } catch {
      /* ignore rollback error */
    }
    throw err
  }
}
