# ReyHomes — Full setup guide

## Requirements
- Node.js 20+
- Python 3.11+
- (Optional) PostgreSQL for production; SQLite works locally

## 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` for local:

```
SECRET_KEY=dev-change-me-to-a-long-random-string
DEBUG=True
USE_SQLITE=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
```

```bash
python manage.py migrate
python manage.py seed_all
python manage.py seed_testimonials
python manage.py seed_site_settings
python manage.py createsuperuser
python manage.py runserver
```

- API: http://127.0.0.1:8000/api/
- Admin: http://127.0.0.1:8000/admin/
- Search analytics: Admin → **Search events**

Demo accounts (after seed): `admin` / `admin123`, `client.demo` / `client123` (ReyPro)

## 2. Frontend

```bash
cd frontend
npm install
echo 'NEXT_PUBLIC_API_URL=http://127.0.0.1:8000' > .env.local
npm run dev
```

Site: http://localhost:3000

## 3. Smoke checklist

| Route | Check |
|-------|--------|
| `/` | Hero, About preview, Lenis scroll |
| `/home-designs` | Unsplash hero, left filters, cards |
| `/home-land` | Unsplash hero, left filters |
| Navbar Search | Designs, packages, projects, inclusions |
| `/testimonials` | YouTube embeds + StoryOrbit |
| `/process-timeline` | Scroll-drawn path |
| `/admin` (API host) | Unfold CMS + Search events |

## Production notes
See `render.yaml`, `DEPLOY.md`, `.env.example` files. Never commit real `.env` secrets.
