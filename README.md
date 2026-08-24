# ReyHomes

**Luxury house & land packages — bespoke living, modern stack.**

A full-stack real estate platform: cinematic Next.js frontend, Django REST API, and an Unfold-powered CMS for staff.

---

## Live

| Layer | URL |
|-------|-----|
| **Website** | [reyhomes-yc57.vercel.app](https://reyhomes-yc57.vercel.app/) |
| **API** | [reyhomes-backend.onrender.com](https://reyhomes-backend.onrender.com/api/) |
| **Admin CMS** | [reyhomes-backend.onrender.com/admin](https://reyhomes-backend.onrender.com/admin/) |

> If lists show errors or stay empty, fix env vars and seed content — see **[FIX_DEPLOYMENT.md](./FIX_DEPLOYMENT.md)**.

---

## Features

- **Home designs** — filterable gallery, detail pages, floor plans, inclusions
- **Home & land packages** — estates, packages, pricing
- **Inclusions & projects** — structured content from the CMS
- **Enquiries** — public contact / enquire flows
- **ReyHomes Pro** — client portal (builds, messages, notifications)
- **Staff CMS** — Django Admin + Unfold dashboard (KPIs, grouped nav)
- **Review / share** — signed review links + PDF export
- **Media** — local disk or S3-compatible (Cloudflare R2) / Cloudinary

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React, TypeScript, Tailwind |
| Backend | Django 5, Django REST Framework, SimpleJWT |
| Admin | django-unfold |
| Database | PostgreSQL (Render free) or SQLite locally |
| Hosting | Vercel (frontend) · Render (API + DB) |
| Media | Cloudflare R2 / AWS S3 / Cloudinary (optional) |

```
reyhomes_new/
├── frontend/          # Next.js app
├── backend/           # Django project
├── docs/              # Deploy screenshots & notes
├── render.yaml        # Render Blueprint
├── DEPLOY.md          # Full production deploy
├── FREE_DEPLOY.md     # Free-tier path
├── FIX_DEPLOYMENT.md  # Live site repair checklist
└── ADMIN.md           # CMS / Unfold notes
```

---

## Quick start (local)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # set SECRET_KEY, USE_SQLITE=True for local
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

API: `http://127.0.0.1:8000/api/` · Admin: `http://127.0.0.1:8000/admin/`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

App: `http://localhost:3000`

---

## Production checklist

1. **Render** — Postgres + web service (`render.yaml` or manual). Set real:
   - `CORS_ALLOWED_ORIGINS=https://reyhomes-yc57.vercel.app`
   - `CSRF_TRUSTED_ORIGINS=https://reyhomes-backend.onrender.com,https://reyhomes-yc57.vercel.app`
   - `ALLOWED_HOSTS=reyhomes-backend.onrender.com`
2. **Vercel** — import `frontend/`, set:
   - `NEXT_PUBLIC_API_URL=https://reyhomes-backend.onrender.com`
   - Redeploy after changing any `NEXT_PUBLIC_*` variable.
3. **Admin** — log in, publish designs / packages / hero slides.
4. **Media** — enable R2 or Cloudinary so uploads survive redeploys (see `DEPLOY.md`).

Full walkthrough: **[DEPLOY.md](./DEPLOY.md)** · Free-tier: **[FREE_DEPLOY.md](./FREE_DEPLOY.md)** · Repair live: **[FIX_DEPLOYMENT.md](./FIX_DEPLOYMENT.md)**

---

## Docs

| Doc | Purpose |
|-----|---------|
| [DEPLOY.md](./DEPLOY.md) | GitHub → Render → Vercel → media |
| [FREE_DEPLOY.md](./FREE_DEPLOY.md) | Zero-cost path and limits |
| [FIX_DEPLOYMENT.md](./FIX_DEPLOYMENT.md) | CORS / API URL / empty DB fixes |
| [ADMIN.md](./ADMIN.md) | Unfold CMS and staff workflow |
| [REMEDIATION_STATUS.md](./REMEDIATION_STATUS.md) | Recent feature workstreams |
| [docs/DEPLOY_WITH_SCREENSHOTS.md](./docs/DEPLOY_WITH_SCREENSHOTS.md) | Visual deploy guide |

---

## License

Private / proprietary unless otherwise stated by the project owner.

---

<p align="center">
  <strong>ReyHomes</strong> — for those who build differently.
</p>
