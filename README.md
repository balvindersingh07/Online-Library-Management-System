# Online Library Management System

- **Frontend:** React + TypeScript + Vite (`src/`)
- **Backend:** Node.js + Express + SQLite (`server/`). Run **`npm start`** from repo root (API on port `PORT` or `8000`).
- **Azure:** App Service **Linux**, **Node 20 LTS**, startup **`npm start`**. See [`server/README.md`](./server/README.md).

```bash
npm install
npm run dev          # Vite UI (separate terminal)
npm start            # API
```

Copy [`.env.example`](./.env.example) → **`.env.local`** and set **`VITE_API_BASE_URL`** to your API URL (no trailing slash). Copy → **`.env`** for API secrets when running `npm start` locally.
