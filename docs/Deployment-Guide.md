# Deployment Guide — Vercel + Render + Neon

Deploy the **React frontend to Vercel**, the **Express API to Render**, and keep the **Neon PostgreSQL database** as the shared data layer.

```
Browser ──▶ Vercel (React/Vite) ──▶ Render (Express API) ──▶ Neon PostgreSQL
                 VITE_API_URL              DATABASE_URL
```

> The Vite proxy (`/api → localhost:5000`) only works locally. In production the frontend must call the Render URL directly, so `VITE_API_URL` is required.

---

## 0. Before you start

1. **Neon database is ready.** The SQL scripts have been applied:
   ```text
   schema.sql → seed.sql → views.sql
   ```
   If you use a brand-new Neon database, run them (or run `npm run db:setup` locally) before pointing Render at it.
2. **Copy the pooled connection string** from Neon. It contains `-pooler` in the host and looks like:
   ```text
   postgresql://USER:PASSWORD@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
3. **Push the project to GitHub.** This folder is not yet a Git repo:
   ```powershell
   cd "C:\Users\Jedsz\Documents\Default Project"
   git init
   git add .
   git commit -m "Initial capstone project"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```
   `.gitignore` already excludes `node_modules/`, `dist/`, and all `.env` files.

---

## 1. Deploy the backend on Render

### Option A — Manual Web Service (recommended for first deployment)

1. Go to <https://dashboard.render.com> → **New +** → **Web Service**.
2. Connect your GitHub repository and click **Connect**.
3. Fill in:

   | Field | Value |
   |---|---|
   | Name | `sari-sari-api` |
   | Region | Any (e.g. Oregon / Singapore) |
   | Branch | `main` |
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm run start` |
   | Plan | Free |

4. Expand **Advanced** → set **Health Check Path** to:
   ```text
   /api/health
   ```

5. Add these **Environment Variables**:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Your Neon **pooled** connection string |
   | `JWT_SECRET` | A long random string (e.g. 40+ characters) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | Leave blank for now; set it after Vercel is deployed |

   > `PORT` is set automatically by Render — do **not** add it.

6. Click **Create Web Service** and wait until the status is **Live**.
7. Copy the service URL, for example:
   ```text
   https://sari-sari-api.onrender.com
   ```
8. Verify:
   ```text
   https://sari-sari-api.onrender.com/api/health
   ```
   You should see `"database":"connected"`.

### Option B — Blueprint

A `render.yaml` file is included at the repository root. Choose **New + → Blueprint**, select the repo, and Render will pre-fill the service. You only need to supply `DATABASE_URL` and `CLIENT_URL` when prompted.

---

## 2. Deploy the frontend on Vercel

1. Go to <https://vercel.com/new> → **Import Git Repository**.
2. Select the same GitHub repository → **Import**.
3. Configure the project:

   | Field | Value |
   |---|---|
   | Project Name | `sari-sari-analytics` |
   | Framework Preset | Vite (auto-detected) |
   | **Root Directory** | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |

   > Setting **Root Directory = `frontend`** is the most important step.

4. Add an Environment Variable **before deploying**:

   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://sari-sari-api.onrender.com/api` |

   Use your real Render URL and keep the trailing `/api`. Apply it to **Production, Preview, and Development**.

5. Click **Deploy**.
6. When it finishes, copy the Vercel URL, for example:
   ```text
   https://sari-sari-analytics.vercel.app
   ```

> `VITE_*` variables are baked into the bundle **at build time**. If you change `VITE_API_URL` later, you must **Redeploy** (or run a new build).

`frontend/vercel.json` is included to rewrite unknown paths to `index.html`, so refreshing `/dashboard`, `/analytics`, etc. works correctly.

---

## 3. Connect the two deployments (CORS)

Go back to **Render → sari-sari-api → Environment** and set:

```text
CLIENT_URL = https://sari-sari-analytics.vercel.app
```

Save. Render automatically redeploys.

If you also use Vercel preview deployments, list them comma-separated (no trailing slash):

```text
CLIENT_URL = https://sari-sari-analytics.vercel.app,https://sari-sari-analytics-git-main-yourname.vercel.app
```

The backend reads `CLIENT_URL.split(',')`, so multiple origins are supported.

---

## 4. Test the deployed app

1. Open the Vercel URL.
2. Log in:
   ```text
   admin / admin123
   ```
3. Check:
   - Dashboard charts load.
   - **Sales → New sale** records a transaction.
   - **Inventory** shows updated stock.
   - **Analytics** shows the three stages.
   - **Reports → Export CSV** downloads a file.

---

## 5. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Request Failed with status code 500` on login | Neon tables missing or `DATABASE_URL` wrong | Check `/api/health`; re-run `schema.sql → seed.sql → views.sql` |
| `relation "users" does not exist` | SQL scripts applied to a different Neon branch/database | Use the database from the pooled connection string |
| CORS error in browser console | `CLIENT_URL` does not exactly match the Vercel origin | Set the exact `https://...vercel.app` value, no trailing slash |
| `Incorrect username or password` | Database not seeded | Run `seed.sql` (remember: it resets data) |
| First load takes 30–60 seconds | Render free tier sleeps when idle | Wait; axios timeout is already raised to 60s. Upgrade to Starter for always-on |
| Blank dashboard but login works | `VITE_API_URL` missing `/api` or stale build | Set `https://<render-url>/api` and **Redeploy** Vercel |
| 404 when refreshing `/dashboard` | SPA rewrite missing | Keep `frontend/vercel.json` and redeploy |
| Local dev broken after deployment | Local `.env` was overwritten | Local `frontend/.env` should stay `VITE_API_URL=/api` |

Check Render logs under **Logs** for the exact backend error.

---

## 6. Optional: custom domain

1. Vercel → Project → **Settings → Domains** → add your domain.
2. Update Render `CLIENT_URL` to include the new domain.
3. Redeploy Render.

---

## 7. Environment variable summary

| Where | Variable | Example |
|---|---|---|
| Render | `DATABASE_URL` | `postgresql://...@ep-xxx-pooler.../neondb?sslmode=require` |
| Render | `JWT_SECRET` | `a-very-long-random-secret-2026` |
| Render | `JWT_EXPIRES_IN` | `7d` |
| Render | `NODE_ENV` | `production` |
| Render | `CLIENT_URL` | `https://sari-sari-analytics.vercel.app` |
| Vercel | `VITE_API_URL` | `https://sari-sari-api.onrender.com/api` |

Never commit real `.env` files. They are ignored by Git on purpose.
