# Online Library Management System — Azure Architecture

## High-level architecture diagram

```mermaid
flowchart TB
    subgraph Users["Users"]
        Browser["Web browser\n(React SPA)"]
    end

    subgraph Azure["Azure cloud"]
        subgraph Compute["Compute"]
            AppService["Azure App Service\n(Node.js / Express API)"]
        end

        subgraph Data["Data & files"]
            SQL["SQLite on App Service\n(/tmp) or Azure SQL if migrated"]
            Blob["Azure Blob Storage\ncontainer: book-covers"]
        end
    end

    Browser -->|"HTTPS\nREST + JSON"| AppService
    AppService -->|"better-sqlite3 / future SQL"| SQL
    AppService -->|"@azure/storage-blob"| Blob
    Browser -.->|"VITE_API_BASE_URL"| AppService
```

## What each part does

| Component | Role |
|-----------|------|
| **Web browser** | React UI: login, catalog, borrow/return, admin. |
| **Azure App Service** | Hosts Express API: `/auth`, `/books`, `/borrow`, `/return`, `/me/borrows`, `/upload`, `/docs` (Swagger UI). |
| **SQLite** | Default embedded DB (`/tmp/library.db` on Azure). |
| **Azure Blob** | Optional cover uploads via `AZURE_STORAGE_CONNECTION_STRING`. |

## Optional: where the React app lives

Same patterns as before: Static Web Apps, Storage static site, or same origin — set **CORS** and **`VITE_API_BASE_URL`**.
