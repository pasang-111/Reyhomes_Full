# ReyHomes — local test guide (remediation package)

## Quick start

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set USE_SQLITE=True, SECRET_KEY, etc.
python manage.py migrate
python manage.py seed_all
python manage.py seed_testimonials
python manage.py seed_site_settings
python manage.py createsuperuser
python manage.py runserver

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

- Site: http://localhost:3000  
- Admin: http://127.0.0.1:8000/admin/  
- Demo: `client.demo` / `client123` (ReyPro), `admin` / `admin123`

## What to click

| Route | Expect |
|-------|--------|
| `/` | Hero vortex, Ken Burns, About preview, Lenis scroll, cursor aura |
| `/home-designs` | Drag bed/bath filter rails |
| `/home-designs/[slug]` | Image spotlight on hero |
| `/home-land/[slug]` | Image spotlight on hero |
| `/process-timeline` | Gold path draws as you scroll |
| `/testimonials` | Story orbit + Sandstone YouTube embeds |
| `/compare` | Polished empty state |
| `/wishlist` | Login required, API-backed |
| `/admin` (API host) | Django Unfold only |

## Notes

- Hero **MP4** still empty (YouTube is on testimonials via `video_url` embeds).
- Do not commit real `.env` secrets.
- `lenis` is in package.json — `npm install` required.
