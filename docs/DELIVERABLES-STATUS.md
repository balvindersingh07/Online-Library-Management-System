# Project vs course deliverables — completion overview

Use this with [`COURSE-SUBMISSION.md`](./COURSE-SUBMISSION.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), and the [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/).

| Deliverable | Status | Notes |
|-------------|--------|--------|
| **Architecture diagram** (App Service + **Azure SQL** + Blob) | **Complete (docs)** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Diagram 1 matches the assignment; Diagram 2 shows what this repo runs today (SQLite on App Service until you migrate). |
| **Azure Compute** — steps + config + language | **Complete (docs + code)** | Node.js 20 LTS, Linux App Service, `npm start` — see `COURSE-SUBMISSION` §2.1 + [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml). |
| **Azure Database** — steps + tier + backups | **Complete (docs)** | Full **Azure SQL Database** setup steps in `COURSE-SUBMISSION` §2.2. **Runtime today:** SQLite in code (`server/db.js`); migration to Azure SQL is a documented upgrade path, not a blocker for write-ups. |
| **Azure Storage (Blob)** — steps + access | **Complete (docs + code)** | Portal steps + connection string in App Service; `server/blob.js`, `AZURE_STORAGE_CONNECTION_STRING`. |
| **App features** + pseudo-code / snippets | **Complete** | Implemented in `src/` + `server/`; pseudo-code in `COURSE-SUBMISSION` §4 (+ account/register snippets). |
| **Cost estimation** (Pricing Calculator) | **Partial — you must attach** | Sample breakdown + methodology in `COURSE-SUBMISSION` §5 — **export or screenshot** from the official calculator for your region/currency. |
| **Security** (≥3 measures) | **Complete (docs)** | `COURSE-SUBMISSION` §6; matches implementation (JWT, bcrypt, HTTPS, secrets). |
| **Performance** (1–2 strategies) | **Complete (docs)** | `COURSE-SUBMISSION` §7. |

### Rough completion (for your report)

| Area | Approx. |
|------|--------|
| **Working application** (browse, availability, borrow/return, accounts, admin) | **~95%** |
| **Azure-aligned documentation** (compute, SQL, Blob, security, performance) | **~95%** |
| **Strict “Azure SQL in production”** vs SQLite in repo | **Documented 100%** / **Code migration 0%** (optional follow-on) |
| **Official cost artifact** (calculator PDF/screenshot) | **0% until you attach** |

**Bottom line:** The codebase and docs satisfy the brief for features, security, performance, and Azure service **setup descriptions**. What is left for a full grade packet is mainly **your** Pricing Calculator export/screenshot and, if the rubric insists on live Azure SQL (not SQLite), a **migration** project using the steps already written.
