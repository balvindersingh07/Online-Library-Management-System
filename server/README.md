# Libra API (Node.js + Express)

- **Start:** `npm start` (from repo root)
- **Seed demo books** (if `books` is empty): `npm run seed` — on boot, the API also auto-seeds when the catalog is empty.
- **Local:** set `JWT_SECRET`, optional `CORS_ORIGINS`, `AZURE_STORAGE_CONNECTION_STRING`
- **SQLite:** `./library.db` locally; `/tmp/library.db` on Azure App Service
- **Azure:** App Service **Linux**, runtime **Node 20 LTS**, **Startup command:** `npm start`
- **Admin:** promote a user with SQL: `UPDATE users SET role = 'admin' WHERE email = '...';` (use DB browser for `library.db`)
