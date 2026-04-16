# Libra Library API (FastAPI + Azure)

Production-oriented REST API for the Online Library Management System: **JWT auth**, **Azure SQL** (or local SQLite), **Azure Blob** for cover images, and **CORS** for the Vite frontend.

---

## Phase 1 — Project setup

**Explanation:** The backend follows a layered layout (`routes` → `services` → `models`) with shared `schemas` (Pydantic) and `database` (SQLAlchemy).

**Layout:**

```text
backend/
├── app/
│   ├── main.py              # FastAPI app, CORS, routers, lifespan
│   ├── config.py            # Settings from environment
│   ├── database.py          # Engine, SessionLocal, Base
│   ├── models/              # SQLAlchemy ORM
│   ├── schemas/             # Pydantic request/response models
│   ├── routes/              # HTTP endpoints
│   ├── services/            # Business logic & Azure Blob
│   └── utils/               # JWT, password hashing, dependencies
├── requirements.txt
└── .env.example
```

**Steps:**

1. Create a virtual environment (recommended):

   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Copy `.env.example` to `.env` and adjust secrets (see Phase 2).

4. Run the API:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. Open interactive docs: `http://localhost:8000/docs`

---

## Phase 2 — Database (Azure SQL or SQLite)

**Explanation:** `DATABASE_URL` is read from the environment. Use **SQLite** for local development without Azure. Use **Azure SQL** in production with the **Microsoft ODBC Driver 18 for SQL Server** and a `mssql+pyodbc` URL.

**Code:** See `app/database.py`, `app/models/*.py`.

**Models:**

| Table          | Fields |
|----------------|--------|
| `users`        | `id`, `email`, `password_hash`, `role` |
| `books`        | `id`, `title`, `author`, `genre`, `description`, `available_copies`, `image_url` |
| `borrow_records` | `id`, `user_id`, `book_id`, `due_date`, `returned` |

**Steps (Azure SQL):**

1. Create an Azure SQL Database and server firewall rule for your App Service or dev IP.
2. Install **ODBC Driver 18 for SQL Server** on the machine running the API.
3. Set `DATABASE_URL` in `.env`, URL-encoding special characters in the password:

   ```env
   DATABASE_URL=mssql+pyodbc://USER:PASSWORD@your-server.database.windows.net:1433/your-db?driver=ODBC+Driver+18+for+SQL+Server&Encrypt=yes
   ```

**Steps (local SQLite — default):**

```env
DATABASE_URL=sqlite:///./library.db
```

Tables are created on startup via `Base.metadata.create_all()` in `app/main.py`.

---

## Phase 3 — Authentication

**Explanation:** Passwords are hashed with **bcrypt** (via Passlib). **JWT** access tokens are issued on login; protected routes expect `Authorization: Bearer <token>`.

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register `{ "email", "password" }` |
| POST | `/auth/login` | Login → `{ access_token, token_type, user }` |
| GET | `/auth/me` | Current user (requires Bearer token) |

**Code:** `app/routes/auth.py`, `app/utils/security.py`, `app/services/auth_service.py`

**Steps:**

1. Register a user (password min 8 characters):

   ```bash
   curl -s -X POST http://localhost:8000/auth/register -H "Content-Type: application/json" -d "{\"email\":\"reader@example.com\",\"password\":\"password123\"}"
   ```

2. Promote an administrator (Azure Data Studio / `sqlcmd` / Query editor):

   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'reader@example.com';
   ```

---

## Phase 4 — Book APIs

**Explanation:** Public **read** access for the catalog; **create/update/delete** require `role = admin`.

| Method | Path | Auth |
|--------|------|------|
| GET | `/books` | Public |
| GET | `/books/{id}` | Public |
| POST | `/books` | Admin |
| PUT | `/books/{id}` | Admin |
| DELETE | `/books/{id}` | Admin |

**Code:** `app/routes/books.py`

**Example:**

```bash
curl -s http://localhost:8000/books
```

---

## Phase 5 — Borrow system

**Explanation:** Borrowing decrements `available_copies`, creates an active `borrow_records` row with `due_date = now + 14 days`. Returning marks the row `returned = true` and increments copies.

| Method | Path | Auth |
|--------|------|------|
| POST | `/borrow/{book_id}` | User |
| POST | `/return/{book_id}` | User |
| GET | `/me/borrows` | User — active loans with embedded book |

**Code:** `app/routes/borrow.py`, `app/services/borrow_service.py`

---

## Phase 6 — Azure Blob Storage

**Explanation:** If `AZURE_STORAGE_CONNECTION_STRING` is set, `POST /upload` (admin) accepts `multipart/form-data` file upload and returns `{ "url": "<public blob URL>" }`. Container name defaults to `book-covers` (`AZURE_BLOB_CONTAINER`).

**Code:** `app/routes/upload.py`, `app/services/blob_service.py`

**Steps:**

1. Create a Storage Account and container (or let the app create it on first upload).
2. Set in `.env`:

   ```env
   AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...
   AZURE_BLOB_CONTAINER=book-covers
   ```

---

## Phase 7 — Frontend integration

**Explanation:** The Vite app uses `VITE_API_BASE_URL` (no trailing slash). When unset, the UI falls back to the original in-browser mock data.

**Steps:**

1. In the project root, copy `.env.example` to `.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. Restart `npm run dev`.

3. Example fetch (browser or Node 18+):

   ```javascript
   const r = await fetch('http://localhost:8000/books')
   const books = await r.json()
   ```

   ```javascript
   const r = await fetch('http://localhost:8000/borrow/1', {
     method: 'POST',
     headers: {
       Authorization: 'Bearer ' + localStorage.getItem('libra-access-token'),
     },
   })
   ```

**CORS:** Configured in `app/main.py` via `CORS_ORIGINS` (comma-separated list).

---

## Phase 8 — Deployment (Azure App Service)

**Explanation:** Host FastAPI with **Gunicorn + Uvicorn workers** on Linux App Service, or use the **default** `uvicorn` startup for smaller dev slots.

**Steps:**

1. **Create** App Service (Python 3.11+), deploy the `backend` folder (ZIP, GitHub Actions, or container).
2. **Configuration → Application settings** (examples):

   | Name | Value |
   |------|--------|
   | `DATABASE_URL` | Azure SQL `mssql+pyodbc://...` |
   | `JWT_SECRET` | Long random string |
   | `AZURE_STORAGE_CONNECTION_STRING` | Blob connection string |
   | `CORS_ORIGINS` | `https://your-frontend.azurestaticapps.net` |
   | `WEBSITES_PORT` | `8000` (if required by your image) |

3. **Startup command** (example):

   ```bash
   gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 2
   ```

4. Install **ODBC Driver 18** in a **custom container** if the stock Python image does not include it.

---

## Phase 9 — Security checklist

- Passwords: **never** store plaintext; only `password_hash` (bcrypt).
- JWT: sign with a strong **`JWT_SECRET`**; use HTTPS in production.
- Admin routes: enforced via `require_admin` in `app/utils/deps.py`.
- SQL injection: use SQLAlchemy bound parameters only (no raw string SQL).
- Blob uploads: restrict to admin; validate file types/size in production (extend `upload.py`).

---

## Phase 10 — Sample requests (curl)

**Health:**

```bash
curl -s http://localhost:8000/health
```

**Login (save token):**

```bash
curl -s -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"reader@example.com\",\"password\":\"password123\"}"
```

**List books:**

```bash
curl -s http://localhost:8000/books
```

**Borrow book 1:**

```bash
curl -s -X POST http://localhost:8000/borrow/1 -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**My borrows:**

```bash
curl -s http://localhost:8000/me/borrows -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Admin — create book:**

```bash
curl -s -X POST http://localhost:8000/books -H "Authorization: Bearer ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"Demo\",\"author\":\"Author\",\"genre\":\"Fiction\",\"description\":\"...\",\"available_copies\":3}"
```

---

## Troubleshooting

- **`pyodbc` / driver errors:** Install ODBC Driver 18; verify `DATABASE_URL` driver name matches the installed driver.
- **403 on `/books` POST:** User is not `admin` — run the SQL `UPDATE` in Phase 3.
- **503 on `/upload`:** `AZURE_STORAGE_CONNECTION_STRING` missing or invalid.
- **CORS errors:** Add your frontend origin to `CORS_ORIGINS`.
