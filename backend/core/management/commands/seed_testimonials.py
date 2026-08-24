"""Idempotent seed for Testimonial records.

Written reviews are original ReyHomes-toned copy.
video_url points at public Sandstone Constructions YouTube embeds
(sister company under ReyCorp) — we do NOT download or rehost footage.
"""
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from core.models import Testimonial

from ._gen_placeholder import make_placeholder


# Public Sandstone Constructions channel videos (embed URLs only).
ROWS = [
    {
        "name": "Sarah & Mark Thompson",
        "role": "Homeowners",
        "suburb": "Leppington, NSW",
        "design": "Ravello",
        "review": (
            "From the first consultation through to handover, the team kept us informed "
            "and the finish quality exceeded what we expected at this price point. "
            "Our Ravello feels calm, bright and built to last."
        ),
        "rating": 5,
        "featured": True,
        "video_url": "https://www.youtube.com/embed/hIOj7yQzpRM",  # Trusted Builders NSW | Client Testimonial
    },
    {
        "name": "Priya Nair",
        "role": "First-home buyer",
        "suburb": "Schofields, NSW",
        "design": "Verona package",
        "review": (
            "The house-and-land package removed so much uncertainty. Contract clarity, "
            "milestone updates and a site team that actually answered the phone made "
            "the process manageable with a young family."
        ),
        "rating": 5,
        "featured": True,
        "video_url": "https://www.youtube.com/embed/-DnmOq5WxQE",  # Hear what our clients have to say
    },
    {
        "name": "James Okonkwo",
        "role": "Knockdown-rebuild client",
        "suburb": "Inner West, NSW",
        "design": "Custom double storey",
        "review": (
            "Rebuilding on our existing block was complex — heritage overlays and "
            "neighbours to manage. ReyHomes coordinated approvals carefully and the "
            "final facade is exactly what we sketched on day one."
        ),
        "rating": 5,
        "featured": True,
        "video_url": "https://www.youtube.com/embed/afBNjQB_nnc",  # trust and satisfaction
    },
    {
        "name": "Emily Walsh",
        "role": "Homeowner",
        "suburb": "Box Hill, NSW",
        "design": "Aspen",
        "review": (
            "Five bedrooms done properly — storage, bathrooms and a rumpus the kids "
            "actually use. Communication during frame and lock-up stages was excellent."
        ),
        "rating": 5,
        "featured": False,
        "video_url": "https://www.youtube.com/embed/cDjA_Uvvi4s",  # Welcome to 6 Kuiper Street, Box Hill
    },
    {
        "name": "David & Hannah Lee",
        "role": "Investors turned owner-occupiers",
        "suburb": "Oran Park, NSW",
        "design": "Capri",
        "review": (
            "We initially planned to invest, then decided to move in ourselves. "
            "The inclusions schedule was transparent and the defects list after "
            "practical completion was short and closed quickly."
        ),
        "rating": 4,
        "featured": False,
        "video_url": "https://www.youtube.com/embed/Gp3HvUGdCqk",  # A Home Crafted for a Lifetime
    },
]


class Command(BaseCommand):
    help = "Upsert testimonials by name+design natural key (YouTube embeds, no file rehost)."

    def handle(self, *args, **options):
        created = updated = 0
        samples = []
        for i, row in enumerate(ROWS):
            obj, was_created = Testimonial.objects.update_or_create(
                name=row["name"],
                design=row["design"],
                defaults={
                    "role": row["role"],
                    "suburb": row["suburb"],
                    "review": row["review"],
                    "rating": row["rating"],
                    "featured": row["featured"],
                    "published": True,
                    "video_url": row.get("video_url") or "",
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1
            if not obj.photo:
                data = make_placeholder(row["name"].split()[0], "Client", size=(600, 600), seed=f"testi-{i}")
                obj.photo.save(f"testimonial-{i}.jpg", ContentFile(data), save=True)
            if len(samples) < 5:
                samples.append(
                    {
                        "name": obj.name,
                        "design": obj.design,
                        "video_url": obj.video_url,
                        "rating": obj.rating,
                    }
                )
        self.stdout.write(self.style.SUCCESS(f"Testimonial created={created} updated={updated}"))
        for s in samples:
            self.stdout.write(f"  {s}")
