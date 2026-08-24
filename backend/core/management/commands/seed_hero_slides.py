"""Idempotent seed for HeroSlide — original ReyHomes copy, image placeholders, no third-party video."""
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from core.models import HeroSlide

from ._gen_placeholder import make_placeholder


SLIDES = [
    {
        "title": "Homes shaped by craft, not convention",
        "subtitle": "ReyHomes Collection",
        "description": (
            "Every facade, floor plan and finish is resolved with the same care "
            "we bring to the final handover — considered architecture for the way "
            "Sydney families actually live."
        ),
        "button_text": "Explore home designs",
        "button_link": "/home-designs",
        "order": 0,
    },
    {
        "title": "House and land, resolved as one",
        "subtitle": "Turnkey packages",
        "description": (
            "Secure a package with land already matched to the plan — fixed-scope "
            "pricing, clear inclusions, and a build pathway designed to remove guesswork."
        ),
        "button_text": "View home & land",
        "button_link": "/home-land",
        "order": 1,
    },
    {
        "title": "From first conversation to the keys",
        "subtitle": "A considered process",
        "description": (
            "Consultation, documentation, approvals and construction — each stage "
            "is transparent, scheduled, and led by a dedicated project team."
        ),
        "button_text": "See the journey",
        "button_link": "/process-timeline",
        "order": 2,
    },
    {
        "title": "Built for the long view",
        "subtitle": "Quality you can measure",
        "description": (
            "Structural integrity, refined detailing and finishes chosen to endure — "
            "because a ReyHomes residence is meant to feel as considered in ten years "
            "as it does on day one."
        ),
        "button_text": "Book a consultation",
        "button_link": "/enquire",
        "order": 3,
    },
]


class Command(BaseCommand):
    help = "Upsert 4 active HeroSlide records with original copy and placeholder imagery."

    def handle(self, *args, **options):
        created = updated = 0
        samples = []
        for row in SLIDES:
            obj, was_created = HeroSlide.objects.update_or_create(
                order=row["order"],
                defaults={
                    "title": row["title"],
                    "subtitle": row["subtitle"],
                    "description": row["description"],
                    "button_text": row["button_text"],
                    "button_link": row["button_link"],
                    "active": True,
                    # video / poster intentionally blank — no third-party footage
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

            if not obj.image:
                data = make_placeholder(row["title"][:28], "Hero", size=(1920, 1080), seed=f"hero-{row['order']}")
                obj.image.save(f"hero-{row['order']}.jpg", ContentFile(data), save=True)
            if not obj.mobile_image:
                data = make_placeholder(row["title"][:20], "Mobile", size=(1080, 1920), seed=f"hero-m-{row['order']}")
                obj.mobile_image.save(f"hero-m-{row['order']}.jpg", ContentFile(data), save=True)

            samples.append(
                {
                    "order": obj.order,
                    "title": obj.title,
                    "subtitle": obj.subtitle,
                    "button_link": obj.button_link,
                    "active": obj.active,
                    "has_image": bool(obj.image),
                    "has_video": bool(obj.video),
                }
            )

        self.stdout.write(self.style.SUCCESS(f"HeroSlide created={created} updated={updated}"))
        for s in samples:
            self.stdout.write(f"  [{s['order']}] {s['title']!r} → {s['button_link']} image={s['has_image']} video={s['has_video']}")
