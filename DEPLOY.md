# ReyHomes — full deployment guide (free-tier capable)

Deploy a working public site:

| Layer | Service | Notes |
|-------|---------|--------|
| Database | **Render** PostgreSQL (free) | Managed |
| Backend + Django Admin | **Render** web service (free) | Django + Unfold CMS |
| Media (images/PDFs) | **Cloudflare R2** (or any S3) | Required so media survives redeploys |
| Frontend | **Vercel** | Next.js 15 |

Staff edit content in **Django Admin** (`https://api-host/admin/`).  
Clients with Pro use **`/pro/home`** on the frontend.  
The Next.js `/admin` route is only a staff gateway to Django Admin.

---

## 0. Push code to GitHub

```bash
cd reyhomes_new   # or your repo root
git init
git add .
git commit -m "ReyHomes full stack"
```

Create an empty GitHub repo, then:

```bash
git remote add origin https://github.com/pasang-111/reyhomes.git
git branch -M main
git push -u origin main
```

Do **not** commit real `.env` files or secrets.

---

## 1. Render: database + backend

### Option A — Blueprint (`render.yaml`)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect the GitHub repo
3. Render reads `render.yaml` and creates:
   - `reyhomes-db` (PostgreSQL free)
   - `reyhomes-backend` (Python web service)

### Option B — Manual

1. **New PostgreSQL** → free plan → note internal host/user/password/db name  
2. **New Web Service** → same repo  
   - Root directory: `backend`  
   - Build:  
     `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py createsuperuser --noinput || true`  
   - Start: `gunicorn config.wsgi:application`

### Required env vars (Render → Environment)

| Key | Value |
|-----|--------|
| `SECRET_KEY` | Generate (or Render “generate”) |
| `DEBUG` | `False` |
| `USE_SQLITE` | `False` |
| `ALLOWED_HOSTS` | `reyhomes-backend.onrender.com` (your real host) |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` / `DB_HOST` / `DB_PORT` | From Render Postgres (or blueprint `fromDatabase`) |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | Same as CORS (must include `https://`) |
| `SECURE_SSL_REDIRECT` | `True` |
| `DJANGO_SUPERUSER_USERNAME` | e.g. `admin` |
| `DJANGO_SUPERUSER_EMAIL` | your email |
| `DJANGO_SUPERUSER_PASSWORD` | strong password |

After first deploy, open:

`https://<backend>.onrender.com/admin/`

Log in with the superuser. You should see the **Unfold dashboard** (KPIs, quick actions, frontend map).

---

## 2. Media storage (S3-compatible) — strongly recommended

Render **free** web services have **no persistent disk**. Local `MEDIA_ROOT` is wiped on every redeploy.

### Cloudflare R2 (recommended: free egress)

1. Cloudflare → **R2** → Create bucket (e.g. `reyhomes-media`)
2. **Manage R2 API Tokens** → create token with Object Read & Write  
3. Enable **public access** via R2.dev subdomain or custom domain  
4. On Render, set:

| Key | Example |
|-----|---------|
| `USE_S3` | `True` |
| `AWS_ACCESS_KEY_ID` | R2 access key |
| `AWS_SECRET_ACCESS_KEY` | R2 secret |
| `AWS_STORAGE_BUCKET_NAME` | `reyhomes-media` |
| `AWS_S3_ENDPOINT_URL` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `AWS_S3_CUSTOM_DOMAIN` | `pub-xxxxx.r2.dev` (or your custom domain) — **no** `https://` |

Django uses `django-storages` + `boto3` when `USE_S3=True` (see `backend/config/settings.py`).

Redeploy backend after setting these.

### Frontend images

In Vercel (or `frontend/.env`):

```
NEXT_PUBLIC_API_URL=https://<backend>.onrender.com
```

`next.config.ts` must allow image hosts for your API and R2 domain (`remotePatterns`). If you use a custom R2 domain, add it there.

---

## 3. Vercel: frontend

1. [Vercel](https://vercel.com) → **Add New Project** → import the same GitHub repo  
2. **Root Directory**: `frontend`  
3. Framework: Next.js (auto)  
4. Environment variables:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://<backend>.onrender.com` (no trailing slash) |

5. Deploy  

6. Copy the Vercel URL back into Render:

- `CORS_ALLOWED_ORIGINS=https://your-app.vercel.app`
- `CSRF_TRUSTED_ORIGINS=https://your-app.vercel.app`

Redeploy backend once so CORS matches production.

---

## 4. Smoke-check checklist

| Check | How |
|-------|-----|
| API health | `GET https://api-host/api/` or designs list |
| Admin login | `https://api-host/admin/` → Unfold dashboard |
| Public designs | `https://frontend/home-designs` shows cards + images |
| Package detail | `/home-land/[slug]` gallery + floor plan |
| Media after redeploy | Upload image in admin → redeploy backend → image still loads (only if S3/R2 on) |
| Pro portal | Enable `is_reypro` on a client in admin → login → `/pro/home` |
| Staff gateway | `https://frontend/admin` links to Django Admin |

---

## 5. Local development (optional)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # USE_SQLITE=True for quick local
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm install
npm run dev
```

---

## 6. Architecture map

```
GitHub
  ├── backend/     → Render (Gunicorn + Postgres + optional R2)
  │     /admin/    → Unfold CMS (staff)
  │     /api/      → DRF (public + JWT auth)
  └── frontend/    → Vercel (Next.js)
        /          → public marketing site
        /pro/*     → ReyHomes Pro (clients with is_reypro)
        /admin     → gateway to Django Admin only
```

**Access model (do not break):**

- Registration creates a normal user only  
- Only staff/admin promotes **Client** / enables **ReyHomes Pro**  
- Never trust client-side flags for `is_staff` / `is_superuser` / `is_client` / `is_reypro`

---

## 7. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Images blank after redeploy | `USE_S3` still false → enable R2 |
| CORS errors in browser | Vercel URL missing from `CORS_ALLOWED_ORIGINS` |
| Admin 400 on login | `CSRF_TRUSTED_ORIGINS` must include `https://api-host` |
| Next/Image broken | `remotePatterns` missing API or R2 host |
| Free Render sleeps | Cold start ~30–60s; paid always-on if needed |
| Superuser missing | Set `DJANGO_SUPERUSER_*` and redeploy, or `createsuperuser` via Render shell |

See also **ADMIN.md** for Django Admin / Unfold details.
