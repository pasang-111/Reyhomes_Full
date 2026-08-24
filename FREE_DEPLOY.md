# Visual guide

**Step-by-step screenshots:** [docs/DEPLOY_WITH_SCREENSHOTS.md](./docs/DEPLOY_WITH_SCREENSHOTS.md) (`docs/screenshots/*.svg`)

# ReyHomes — free-tier test deploy (maximum free power)

Goal: public site + API + admin CMS + optional lasting media, **$0**.

| Piece | Free service | Limit to know |
|-------|----------------|---------------|
| API + Django Admin | [Render](https://render.com) web free | Sleeps after ~15 min idle; cold start ~30–60s |
| Postgres | Render Postgres free | 90-day expiry on free DB (renew/migrate later) |
| Frontend | [Vercel](https://vercel.com) hobby | Fine for testing |
| Media (optional but recommended) | [Cloudflare R2](https://cloudflare.com) | 10 GB storage, no egress fees |

**Staff CMS:** `https://<backend>.onrender.com/admin/`  
**Public site:** `https://<app>.vercel.app`  
**Client Pro:** `https://<app>.vercel.app/pro/home`

---

## Phase A — GitHub (5 min)

1. Unzip the project, open terminal in `reyhomes_new/`.
2. Push to a **new empty** GitHub repo:

```bash
git init
git add .
git commit -m "ReyHomes free test deploy"
git branch -M main
git remote add origin https://github.com/pasang-111/reyhomes.git
git push -u origin main
```

---

## Phase B — Render backend + database (15 min)

### B1. Blueprint (easiest)

1. Render → **New** → **Blueprint** → connect the repo.
2. Confirm services from `render.yaml`:
   - `reyhomes-db` (Postgres free)
   - `reyhomes-backend` (Python free)
3. Before apply, set **sync: false** secrets in the UI:

| Variable | What to enter |
|----------|----------------|
| `DJANGO_SUPERUSER_USERNAME` | `admin` |
| `DJANGO_SUPERUSER_EMAIL` | your email |
| `DJANGO_SUPERUSER_PASSWORD` | strong password (save it) |

4. Apply. Wait until backend is **Live**.

### B2. Fix hosts after first URL is known

Render → backend service → **Environment**:

| Key | Value |
|-----|--------|
| `ALLOWED_HOSTS` | exact host, e.g. `reyhomes-backend.onrender.com` (no `https://`) |
| `CORS_ALLOWED_ORIGINS` | leave placeholder until Vercel exists |
| `CSRF_TRUSTED_ORIGINS` | `https://reyhomes-backend.onrender.com` (admin login needs this) |

Manual redeploy once.

### B3. Confirm API + CMS

- Open `https://YOUR-BACKEND.onrender.com/admin/`
- Log in with superuser → Unfold dashboard
- Optional API check: `https://YOUR-BACKEND.onrender.com/api/designs/` (or your list route)

---

## Phase C — Vercel frontend (10 min)

1. Vercel → **Add New** → **Project** → same GitHub repo  
2. **Root Directory** → `frontend`  
3. Environment variable:

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-BACKEND.onrender.com` (**no** trailing slash) |

4. Deploy → copy the URL (`https://something.vercel.app`)

### C1. Connect CORS

Render backend env:

| Key | Value |
|-----|--------|
| `CORS_ALLOWED_ORIGINS` | `https://something.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://YOUR-BACKEND.onrender.com,https://something.vercel.app` |

Redeploy backend.

### C2. Confirm site

- Homepage loads  
- `/home-designs`, `/home-land`  
- Cold start: first API hit after sleep can take up to a minute — refresh once  

---

## Phase D — Media that survives redeploys (20 min, free R2)

Without this, uploads disappear on every Render redeploy.

1. Cloudflare → **R2** → Create bucket `reyhomes-media`  
2. **Settings** → enable **Public access** (R2.dev subdomain) — copy public host, e.g. `pub-xxxxx.r2.dev`  
3. **Manage R2 API Tokens** → Create token (Object Read & Write) → Access Key ID + Secret  
4. Account ID from R2 overview  

Render backend env:

| Key | Value |
|-----|--------|
| `USE_S3` | `True` |
| `AWS_ACCESS_KEY_ID` | from token |
| `AWS_SECRET_ACCESS_KEY` | from token |
| `AWS_STORAGE_BUCKET_NAME` | `reyhomes-media` |
| `AWS_S3_ENDPOINT_URL` | `https://ACCOUNT_ID.r2.cloudflarestorage.com` |
| `AWS_S3_CUSTOM_DOMAIN` | `pub-xxxxx.r2.dev` (**no** `https://`) |
| `AWS_S3_REGION_NAME` | `auto` |

Redeploy backend.

Test: Admin → upload hero image on a design → open public design page → image loads from R2.

---

## Phase E — Seed test data (via CMS)

In Django Admin:

1. **Inclusion library** — a few items  
2. **Home design** — title, price, hero image, link inclusions, **Published**  
3. **Home & land package** — same  
4. **Hero slide** — active  
5. Optional: create a normal user on the site → Admin → mark `is_client` + `is_reypro` on profile → log in → `/pro/home`

---

## Free-tier “full power” checklist

| Feature | Free path |
|---------|-----------|
| Public Next.js site | Vercel |
| REST API | Render |
| Postgres | Render free DB |
| Unfold CMS dashboard | `/admin/` on API host |
| JWT login / register | API + frontend |
| Pro portal UI | `/pro/*` (needs `is_reypro`) |
| Images after redeploy | R2 (`USE_S3=True`) |
| Always-on API | ❌ free sleeps — hit URL to wake |

---

## Common free-test issues

| Problem | Fix |
|---------|-----|
| Frontend empty lists / CORS error | Vercel URL must match `CORS_ALLOWED_ORIGINS` exactly |
| Admin login CSRF failed | Add `https://backend-host` to `CSRF_TRUSTED_ORIGINS` |
| Images 400 on Next/Image | Host in `next.config.ts` `remotePatterns` (onrender + r2.dev already allowed) |
| API timeout first load | Wait for Render wake, refresh |
| Superuser missing | Set `DJANGO_SUPERUSER_*` and redeploy, or Render **Shell** → `python manage.py createsuperuser` |
| `ALLOWED_HOSTS` DisallowedHost | Host string must match the `.onrender.com` name exactly |

---

## Order of operations (copy this)

```
1. Push GitHub
2. Render Blueprint → set superuser secrets → deploy
3. Set ALLOWED_HOSTS + CSRF for backend host → redeploy
4. Vercel frontend + NEXT_PUBLIC_API_URL
5. CORS/CSRF with Vercel URL → redeploy backend
6. (Recommended) R2 + USE_S3=True → redeploy
7. Admin: publish one design + package + hero
8. Open Vercel URL and test
```

That’s the maximum free test stack for this project.
