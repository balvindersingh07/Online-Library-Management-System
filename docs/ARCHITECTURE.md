# Online Library Management System — Azure Architecture

## Diagram 1 — Assignment target (recommended production shape)

```mermaid
flowchart TB
    subgraph Users["Users"]
        Browser["Web browser\n(React SPA / static site)"]
    end

    subgraph Azure["Azure"]
        subgraph Compute["Azure App Service"]
            WebApp["Web App\nNode.js 20 LTS\nExpress REST API"]
        end

        subgraph Data["Data plane"]
            SQLDB[("Azure SQL Database\nusers · books · borrows")]
            Blob["Azure Blob Storage\ncontainer: book-covers\n(Hot / LRS)"]
        end
    end

    Browser -->|"HTTPS\nREST + JSON"| WebApp
    WebApp -->|"TLS, SQL auth\nor Entra / managed identity"| SQLDB
    WebApp -->|"SDK: @azure/storage-blob\nSAS or account key via app settings"| Blob
    Browser -.->|"VITE_API_BASE_URL\n(CORS allowlist)"| WebApp
```

| Component | Responsibility |
|-----------|----------------|
| **Azure App Service** | Runs the Node/Express API (`npm start`), JWT auth, business logic, Swagger at `/docs`. |
| **Azure SQL Database** | Relational store for users, books, borrow rows; backups per SQL SKU. |
| **Azure Blob Storage** | Book cover images; URLs persisted in the database. |

**PNG export (same as diagram 1):**  
![Target architecture — App Service, Azure SQL, Blob](./screenshots/architecture-target.png)

---

## Diagram 2 — This repository (current deployment pattern)

```mermaid
flowchart TB
    subgraph Users["Users"]
        Browser["Web browser\n(React + Vite)"]
    end

    subgraph Azure["Azure"]
        AppService["Azure App Service\nNode.js / Express"]
        SQLite[("SQLite file\n/tmp/library.db")]
        Blob["Azure Blob Storage\n(optional)"]
    end

    Browser -->|"HTTPS"| AppService
    AppService --> SQLite
    AppService --> Blob
```

**PNG export (same as diagram 2):**  
![Current deployment — App Service, SQLite, optional Blob](./screenshots/architecture-current.png)

To align runtime with Diagram 1, replace `server/db.js` with an Azure SQL client and point connection settings at your database — see [`COURSE-SUBMISSION.md`](./COURSE-SUBMISSION.md) section 2.2.

---

## Where the React app runs

Typical patterns: **Azure Static Web Apps**, **Blob static website + CDN**, or any host with **`VITE_API_BASE_URL`** pointing at the App Service API and **CORS** configured (`CORS_ORIGINS`).
