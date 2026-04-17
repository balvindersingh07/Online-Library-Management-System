# Online Library Management System — Course submission pack

This file fills gaps from the capstone checklist: **setup steps**, **features + pseudo-code**, **cost outline**, **security**, **performance**. The **architecture diagram** stays in [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 1. Architecture (deliverable: diagram)

See **Mermaid diagram** in [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md): Browser → **Azure App Service** (Node / Express) → **SQLite (or Azure SQL)** + **Azure Blob Storage**.

---

## 2. Azure setup — steps & configuration

### 2.1 Compute — Azure App Service (Node.js)

1. Portal → **Create a resource** → **Web App**.
2. **Runtime stack:** **Node 20 LTS**.
3. **Operating system:** Linux.
4. **Region:** e.g. Central India.
5. **Pricing plan:** **F1 Free** (dev) or **B1** (low-cost always-on).
6. After create → **Configuration** → **Stack settings** → **Startup command:** `npm start`
7. **Environment variables:** `SCM_DO_BUILD_DURING_DEPLOYMENT` = `1`; `WEBSITE_WEBDEPLOY_USE_SCM` = `true`; `JWT_SECRET`; `CORS_ORIGINS`; optional `AZURE_STORAGE_CONNECTION_STRING` (see `.env.example`).
8. **GitHub Actions:** repository secret `AZURE_WEBAPP_PUBLISH_PROFILE`; workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) deploys the repo root.

### 2.2 Database — SQLite (default) or Azure SQL

Current API uses **SQLite** (`better-sqlite3`): `/tmp/library.db` on App Service, `./library.db` locally. To use **Azure SQL** later, migrate with a Node SQL client (e.g. `mssql` / Prisma) and replace `server/db.js`.

### 2.3 Storage — Azure Blob (book covers)

1. Portal → **Storage account** → create (LRS, Hot tier is enough for coursework).
2. **Containers** → create container (e.g. `book-covers`).
3. **Access:** use **connection string** in App Service setting `AZURE_STORAGE_CONNECTION_STRING` (server-side only; never commit to git).
4. API: admin upload uses `@azure/storage-blob` (`server/blob.js`).

---

## 3. Application features (brief)

| Feature | Description |
|--------|-------------|
| **Register / login** | Users register with email + password; JWT access token for API calls. |
| **Account** | `GET /auth/me` returns current user; logout clears client token. |
| **Catalog** | List books with title, author, genre, availability; filter/sort in UI. |
| **Borrow / return** | Borrow decrements availability, sets due date; return marks loan returned. |
| **Covers** | Admin can upload cover image → stored in Blob; URL stored on book row. |

---

## 4. Pseudo-code (key flows)

**Check book availability**

```
FUNCTION canBorrow(bookId):
    row = SELECT available_copies FROM books WHERE id = bookId
    IF row is NULL: RETURN error "not found"
    IF row.available_copies < 1: RETURN false
    RETURN true
```

**Borrow (simplified)**

```
FUNCTION borrow(userId, bookId):
    IF NOT canBorrow(bookId): RETURN error "unavailable"
    BEGIN TRANSACTION
    UPDATE books SET available_copies = available_copies - 1 WHERE id = bookId
    INSERT borrow_records(user_id, book_id, due_date, returned=false)
    COMMIT
    RETURN success
```

**Return**

```
FUNCTION returnBook(userId, bookId):
    FIND active borrow row FOR userId, bookId WHERE returned = false
    IF none: RETURN error
    MARK borrow returned = true
    UPDATE books SET available_copies = available_copies + 1 WHERE id = bookId
```

(Real implementation: Express routes in `server/index.js` + `server/db.js`.)

---

## 5. Cost estimation (use Azure Pricing Calculator)

**You must open** the [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/), add the same services, region, and currency, then **attach a screenshot or PDF** to your submission. Numbers below are **illustrative only** (prices change).

| Service | Example SKU | Notes |
|--------|-------------|--------|
| App Service | F1 Free or B1 | F1 has quotas/cold start; B1 for smoother demo. |
| Azure SQL | Basic or Serverless min | Smallest tier for dev. |
| Blob Storage | LRS Hot + small GB | Pay per stored GB + operations. |

**Cost-saving ideas:** use **F1** + **SQL Basic** for class; **auto-pause** serverless SQL if idle; **lifecycle** rules on Blob for old assets; **scale down** App Service after demos.

---

## 6. Security (≥3 measures)

1. **Authentication:** JWT access tokens; protected routes require `Authorization: Bearer`.
2. **Passwords:** bcrypt hashing (not plain text); strong `JWT_SECRET` from App Service configuration.
3. **Transport:** HTTPS only to App Service; SQL with **Encrypt=yes** for ODBC.
4. **Secrets:** connection strings and JWT secret in **environment variables** / Key Vault (production), not in source control.

**User access:** role field on users (e.g. admin vs reader); admin-only upload endpoint enforced in API dependencies.

---

## 7. Performance (simple strategies)

1. **Database:** SQLite WAL mode; for Azure SQL later add pooling via driver/ORM.
2. **API / static:** add **HTTP caching headers** or a small **in-memory cache** for hot catalog reads if traffic grows; serve React static build from CDN or **Azure Front Door** for global latency (optional extension).
3. **Blob:** cache **image URLs** in the database; browser/CDN caching for cover images.

---

## 8. Completion checklist (for you)

- [ ] Attach **Pricing Calculator** export/screenshot (Section 5).
- [ ] If rubric requires **Azure SQL in prod**, migrate from SQLite and configure connection string.
- [ ] If rubric requires **Blob**, set `AZURE_STORAGE_CONNECTION_STRING` and test admin upload.
- [ ] Submit **ARCHITECTURE.md** + this file + (optional) [`server/README.md`](../server/README.md) as technical appendix.
