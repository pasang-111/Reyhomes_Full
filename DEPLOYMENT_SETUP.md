# ReyHomes — Deployment Setup Guide

End-to-end guide to deploy the full stack on **free tiers**:

| Layer | Service | Cost |
|-------|---------|------|
| Database | Render PostgreSQL | Free |
| API + Django Admin | Render Web Service | Free (sleeps after ~15 min idle) |
| Media (images/PDFs) | Cloudflare R2 | Free (10 GB, no egress fees) |
| Frontend | Vercel | Free (Hobby) |

**URLs after deploy**

| What | URL |
|------|-----|
| Public site | `https://<your-app>.vercel.app` |
| Client Pro portal | `https://<your-app>.vercel.app/pro/home` |
| API | `https://<backend>.onrender.com` |
| Staff CMS (Django Admin) | `https://<backend>.onrender.com/admin/` |

> Staff edit content only in **Django Admin**.  
> Next.js `/admin` is only a gateway link to Django Admin.

---

## Prerequisites

- GitHub account
- [Render](https://dashboard.render.com) account
- [Vercel](https://vercel.com) account
- [Cloudflare](https://dash.cloudflare.com) account (for R2 media)
- This project pushed to a GitHub repo

---

## Phase 0 — Push code to GitHub

```bash
cd reyhomes_new          # project root (contains backend/ and frontend/)
git init
git add .
git commit -m "ReyHomes full stack deploy"
git branch -M main
git remote add origin https://github.com/pasang-111/reyhomes.git
git push -u origin main
```

**Do not commit** real `.env` files or secrets.

---

## Phase 1 — Cloudflare R2 (media storage)

Render free web services have **no persistent disk**. Without R2/S3, every redeploy wipes uploaded photos and PDFs.

### 1.1 Create bucket

1. Cloudflare Dashboard → **R2 Object Storage** → **Create bucket**
2. Name: e.g. `reyhomes-media`
3. Create bucket

### 1.2 Public access

1. Open the bucket → **Settings**
2. **Public access** → allow access via **R2.dev subdomain**
3. Copy the public URL, e.g.  
   `https://pub-0123456789abcdef.r2.dev`  
   You will use **only the hostname** later: `pub-0123456789abcdef.r2.dev`

### 1.3 API token

1. R2 → **Overview** → **Manage R2 API Tokens** → **Create API token**
2. Permissions: **Object Read & Write**
3. Apply to: this bucket (or all buckets)
4. Create → copy:
   - **Access Key ID**
   - **Secret Access Key**
5. Note your **Account ID** (shown on the R2 overview page)

You will need:

```text
AWS_ACCESS_KEY_ID       = <Access Key ID>
AWS_SECRET_ACCESS_KEY   = <Secret Access Key>
AWS_STORAGE_BUCKET_NAME = reyhomes-media
AWS_S3_REGION_NAME       = auto
AWS_S3_ENDPOINT_URL      = https://<ACCOUNT_ID>.r2.cloudflarestorage.com
AWS_S3_CUSTOM_DOMAIN     = pub-xxxx.r2.dev          # no https://
USE_S3                  = True
```

---

## Phase 2 — Render (database + backend)

### 2.1 Deploy with Blueprint (recommended)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect the GitHub repo that contains `render.yaml`
3. Render will propose:
   - `reyhomes-db` (PostgreSQL free)
   - `reyhomes-backend` (Python web service)
4. Before applying, set the **sync: false** secrets in the UI:

| Variable | Example |
|----------|---------|
| `DJANGO_SUPERUSER_USERNAME` | `admin` |
| `DJANGO_SUPERUSER_EMAIL` | `you@example.com` |
| `DJANGO_SUPERUSER_PASSWORD` | strong password (save it) |

5. Apply and wait until the web service is **Live**.

### 2.2 Note your real backend hostname

After deploy, the URL looks like:

```text
https://reyhomes-backend-nx6h.onrender.com
```

The random suffix (`nx6h`, etc.) is assigned by Render.  
**Copy the exact host** (no `https://`):  
`reyhomes-backend-nx6h.onrender.com`

### 2.3 Set environment variables

Render → your web service → **Environment** → edit:

#### Core

| Key | Value |
|-----|--------|
| `DEBUG` | `False` |
| `USE_SQLITE` | `False` |
| `SECRET_KEY` | (Render generate, or long random string) |
| `ALLOWED_HOSTS` | **exact** host, e.g. `reyhomes-backend-nx6h.onrender.com` |
| `SECURE_SSL_REDIRECT` | `True` |
| `SESSION_COOKIE_SECURE` | `True` |
| `CSRF_COOKIE_SECURE` | `True` |

#### Database (auto-filled if using Blueprint)

`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` — leave as linked from the Postgres instance.

#### CORS / CSRF (update after Vercel exists)

| Key | Value |
|-----|--------|
| `CORS_ALLOWED_ORIGINS` | `https://YOUR-APP.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://reyhomes-backend-nx6h.onrender.com,https://YOUR-APP.vercel.app` |

`CSRF_TRUSTED_ORIGINS` **must** include the backend itself (admin login) and the frontend origin. Scheme `https://` is required.

#### Media (R2) — required for lasting uploads

| Key | Value |
|-----|--------|
| `USE_S3` | `True` |
| `AWS_ACCESS_KEY_ID` | from R2 token |
| `AWS_SECRET_ACCESS_KEY` | from R2 token |
| `AWS_STORAGE_BUCKET_NAME` | `reyhomes-media` |
| `AWS_S3_REGION_NAME` | `auto` |
| `AWS_S3_ENDPOINT_URL` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `AWS_S3_CUSTOM_DOMAIN` | `pub-xxxx.r2.dev` (**no** `https://`) |

#### Superuser (first deploy)

| Key | Value |
|-----|--------|
| `DJANGO_SUPERUSER_USERNAME` | `admin` |
| `DJANGO_SUPERUSER_EMAIL` | your email |
| `DJANGO_SUPERUSER_PASSWORD` | strong password |

Save → **Manual Deploy** (or wait for auto redeploy).

### 2.4 Verify backend

1. Open `https://<backend>.onrender.com/admin/`
2. Log in with the superuser → you should see the **Unfold** dashboard
3. Optional API check:  
   `https://<backend>.onrender.com/api/designs/`  
   (JSON list or `[]` is success; **400** means `ALLOWED_HOSTS` is wrong)

**If you still see 400 Bad Request**

- `ALLOWED_HOSTS` must match the hostname in the browser **exactly** (no `https://`, no path)
- This project’s `settings.py` also auto-adds `RENDER_EXTERNAL_HOSTNAME` — still set `ALLOWED_HOSTS` correctly in the dashboard
- After changing env vars, trigger a **Manual Deploy**

**If createsuperuser says “username already taken”**

Harmless on redeploys. Use the password you already set, or reset via Render shell:

```bash
python manage.py changepassword admin
```

---

## Phase 3 — Vercel (frontend)

1. [Vercel](https://vercel.com) → **Add New** → **Project** → import the same GitHub repo  
2. **Root Directory** → set to `frontend`  
3. Framework: Next.js (auto-detected)  
4. **Environment variables**:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://reyhomes-backend-nx6h.onrender.com` |

No trailing slash.

5. Deploy.

6. Copy your Vercel URL, e.g. `https://reyhomes-xyz.vercel.app`

7. Go back to **Render → Environment** and set:

| Key | Value |
|-----|--------|
| `CORS_ALLOWED_ORIGINS` | `https://reyhomes-xyz.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://reyhomes-backend-nx6h.onrender.com,https://reyhomes-xyz.vercel.app` |

Redeploy backend once more.

---

## Phase 4 — Smoke tests

| Check | Expected |
|-------|----------|
| `https://<backend>/admin/` | Login page / Unfold dashboard |
| `https://<backend>/api/designs/` | JSON (not 400) |
| Admin → upload image on a design | File URL starts with `https://pub-….r2.dev/…` |
| `https://<frontend>.vercel.app` | Site loads, designs/packages appear |
| Browser console on frontend | No CORS errors when calling API |
| Redeploy backend, then re-check image | Image still loads (R2 persistence) |

---

## Phase 5 — GitHub CI (optional)

The repo includes `.github/workflows/ci.yml`:

- Frontend: `npm ci` → `tsc` → `lint` → `build`
- Backend: `pip install` → `manage.py check`

CI uses:

```yaml
NEXT_PUBLIC_API_URL: https://reyhomes-backend-nx6h.onrender.com
```

Update that value in the workflow if your backend hostname changes.  
ESLint rules that used to fail the build are set to **warnings** so style issues do not block deploys.

---

## Environment variable cheat sheet

### Render (backend)

```text
DEBUG=False
USE_SQLITE=False
SECRET_KEY=<long-random>
ALLOWED_HOSTS=reyhomes-backend-xxxx.onrender.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# DB_* from Render Postgres link

CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
CSRF_TRUSTED_ORIGINS=https://reyhomes-backend-xxxx.onrender.com,https://your-app.vercel.app

USE_S3=True
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_STORAGE_BUCKET_NAME=reyhomes-media
AWS_S3_REGION_NAME=auto
AWS_S3_ENDPOINT_URL=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
AWS_S3_CUSTOM_DOMAIN=pub-xxxx.r2.dev

DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=you@example.com
DJANGO_SUPERUSER_PASSWORD=...
```

### Vercel (frontend)

```text
NEXT_PUBLIC_API_URL=https://reyhomes-backend-xxxx.onrender.com
```

---

## Common problems

### 400 Bad Request on every URL

**Cause:** `ALLOWED_HOSTS` does not include the host you are visiting.

**Fix:** Set `ALLOWED_HOSTS` to the exact host (e.g. `reyhomes-backend-nx6h.onrender.com`) and redeploy.

### CORS errors in the browser

**Cause:** Frontend origin not listed in `CORS_ALLOWED_ORIGINS`.

**Fix:** Set `CORS_ALLOWED_ORIGINS` to the exact Vercel URL (`https://…`), redeploy backend.

### Admin login CSRF failed

**Cause:** Backend URL missing from `CSRF_TRUSTED_ORIGINS`.

**Fix:** Include `https://<backend-host>` in `CSRF_TRUSTED_ORIGINS`.

### Images disappear after redeploy

**Cause:** `USE_S3` is still `False` or R2 credentials are wrong.

**Fix:** Set all `AWS_*` vars and `USE_S3=True`, redeploy, re-upload one test image.

### Frontend build fails in CI / Vercel

**Cause:** Layout used to fetch API at build time and throw if backend was asleep.

**Fix:** Current `layout.tsx` catches failures and returns empty lists. Ensure `NEXT_PUBLIC_API_URL` is set.

### Free Render “sleep”

After ~15 minutes idle the free web service sleeps. First request can take 30–60 seconds. This is normal on the free plan.

---

## Local development (optional)

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edit SECRET_KEY, USE_SQLITE=True for local
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend (other terminal)
cd frontend
npm install
# .env.local:
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

Open http://localhost:3000 and http://127.0.0.1:8000/admin/

---

## Architecture reminder

```text
Browser
   │
   ├─► Vercel (Next.js)  ──API calls──►  Render (Django REST + Admin)
   │                                         │
   │                                         ├─► Render Postgres
   │                                         └─► Cloudflare R2 (media)
   └─► R2 public URLs for images/PDFs (direct)
```

Staff CMS: **Django Admin only** (`/admin/` on the backend).  
Client portal: **`/pro/home`** on the frontend.
