# Integration notes (your design preserved)

## What we kept (your design)
- Navbar COLOR tokens (oceanic navy + cream `#F8F5F0` + brass)
- Homepage section structure and styling
- HomeSpecs cream/navy visual layout
- Category choices in CMS (Single / Double / Dual Occupancy / Knockdown Rebuild)
- Unfold admin shell

## What we added (logic only)
- `frontend/src/lib/units.ts` — m² / m display helpers
- HomeSpecs values formatted via units (same UI)
- Lot-width filter on `/home-designs`
- Sticky enquire bar on design detail (your brand colours)
- Enquire CTA prefilled with `?design=`
- CMS model help_text for area/linear fields
- Admin dashboard `integrity_items` for data accuracy

## Run
```bash
cd backend && pip install -r requirements.txt
# USE_SQLITE=True or Postgres from .env
python manage.py migrate && python manage.py runserver

cd frontend && npm i && npm run dev
```
