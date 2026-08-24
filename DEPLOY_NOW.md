# Deploy right now — Render (backend) + Vercel (frontend)

Your repo already has full deployment infra (`render.yaml`, `DEPLOY.md`,
`DEPLOYMENT_SETUP.md`, `docs/DEPLOY_WITH_SCREENSHOTS.md`). This is just the
fastest path to a *live link to show your boss today*. For anything beyond
a quick demo (custom domain, email, S3 vs Cloudinary decision, etc.) use
`DEPLOY.md` — it's more thorough than this file.

## 0. Push this zip to GitHub first
Both Render and Vercel deploy from a GitHub repo, not a zip upload.
```bash
cd reyhomes
git init && git add . && git commit -m "ReyHomes"
git remote add origin https://github.com/<you>/reyhomes.git
git branch -M main && git push -u origin main
```

## 1. Backend — Render
1. https://dashboard.render.com → **New** → **Blueprint** → connect the repo.
2. Render reads `render.yaml` automatically and creates the free Postgres DB
   + the `reyhomes-backend` web service.
3. In the service's **Environment** tab, fill in the `sync: false` values
   Render left blank:
   - `DJANGO_SUPERUSER_USERNAME` / `_EMAIL` / `_PASSWORD` — your admin login
   - `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` — free tier at
     https://cloudinary.com (needed so uploaded media survives redeploys —
     Render's free disk is wiped on every deploy)
   - `UNSPLASH_ACCESS_KEY` — optional, only needed if you'll run
     `seed_real_images` against production
4. First deploy will show a host like `reyhomes-backend-xxxx.onrender.com`.
   Go back into env vars and set `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS`
   to that exact hostname, then **Manual Deploy → Clear cache & deploy**.

## 2. Frontend — Vercel
1. https://vercel.com/new → import the same repo.
2. **Root Directory: `frontend`** (this is the one setting people miss —
   the Next.js app lives in a subfolder, not the repo root).
3. Framework preset: Next.js (auto-detected). Build/output commands: leave default.
4. Add one environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://reyhomes-backend-xxxx.onrender.com`
     (your real Render URL from step 1)
5. Deploy. You'll get `https://reyhomes-xxxx.vercel.app`.

## 3. Connect them
Back on Render, update:
- `CORS_ALLOWED_ORIGINS` = `https://reyhomes-xxxx.vercel.app`
- `CSRF_TRUSTED_ORIGINS` = `https://reyhomes-backend-xxxx.onrender.com,https://reyhomes-xxxx.vercel.app`

Redeploy the backend once more so both settings take effect.

## 4. Load demo data
In Render, open the backend service → **Shell** tab, then:
```bash
python manage.py seed_all
python manage.py seed_real_images --force
```
That runs every seed command (catalogue, testimonials, hero, etc.) and then
backfills real Unsplash photography (or YouTube thumbnails for testimonials)
over every image field — this is the command from earlier in this
conversation, already wired into `seed_all.py`.

## Free-tier caveats worth knowing before the demo
- Render's free web service **spins down after 15 min idle** — the first
  request after a gap takes ~30–50s to wake up. Load the site yourself a
  minute before showing your boss.
- Free Postgres on Render expires after 90 days — fine for a demo, not for
  production.
- Without Cloudinary configured, uploaded/seeded media is wiped on every
  Render redeploy (ephemeral disk) — set it up in step 1 if the demo needs
  to survive more than one deploy.
