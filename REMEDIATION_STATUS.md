# ReyHomes remediation status

## Done in this package

### Workstream A — Review & share
- Backend: `GET /api/designs/<slug>/review/`, `GET /api/designs/<slug>/review.pdf/`
- Backend: `GET /api/packages/<slug>/review/`, `GET /api/packages/<slug>/review.pdf/`
- Backend: `GET /api/review/<token>/` (signed, 14-day share links)
- PDF generation via ReportLab (cached under `reviews/` in default storage)
- Frontend: `ReviewDialog`, `ReviewTrigger`, public page `/review/[token]`
- Wired into design/package Floor Plan + Inclusions sections

### Workstream B — Admin users UI
- Django admin + `/api/admin/users/` already present
- New Next.js page: `/admin/users` with tabs (All / Admin / Staff / Client / Registered), search, pagination
- Client / ReyPro toggles reuse `/pro/admin/clients/<id>/` PATCH (access model unchanged)
- Linked from admin home

### Workstream C — Inclusions relations
- Already in repo: `DesignInclusion`, `PackageInclusion`, data migrations, serializers

### Silent API errors
- List API clients no longer `catch { return [] }`
- `safeList` + `ApiErrorBanner` on home-designs, home-land, inclusions pages

### Workstream E
- `frontend/eslint.config.mjs` (flat config)
- `.github/workflows/ci.yml` (frontend build/tsc/lint + Django check)

### Media / S3 / R2
- Already wired (`USE_S3`, R2 endpoint support) — create bucket and set Render env vars

## Remaining / follow-ups
- Self-host Manrope + Cormorant via `next/font/local` (download `.woff2` into `frontend/src/app/fonts/`) to remove Google Fonts build dependency
- Wire `safeList` on remaining list pages (projects, homepage parallel fetches)
- Admin design/package forms: multi-select real Inclusion records (serializers already accept inclusion ids)
- Optional Workstream D (reference codes) — not requested
- Cinematic welcome: already patched; zero-interaction first-visit audio remains a browser platform limit
