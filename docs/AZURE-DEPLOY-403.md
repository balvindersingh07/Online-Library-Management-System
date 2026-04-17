# Fix GitHub Actions → Azure App Service **403 Forbidden** (ZIP deploy)

A **403** during `azure/webapps-deploy` means the runner reached your app’s **SCM (Kudu)** endpoint but Azure **refused** the deployment (unlike **401**, which is bad credentials).

Do these in order; then **re-run** the workflow.

---

## 1) Networking — public access & restrictions

1. Portal → your Web App → **Networking** (or **Settings → Networking**).
2. **Public network access** → **Enabled** (not “Disabled” only private).
3. **Inbound traffic / Access restrictions**:
   - For **Site**: remove rules that **Deny** GitHub-hosted runners, or temporarily **Allow all** public traffic to verify deploy works.
   - Open **Advanced tooling (Kudu)** / SCM restrictions if shown separately — **SCM must allow** the same inbound pattern as deploy (GitHub IPs are dynamic; allow-all public is the usual fix for student repos).
4. **Private endpoints** → if the app is only reachable via private endpoint, ZIP deploy from **github.com** will fail with 403 unless you use a **self-hosted runner** inside the VNet or switch to an allowed path. For coursework, **remove private endpoint** or allow **public** access to the app + SCM.

Docs: [Deploying to network-secured sites](https://aka.ms/gha/deploying-to-network-secured-sites)

---

## 2) SCM & publish profile (Linux)

1. **Configuration** → **Application settings** → add if missing:
   - **`WEBSITE_WEBDEPLOY_USE_SCM`** = **`true`**  
   (Microsoft’s publish-profile guidance for **Linux** Web Apps.)
2. **Configuration** → **General settings** → **SCM Basic Auth Publishing Credentials** → **On** (needed to download/regenerate publish profile in many tenants).
3. **Get publish profile** again → copy **entire** XML → GitHub → Secret **`AZURE_WEBAPP_PUBLISH_PROFILE`** → **Update**.

---

## 3) FTPS / deployment

**Configuration** → **General settings** → **FTP / FTPS** → use **FTPS only** or **All allowed** — not **Disabled** (can block deployment paths depending on stack).

---

## 4) `WEBSITE_RUN_FROM_PACKAGE` (optional)

- **Not required** to fix 403.
- If set to **`1`**, the site runs from a mounted package (often **read-only** `wwwroot`). The Node API uses SQLite under **`/tmp`** when `WEBSITE_INSTANCE_ID` is set. Only enable if you understand [run from package](https://learn.microsoft.com/azure/app-service/deploy-run-package).

---

## 5) Retry

GitHub → **Actions** → failed run → **Re-run failed jobs** (or push a commit).

Enable verbose logs: repo **Settings → Secrets and variables → Actions → Variables** → add **`ACTIONS_STEP_DEBUG`** = **`true`** (then remove after debugging).

---

## Checklist (copy)

- [ ] Public access **On**; no deny-all SCM rule  
- [ ] No private-only networking (or use self-hosted runner)  
- [ ] `WEBSITE_WEBDEPLOY_USE_SCM` = `true`  
- [ ] SCM Basic Auth **On**; fresh publish profile in GitHub secret  
- [ ] FTP not **Disabled**  
- [ ] Re-run workflow  
