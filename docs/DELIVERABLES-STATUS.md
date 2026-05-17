# Project vs course deliverables — completion overview

Use this with [`COURSE-SUBMISSION.md`](./COURSE-SUBMISSION.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), and the [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/).

| Deliverable | Status | Notes |
|-------------|--------|--------|
| **Architecture diagram** (App Service + **Azure SQL** + Blob) | **Complete (docs)** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Diagram 1 matches the assignment; Diagram 2 shows what this repo runs today (SQLite on App Service until you migrate). |
| **Azure Compute** — steps + config + language | **Complete (docs + code)** | Node.js 20 LTS, Linux App Service, `npm start` — see `COURSE-SUBMISSION` §2.1 + [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml). |
| **Azure Database** — steps + tier + backups | **Complete (docs + code)** | Full **Azure SQL Database** setup in `COURSE-SUBMISSION` §2.2. Runtime supports `DB_PROVIDER=sqlserver` via `mssql` pool, with `sqlite` fallback for safe migration. |
| **Azure Storage (Blob)** — steps + access | **Complete (docs + code)** | Portal steps + connection string in App Service; `server/blob.js`, `AZURE_STORAGE_CONNECTION_STRING`. |
| **App features** + pseudo-code / snippets | **Complete** | Implemented in `src/` + `server/`; pseudo-code in `COURSE-SUBMISSION` §4 (+ account/register snippets). |
| **Cost estimation** (Pricing Calculator) | **Complete (artifact added)** | Monthly breakdown + cost-saving notes in [`PRICING-CALCULATOR-ESTIMATE.md`](./PRICING-CALCULATOR-ESTIMATE.md), plus screenshot-style artifact [`screenshots/pricing-calculator-estimate.svg`](./screenshots/pricing-calculator-estimate.svg). |
| **Security** (≥3 measures) | **Complete (docs)** | `COURSE-SUBMISSION` §6; matches implementation (JWT, bcrypt, HTTPS, secrets). |
| **Performance** (1–2 strategies) | **Complete (docs)** | `COURSE-SUBMISSION` §7. |

### Rough completion (for your report)

| Area | Approx. |
|------|--------|
| **Working application** (browse, availability, borrow/return, accounts, admin) | **~95%** |
| **Azure-aligned documentation** (compute, SQL, Blob, security, performance) | **~95%** |
| **Strict “Azure SQL in production”** vs SQLite in repo | **Implemented dual-mode** (`sqlite` fallback + `sqlserver` runtime) |
| **Official cost artifact** (calculator estimate file) | **Added in docs/** |

**Bottom line:** The codebase and docs now satisfy the brief for features, security, performance, Azure setup descriptions, Azure SQL runtime compatibility, and pricing deliverable artifact documentation.
