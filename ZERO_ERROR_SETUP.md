# ReyHomes — zero-error local + production (reyhomes.com.au)

## A. Local (no errors checklist)

### Requirements
- Python 3.11+
- Node.js 20+
- Git

### Backend
```bash
cd Reyhomes-main/backend
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
```

**Edit `backend/.env` exactly:**
```env
SECRET_KEY=dev-local-change-me-long-random
DEBUG=True
USE_SQLITE=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
USE_CLOUDINARY=False
USE_S3=False
MEDIA_ROOT=
```

```bash
python manage.py migrate
python manage.py seed_all
python manage.py seed_wp_media --create-missing --content-only
python manage.py createsuperuser
python manage.py runserver
```

- API: http://127.0.0.1:8000/api/
- Admin: http://127.0.0.1:8000/admin/

### Frontend (second terminal)
```bash
cd Reyhomes-main/frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local
npm run dev
```

- Site: http://localhost:3000

### Optional media files locally
If WP image URLs fail (captcha):
```bash
python manage.py seed_wp_media --create-missing --force --local-dir=/path/to/wp-content/uploads
```

---

## B. Production — Render + Vercel + Crazy Domains

### B1. GitHub
```bash
cd Reyhomes-main
git init
git add .
git commit -m "ReyHomes production"
git remote add origin https://github.com/YOUR_USER/reyhomes.git
git branch -M main
git push -u origin main
```

### B2. Render — Postgres + Web

**Web service**
- Root: `backend`
- Build:  
  `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && (python manage.py createsuperuser --noinput || true) && python manage.py seed_if_empty`
- Start: `gunicorn config.wsgi:application`

**Disk (you already have one)**  
Mount e.g. `/var/data`

**Env (Render) — replace hosts with yours:**
```env
SECRET_KEY=<long-random>
DEBUG=False
USE_SQLITE=False
ALLOWED_HOSTS=api.reyhomes.com.au,YOUR-SERVICE.onrender.com
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
DB_PORT=5432
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
FRONTEND_URL=https://reyhomes.com.au
CORS_ALLOWED_ORIGINS=https://reyhomes.com.au,https://www.reyhomes.com.au
CSRF_TRUSTED_ORIGINS=https://api.reyhomes.com.au,https://reyhomes.com.au,https://www.reyhomes.com.au,https://YOUR-SERVICE.onrender.com
USE_CLOUDINARY=False
USE_S3=False
MEDIA_ROOT=/var/data/media
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=you@reyhomes.com.au
DJANGO_SUPERUSER_PASSWORD=<strong>
```

**Custom domain on Render:** `api.reyhomes.com.au`

### B3. Crazy Domains DNS
| Type | Host | Value |
|------|------|--------|
| A | @ | `76.76.21.21` (Vercel apex — confirm in Vercel UI) |
| CNAME | www | `cname.vercel-dns.com` |
| CNAME | api | `YOUR-SERVICE.onrender.com` |

### B4. Vercel
- Root directory: `frontend`
- Env: `NEXT_PUBLIC_API_URL=https://api.reyhomes.com.au` (no trailing slash)
- Domains: `reyhomes.com.au`, `www.reyhomes.com.au`

### B5. Seed on Render Shell
```bash
python manage.py seed_wp_media --create-missing --content-only
# with media on disk:
python manage.py seed_wp_media --create-missing --force
# or offline uploads on disk:
python manage.py seed_wp_media --create-missing --force --local-dir=/var/data/wp-uploads
```

### B6. Verify
| Check | URL |
|-------|-----|
| Site | https://reyhomes.com.au |
| Admin | https://api.reyhomes.com.au/admin/ |
| API | https://api.reyhomes.com.au/api/ |

---

## C. Zero-error rules

1. Never commit real `.env`
2. `NEXT_PUBLIC_API_URL` = no trailing slash
3. CORS/CSRF origins = exact `https://` URLs
4. `ALLOWED_HOSTS` = hostnames only (no `https://`)
5. Persistent disk: `MEDIA_ROOT` under the mount path
6. After changing env on Render or Vercel → **redeploy**
7. WP merge does not wipe ReyHomes-only fields (price, inclusions, etc.)

## D. Common fixes
| Error | Fix |
|-------|-----|
| DisallowedHost | Add host to ALLOWED_HOSTS |
| CORS blocked | Add frontend origin to CORS_ALLOWED_ORIGINS |
| Admin CSRF | Add backend+frontend to CSRF_TRUSTED_ORIGINS |
| Media gone after deploy | MEDIA_ROOT on disk + USE_CLOUDINARY/S3 false |
| Empty catalogue | Shell: seed_all or seed_wp_media --create-missing |
