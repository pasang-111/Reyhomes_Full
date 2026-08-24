# Django Admin investigation & customization (ReyHomes)

## Summary

Staff **content management lives in Django Admin**, styled and structured with **django-unfold** (`>=0.104`). The Next.js `/admin` area is only a **gateway** (link to this admin + Pro portal). Clients use **`/pro/home`**.

---

## Stack

| Piece | Location |
|-------|----------|
| Theme | `unfold` in `INSTALLED_APPS` (before `django.contrib.admin`) |
| Config | `UNFOLD = {...}` in `backend/config/settings.py` |
| Dashboard data | `backend/config/admin_dashboard.py` → `dashboard_callback` |
| Dashboard UI | `backend/templates/admin/index.html` |
| Brand CSS | `backend/static/admin/css/reyhomes.css` + `base_site.html` |
| Model admins | `homes/admin.py`, `land/admin.py`, `core/admin.py`, `pro/admin.py`, … |

---

## UNFOLD settings (what they do)

| Key | Purpose |
|-----|---------|
| `SITE_TITLE` / `SITE_HEADER` / `SITE_SUBHEADER` | Browser title + chrome labels (“ReyHomes CMS”) |
| `SITE_SYMBOL` | Material icon in sidebar (`home_work`) |
| `ENVIRONMENT` | `environment_callback` → “Development” / “Production” badge |
| `DASHBOARD_CALLBACK` | Injects KPI context into the admin index template |
| `COLORS.primary` | Brand palette (cream → burgundy `#8C1D2C`) |
| `BORDER_RADIUS` | `10px` rounded controls |
| `SIDEBAR.navigation` | Curated nav: content, users, Pro, enquiries (not raw app dump) |
| `SHOW_VIEW_ON_SITE` | View-on-site controls where models support it |

Sidebar groups:

1. **Overview** → Dashboard  
2. **Website content** → Hero, designs, packages, estates, inclusions, testimonials, projects, settings  
3. **Users & access** → filtered User lists (admins / staff / clients / Pro)  
4. **Sales & ReyHomes Pro** → contracts, builds, milestones, messages  
5. **Enquiries** → all + “new”

---

## Custom dashboard (`/admin/`)

`dashboard_callback(request, context)` adds:

| Block | Data |
|-------|------|
| Quick actions | Add design/package/inclusion, hero, open enquiries, settings |
| Account KPIs | Totals + role segmentation (matches README access model) |
| Content cards | Counts + published/draft + Manage / Add / **View site ↗** |
| Enquiry cards | Open / new / week; amber highlight when backlog &gt; 0 |
| Recent enquiries | Table with change links |
| Unpublished drafts | Latest unpublished designs & packages |
| Contract pipeline | Counts by status |
| Active builds | Stage + progress |
| Frontend reference | Public routes ↔ models (e.g. `/home-designs`, `/pro/home`) |

Template: `templates/admin/index.html` (extends Unfold `base_site`, then includes default app list + history).

---

## Model admin enhancements (data-entry convenience)

### Home designs (`homes/admin.py`)

- Inlines: gallery, features, **DesignInclusion** (real Inclusion FKs)
- `filter_horizontal` for **related_designs**
- `list_editable`: featured, published  
- **Frontend reference** readonly panel + **View ↗** column → `/home-designs/<slug>`
- Fieldsets grouped: basic, specs, media, story, related, publishing  
- `save_on_top`

### Home & land packages (`land/admin.py`)

- Same pattern: gallery / feature / **PackageInclusion** inlines  
- Estate autocomplete  
- Preview panel → `/home-land/<slug>`

### Inclusions (`core/admin.py`)

- `search_fields` for autocomplete from design/package inlines  
- Features via line-based widget  
- list_editable order / featured / published  

### Pro (`pro/admin.py`)

- Contracts, builds, milestones, threads, notifications, client inclusions registered for sales staff  

---

## What is solid

- Unfold is correctly installed **before** `django.contrib.admin`  
- Dashboard callback is wired and defensive (`try/except` around Pro models)  
- Sidebar matches real business workflow  
- Frontend reference reduces “where does this show on the site?” confusion  
- M2M inclusions via through-models (not only free-text lists)  

---

## Gaps / follow-ups (optional)

| Item | Why |
|------|-----|
| Image thumbnails in changelist | Unfold can show `list_display` image helpers for hero_image |
| `autocomplete_fields` on more FKs | Faster large libraries |
| User admin filters for `profile__is_client` | Ensure list filters work with custom User/Profile |
| `view_on_site` method on ModelAdmin | Native “view on site” button if `SITE_URL` + method defined |
| Celery/async not required | Dashboard queries are simple counts; fine for free tier |
| Permissions | Non-superuser staff should get group permissions for homes/land/core only |

---

## How to verify after deploy

1. Log into `https://API/admin/` as superuser  
2. Confirm dashboard KPIs (not a blank default index)  
3. Open **Home designs** → add/edit → see **Frontend reference** panel  
4. Link an inclusion via inline → save → check public detail page  
5. Sidebar: switch **Clients** / **ReyHomes Pro** filtered user links  

---

## Access model reminder

| Flag | Who sets it |
|------|-------------|
| `is_superuser` / `is_staff` | Django Admin only |
| `profile.is_client` | Staff/admin only |
| `profile.is_reypro` | Staff/admin only |

Registration must never set these. Frontend Pro routes check `user.is_reypro` from the authenticated API payload.
