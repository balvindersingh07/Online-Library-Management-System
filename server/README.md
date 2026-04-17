# Libra API (Node.js + Express)

- **Start:** `npm start` (from repo root)
- **Seed demo books** (if `books` is empty): `npm run seed` — on boot, the API also auto-seeds when the catalog is empty.
- **Local:** set `JWT_SECRET`, optional `CORS_ORIGINS`, `AZURE_STORAGE_CONNECTION_STRING`
- **SQLite:** `./library.db` locally; `/tmp/library.db` on Azure App Service
- **Azure:** App Service **Linux**, runtime **Node 20 LTS**, **Startup command:** `npm start`
- **Dev admin (local / non-production):** on API start, the server ensures **`admin@libra.local`** / **`LibraAdmin123!`**: inserts the user if missing, or **promotes** that email from `user` → `admin` and resets the dev password (so a prior reader signup on the same email does not block staff login). Override with `DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASSWORD`; disable with `SEED_DEV_ADMIN=0`. If the account is already `admin` but the password was changed, set **`DEV_ADMIN_RESYNC=1`** once, restart the API, then remove it. On **production** (`NODE_ENV=production`), these steps only run when **`SEED_DEV_ADMIN=1`** (then set back to **`0`**). **Frontend** `VITE_API_BASE_URL` must point at the same API instance where this user exists (local UI + Azure API = that API’s DB never got this email unless you enabled seed there).
- **Admin (any user):** promote with SQL: `UPDATE users SET role = 'admin' WHERE email = '...';` (DB browser for `library.db`)
