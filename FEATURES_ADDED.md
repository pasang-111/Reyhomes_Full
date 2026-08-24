# All missing features — added

| Feature | Location |
|---------|----------|
| Enquire prefill `?design=` / `?package=` | `/enquire` |
| Design pack PDF button | Design detail |
| Where we build | `/where-we-build` |
| Practice / trust strip | Homepage after featured |
| Process CTAs → enquire + designs | `/process-timeline` |
| Inclusion tiers Standard/Signature/Atelier | Model + migration + inclusions UI |
| Compare up to 3 designs | `/compare` |
| Lot width filter | `/home-designs` (already) |
| Sticky enquire | Design detail (already) |
| Specs m²/m | HomeSpecs (already) |
| CMS integrity items | Unfold dashboard (already) |

## Migrate
```bash
cd backend && python manage.py migrate
```

Edit regions in `frontend/src/app/where-we-build/page.tsx` to match real zones.
