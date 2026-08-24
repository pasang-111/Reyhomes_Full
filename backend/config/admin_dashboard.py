"""
Unfold admin dashboard for ReyHomes.

Wired via settings.UNFOLD["DASHBOARD_CALLBACK"] and ENVIRONMENT.
Staff landing page shows KPIs, publishing status, enquiry backlog,
contract pipeline, active builds, and one-click shortcuts aligned to
the public site routes employees manage.
"""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count
from django.utils import timezone

User = get_user_model()


def environment_callback(request):
    """Top-bar environment badge (Development vs Production)."""
    from django.conf import settings

    if settings.DEBUG:
        return ["Development", "warning"]
    return ["Production", "danger"]


def _safe_count(qs):
    try:
        return qs.count()
    except Exception:
        return 0


def dashboard_callback(request, context):
    from core.models import HeroSlide, Inclusion, Testimonial
    from homes.models import HomeDesign
    from land.models import HomeLandPackage, Estate
    from enquiries.models import Enquiry

    now = timezone.now()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    users = User.objects.all()
    role_counts = {
        "admins": users.filter(is_superuser=True).count(),
        "staff": users.filter(is_staff=True, is_superuser=False).count(),
        "clients": users.filter(
            is_staff=False, is_superuser=False, profile__is_client=True
        ).count(),
        "pro_clients": users.filter(
            is_staff=False, is_superuser=False, profile__is_reypro=True
        ).count(),
        "registered_users": users.filter(
            is_staff=False, is_superuser=False, profile__is_client=False
        ).count(),
        "new_30d": users.filter(date_joined__gte=month_ago).count(),
    }

    designs_total = _safe_count(HomeDesign.objects.all())
    designs_pub = _safe_count(HomeDesign.objects.filter(published=True))
    packages_total = _safe_count(HomeLandPackage.objects.all())
    packages_pub = _safe_count(HomeLandPackage.objects.filter(published=True))
    inclusions_total = _safe_count(Inclusion.objects.all())
    inclusions_pub = _safe_count(Inclusion.objects.filter(published=True))
    heroes_total = _safe_count(HeroSlide.objects.all())
    heroes_active = _safe_count(HeroSlide.objects.filter(active=True))
    testimonials_pub = _safe_count(Testimonial.objects.filter(published=True))
    estates_pub = _safe_count(Estate.objects.filter(published=True))

    try:
        open_enquiries = Enquiry.objects.exclude(
            status__in=["closed", "resolved", "won", "lost"]
        )
        enquiries_new = Enquiry.objects.filter(status="new")
        enquiries_week = Enquiry.objects.filter(created_at__gte=week_ago)
    except Exception:
        open_enquiries = Enquiry.objects.none()
        enquiries_new = Enquiry.objects.none()
        enquiries_week = Enquiry.objects.none()

    # Pro / sales (optional if migrations lag)
    active_builds = []
    pipeline = []
    contracts_open = 0
    try:
        from pro.models import BuildProject, Contract

        active_builds = list(
            BuildProject.objects.exclude(current_stage="handover")
            .select_related("contract", "contract__client")
            .order_by("-updated_at")[:8]
        )
        contracts_open = Contract.objects.exclude(
            status__in=["completed", "cancelled", "lost"]
        ).count()
        status_labels = dict(getattr(Contract, "STATUS_CHOICES", []))
        contract_pipeline = (
            Contract.objects.values("status")
            .annotate(total=Count("id"))
            .order_by()
        )
        pipeline = [
            {
                "label": status_labels.get(row["status"], row["status"]),
                "value": row["total"],
                "status": row["status"],
            }
            for row in contract_pipeline
        ]
    except Exception:
        pass

    try:
        recent_enquiries = list(Enquiry.objects.order_by("-created_at")[:8])
    except Exception:
        recent_enquiries = []

    # Draft / unpublished content that needs attention
    drafts = []
    for obj in HomeDesign.objects.filter(published=False).order_by("-updated_at")[:5]:
        drafts.append(
            {
                "kind": "Design",
                "title": obj.title,
                "url": f"/admin/homes/homedesign/{obj.pk}/change/",
                "when": obj.updated_at,
            }
        )
    for obj in HomeLandPackage.objects.filter(published=False).order_by("-updated_at")[:5]:
        drafts.append(
            {
                "kind": "Package",
                "title": obj.title,
                "url": f"/admin/land/homelandpackage/{obj.pk}/change/",
                "when": obj.updated_at,
            }
        )
    drafts = sorted(drafts, key=lambda d: d["when"] or now, reverse=True)[:6]

    kpi_cards = [
        {
            "title": "Total accounts",
            "metric": users.count(),
            "footer": f"+{role_counts['new_30d']} in last 30 days",
            "icon": "group",
            "link": "/admin/auth/user/",
        },
        {
            "title": "Administrators",
            "metric": role_counts["admins"],
            "footer": "Full system access",
            "icon": "admin_panel_settings",
            "link": "/admin/auth/user/?is_superuser__exact=1",
        },
        {
            "title": "Staff",
            "metric": role_counts["staff"],
            "footer": "Authorised team members",
            "icon": "badge",
            "link": "/admin/auth/user/?is_staff__exact=1",
        },
        {
            "title": "Clients",
            "metric": role_counts["clients"],
            "footer": f"{role_counts['pro_clients']} on ReyHomes Pro",
            "icon": "handshake",
            "link": "/admin/auth/user/?profile__is_client__exact=1",
        },
        {
            "title": "Registered users",
            "metric": role_counts["registered_users"],
            "footer": "Not yet promoted to Client",
            "icon": "person",
            "link": "/admin/auth/user/",
        },
    ]

    content_cards = [
        {
            "title": "Home designs",
            "metric": designs_total,
            "footer": f"{designs_pub} published · {designs_total - designs_pub} draft",
            "icon": "villa",
            "link": "/admin/homes/homedesign/",
            "add": "/admin/homes/homedesign/add/",
            "site": "/home-designs",
        },
        {
            "title": "Home & land packages",
            "metric": packages_total,
            "footer": f"{packages_pub} published · {packages_total - packages_pub} draft",
            "icon": "holiday_village",
            "link": "/admin/land/homelandpackage/",
            "add": "/admin/land/homelandpackage/add/",
            "site": "/home-land",
        },
        {
            "title": "Inclusion library",
            "metric": inclusions_total,
            "footer": f"{inclusions_pub} published",
            "icon": "checklist",
            "link": "/admin/core/inclusion/",
            "add": "/admin/core/inclusion/add/",
            "site": "/inclusions",
        },
        {
            "title": "Hero slides",
            "metric": heroes_total,
            "footer": f"{heroes_active} active on homepage",
            "icon": "auto_awesome",
            "link": "/admin/core/heroslide/",
            "add": "/admin/core/heroslide/add/",
            "site": "/",
        },
        {
            "title": "Testimonials",
            "metric": testimonials_pub,
            "footer": "Published on site",
            "icon": "reviews",
            "link": "/admin/core/testimonial/",
            "add": "/admin/core/testimonial/add/",
            "site": "/testimonials",
        },
        {
            "title": "Estates",
            "metric": estates_pub,
            "footer": "Published estates",
            "icon": "location_city",
            "link": "/admin/land/estate/",
            "add": "/admin/land/estate/add/",
            "site": "/home-land",
        },
    ]

    enquiry_cards = [
        {
            "title": "Total enquiries",
            "metric": _safe_count(Enquiry.objects.all()),
            "footer": "All time",
            "icon": "mail",
            "link": "/admin/enquiries/enquiry/",
        },
        {
            "title": "Awaiting action",
            "metric": _safe_count(open_enquiries),
            "footer": "Not yet closed",
            "icon": "priority_high",
            "link": "/admin/enquiries/enquiry/?status__exact=new",
            "alert": True,
        },
        {
            "title": "New this week",
            "metric": _safe_count(enquiries_week),
            "footer": "Last 7 days",
            "icon": "schedule",
            "link": "/admin/enquiries/enquiry/",
        },
        {
            "title": "Status: New",
            "metric": _safe_count(enquiries_new),
            "footer": "Unassigned / unopened",
            "icon": "mark_email_unread",
            "link": "/admin/enquiries/enquiry/?status__exact=new",
            "alert": True,
        },
    ]

    quick_actions = [
        {
            "title": "Add home design",
            "description": "New floor plan & pricing",
            "icon": "add_home",
            "link": "/admin/homes/homedesign/add/",
        },
        {
            "title": "Add package",
            "description": "Home & land offering",
            "icon": "add_business",
            "link": "/admin/land/homelandpackage/add/",
        },
        {
            "title": "Add inclusion",
            "description": "Library item / brochure",
            "icon": "playlist_add",
            "link": "/admin/core/inclusion/add/",
        },
        {
            "title": "Hero slides",
            "description": "Homepage video & CTAs",
            "icon": "slideshow",
            "link": "/admin/core/heroslide/",
        },
        {
            "title": "Open enquiries",
            "description": "Respond to leads",
            "icon": "inbox",
            "link": "/admin/enquiries/enquiry/?status__exact=new",
        },
        {
            "title": "Site settings",
            "description": "Phone, email, logos",
            "icon": "tune",
            "link": "/admin/core/sitesetting/",
        },
    ]

    frontend_map = [
        {"label": "Home", "path": "/", "models": "Hero slides"},
        {"label": "Home designs", "path": "/home-designs", "models": "Home designs"},
        {"label": "Home & land", "path": "/home-land", "models": "Packages & estates"},
        {"label": "Inclusions", "path": "/inclusions", "models": "Inclusion library"},
        {"label": "Projects", "path": "/projects", "models": "Projects"},
        {"label": "Testimonials", "path": "/testimonials", "models": "Testimonials"},
        {"label": "Client Pro portal", "path": "/pro/home", "models": "Contracts & builds"},
    ]


    # Data accuracy vs public site
    integrity = []
    try:
        from django.db.models import Q, Count as DjCount
        no_hero = HomeDesign.objects.filter(
            published=True
        ).filter(Q(hero_image="") | Q(hero_image__isnull=True)).count()
        if no_hero:
            integrity.append({"level": "warn", "label": f"{no_hero} published design(s) missing hero image"})
        no_price = HomeDesign.objects.filter(published=True, price_value__isnull=True).count()
        if no_price:
            integrity.append({"level": "warn", "label": f"{no_price} published design(s) missing numeric price_value"})
        featured_draft = HomeDesign.objects.filter(featured=True, published=False).count()
        if featured_draft:
            integrity.append({"level": "info", "label": f"{featured_draft} featured design(s) still draft"})
        if _safe_count(enquiries_new):
            integrity.append({"level": "alert", "label": f"{_safe_count(enquiries_new)} new enquir(y/ies) to action"})
        if not integrity:
            integrity.append({"level": "ok", "label": "No integrity issues detected"})
    except Exception:
        integrity = [{"level": "ok", "label": "Integrity checks skipped"}]

    context.update(
        {
            "kpi_cards": kpi_cards,
            "content_cards": content_cards,
            "enquiry_cards": enquiry_cards,
            "quick_actions": quick_actions,
            "frontend_map": frontend_map,
            "active_builds": active_builds,
            "recent_enquiries": recent_enquiries,
            "contract_pipeline": pipeline,
            "contracts_open": contracts_open,
            "draft_items": drafts,
            "dashboard_user": request.user,
            "dashboard_now": now,
            "integrity_items": integrity,
        }
    )
    return context
