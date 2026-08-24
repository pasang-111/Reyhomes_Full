"""
Enrich catalogue with Sandstone Constructions design range (sister brand under ReyCorp).

Public listing facts used where known (beds / baths / garage / approx m²).
Descriptions are written for ReyHomes presentation — group-shared catalogue, not scraped marketing prose.
Idempotent by slug. Safe to re-run after seed_catalogue / seed_all.
"""
from decimal import Decimal

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from core.models import Inclusion
from homes.models import (
    DesignInclusion,
    HomeDesign,
    HomeDesignFeature,
    HomeDesignGallery,
)
from land.models import Estate, HomeLandPackage, PackageFeature, PackageGallery, PackageInclusion
from projects.models import Project, ProjectFeature, ProjectGallery

from ._gen_placeholder import make_placeholder


# Specs from public Sandstone Constructions design listings (beds / baths / garage).
# Areas filled where published (Granada, Sorrento); others estimated in a realistic band.
SANDSTONE_DESIGNS = [
    # Single storey
    {"title": "Malaga", "category": "Single Storey", "bedrooms": 4, "bathrooms": "2.0", "garage": 2, "house_size": "198.0", "frontage": "12.5", "price": "From $415,000", "price_value": "415000", "featured": True, "status": "Popular"},
    {"title": "Granada", "category": "Single Storey", "bedrooms": 5, "bathrooms": "2.5", "garage": 2, "house_size": "226.76", "frontage": "14.0", "price": "From $468,000", "price_value": "468000", "featured": True, "status": "Popular"},
    {"title": "Bilbao", "category": "Single Storey", "bedrooms": 5, "bathrooms": "2.5", "garage": 2, "house_size": "232.0", "frontage": "14.0", "price": "From $475,000", "price_value": "475000", "featured": False, "status": ""},
    # Double storey (public range)
    {"title": "Verona", "category": "Double Storey", "bedrooms": 4, "bathrooms": "2.5", "garage": 2, "house_size": "248.2", "frontage": "12.5", "price": "From $512,000", "price_value": "512000", "featured": True, "status": "Popular"},
    {"title": "Aspen", "category": "Double Storey", "bedrooms": 5, "bathrooms": "3.0", "garage": 1, "house_size": "268.0", "frontage": "12.5", "price": "From $545,000", "price_value": "545000", "featured": True, "status": "Featured"},
    {"title": "Capri", "category": "Double Storey", "bedrooms": 4, "bathrooms": "4.0", "garage": 2, "house_size": "255.0", "frontage": "12.5", "price": "From $528,000", "price_value": "528000", "featured": False, "status": ""},
    {"title": "Turin", "category": "Double Storey", "bedrooms": 4, "bathrooms": "2.5", "garage": 1, "house_size": "218.0", "frontage": "10.0", "price": "From $462,000", "price_value": "462000", "featured": False, "status": ""},
    {"title": "Camden", "category": "Double Storey", "bedrooms": 5, "bathrooms": "2.5", "garage": 2, "house_size": "272.0", "frontage": "14.0", "price": "From $555,000", "price_value": "555000", "featured": True, "status": "New Release"},
    {"title": "Zurich", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 2, "house_size": "260.0", "frontage": "12.5", "price": "From $535,000", "price_value": "535000", "featured": False, "status": ""},
    {"title": "Florence", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 1, "house_size": "242.0", "frontage": "11.0", "price": "From $498,000", "price_value": "498000", "featured": False, "status": ""},
    {"title": "Sorrento", "category": "Double Storey", "bedrooms": 4, "bathrooms": "2.0", "garage": 1, "house_size": "206.06", "frontage": "10.0", "price": "From $455,000", "price_value": "455000", "featured": True, "status": "Popular"},
    {"title": "Lille", "category": "Double Storey", "bedrooms": 5, "bathrooms": "3.0", "garage": 1, "house_size": "275.0", "frontage": "12.5", "price": "From $562,000", "price_value": "562000", "featured": False, "status": ""},
    {"title": "Genoa", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 1, "house_size": "238.0", "frontage": "11.0", "price": "From $492,000", "price_value": "492000", "featured": False, "status": ""},
    {"title": "Dover", "category": "Double Storey", "bedrooms": 5, "bathrooms": "2.5", "garage": 1, "house_size": "258.0", "frontage": "12.5", "price": "From $538,000", "price_value": "538000", "featured": False, "status": ""},
    {"title": "York", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 2, "house_size": "252.0", "frontage": "12.5", "price": "From $522,000", "price_value": "522000", "featured": False, "status": ""},
    {"title": "Seville", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 1, "house_size": "245.0", "frontage": "11.0", "price": "From $505,000", "price_value": "505000", "featured": False, "status": ""},
    {"title": "Monaco", "category": "Double Storey", "bedrooms": 4, "bathrooms": "2.5", "garage": 2, "house_size": "250.0", "frontage": "12.5", "price": "From $518,000", "price_value": "518000", "featured": False, "status": ""},
    {"title": "Bristol", "category": "Double Storey", "bedrooms": 5, "bathrooms": "3.0", "garage": 1, "house_size": "278.0", "frontage": "12.5", "price": "From $570,000", "price_value": "570000", "featured": False, "status": ""},
    {"title": "Porto", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 1, "house_size": "240.0", "frontage": "11.0", "price": "From $495,000", "price_value": "495000", "featured": False, "status": ""},
    {"title": "Vienna", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 2, "house_size": "265.0", "frontage": "14.0", "price": "From $548,000", "price_value": "548000", "featured": False, "status": ""},
    {"title": "Milan", "category": "Double Storey", "bedrooms": 5, "bathrooms": "3.0", "garage": 1, "house_size": "280.0", "frontage": "12.5", "price": "From $575,000", "price_value": "575000", "featured": True, "status": "Featured"},
    {"title": "Brighton", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 2, "house_size": "258.0", "frontage": "12.5", "price": "From $530,000", "price_value": "530000", "featured": False, "status": ""},
    {"title": "Barca", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.5", "garage": 2, "house_size": "270.0", "frontage": "14.0", "price": "From $558,000", "price_value": "558000", "featured": False, "status": ""},
    {"title": "Berlin", "category": "Double Storey", "bedrooms": 5, "bathrooms": "5.0", "garage": 2, "house_size": "310.0", "frontage": "15.0", "price": "From $625,000", "price_value": "625000", "featured": True, "status": "New Release"},
    {"title": "Brunswick", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 2, "house_size": "255.0", "frontage": "12.5", "price": "From $525,000", "price_value": "525000", "featured": False, "status": ""},
    {"title": "Burgos", "category": "Double Storey", "bedrooms": 4, "bathrooms": "3.0", "garage": 2, "house_size": "262.0", "frontage": "12.5", "price": "From $540,000", "price_value": "540000", "featured": False, "status": ""},
]

EXTRA_ESTATES = [
    {"name": "Austral Release", "slug": "austral-release", "suburb": "Austral", "state": "NSW", "description": "Growth-corridor lots suited to single and double-storey packages, with staged registration through mid-2026."},
    {"name": "Summit Place", "slug": "summit-place", "suburb": "Leppington", "state": "NSW", "description": "Established estate streets with a mix of 10 m and 12.5 m frontages — ideal for Sorrento and Verona-class plans."},
]

EXTRA_PACKAGES = [
    {"title": "Granada at Austral", "slug": "granada-austral", "estate_slug": "austral-release", "suburb": "Austral", "bedrooms": 5, "bathrooms": "2.5", "garage": 2, "house_size": "226.76", "land_size": "420", "price": "$1,165,000", "price_value": "1165000", "featured": True, "description": "Five-bedroom Granada single-storey on a practical Austral lot — house and land package with standard site costs in scope."},
    {"title": "Malaga at Austral", "slug": "malaga-austral", "estate_slug": "austral-release", "suburb": "Austral", "bedrooms": 4, "bathrooms": "2.0", "garage": 2, "house_size": "198.0", "land_size": "375", "price": "$1,085,000", "price_value": "1085000", "featured": True, "description": "Four-bedroom Malaga package for first-home and upgrader buyers in Austral."},
    {"title": "Sorrento at Summit Place", "slug": "sorrento-summit-place", "estate_slug": "summit-place", "suburb": "Leppington", "bedrooms": 4, "bathrooms": "2.0", "garage": 1, "house_size": "206.06", "land_size": "350", "price": "$1,125,000", "price_value": "1125000", "featured": False, "description": "Narrow-lot Sorrento double-storey at Summit Place, Leppington."},
    {"title": "Camden at Willow Creek", "slug": "camden-willow-creek", "estate_slug": "willow-creek", "suburb": "Leppington", "bedrooms": 5, "bathrooms": "2.5", "garage": 2, "house_size": "272.0", "land_size": "480", "price": "$1,380,000", "price_value": "1380000", "featured": True, "description": "Five-bedroom Camden package on a wider Willow Creek lot."},
    {"title": "Berlin at Harbour View", "slug": "berlin-harbour-view", "estate_slug": "harbour-view", "suburb": "Schofields", "bedrooms": 5, "bathrooms": "5.0", "garage": 2, "house_size": "310.0", "land_size": "520", "price": "$1,550,000", "price_value": "1550000", "featured": True, "description": "Flagship Berlin plan — five bathrooms and dual living — on a premium Harbour View lot."},
]

EXTRA_PROJECTS = [
    {"title": "6 Kuiper Street, Box Hill", "slug": "6-kuiper-street-box-hill", "location": "Box Hill, NSW", "category": "Double Storey", "status": "completed", "featured": True, "description": "Completed family home at Kuiper Street — articulated facade, open rear living and landscaped frontage delivered on a standard suburban lot."},
    {"title": "Summit Place Semi-Hampton, Leppington", "slug": "summit-place-semi-hampton", "location": "Leppington, NSW", "category": "Single Storey", "status": "completed", "featured": True, "description": "Semi-Hampton style single-storey with soft classical detailing and a practical garage mud-room connection."},
    {"title": "Austral New Release Display", "slug": "austral-new-release-display", "location": "Austral, NSW", "category": "Double Storey", "status": "upcoming", "featured": True, "description": "Upcoming display residence in the Austral release — package buyers can inspect finishes and facade options once open."},
]


def _desc(title, category, beds, baths, garage, size):
    storey = "single-storey" if "Single" in category else "double-storey"
    return (
        f"The {title} is a {storey} design from the ReyHomes × Sandstone shared collection — "
        f"{beds} bedrooms, {baths} bathrooms and {garage} car space(s), approximately {size} m². "
        f"Planned for NSW lots with clear living / sleeping separation, natural light to the main "
        f"living wing, and inclusions aligned to the ReyHomes standard, signature and atelier tiers."
    )


def _attach(instance, field, label, size=(1600, 1000), seed=None):
    if getattr(instance, field):
        return
    data = make_placeholder(label[:32], size=size, seed=seed or label)
    getattr(instance, field).save(f"{slugify(label)[:40] or 'img'}.jpg", ContentFile(data), save=True)


class Command(BaseCommand):
    help = "Upsert Sandstone sister-brand design range + extra packages/projects into ReyHomes DB."

    def handle(self, *args, **options):
        d_c = d_u = p_c = p_u = pr_c = pr_u = e_c = e_u = 0
        samples = []

        inclusions = list(Inclusion.objects.filter(published=True).order_by("order")[:6])

        with transaction.atomic():
            for i, row in enumerate(SANDSTONE_DESIGNS):
                slug = slugify(row["title"])
                baths = Decimal(row["bathrooms"])
                obj, created = HomeDesign.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": row["title"],
                        "subtitle": f"Sandstone collection · {row['category']}",
                        "category": row["category"],
                        "status": row.get("status") or "",
                        "state": "NSW",
                        "price": row["price"],
                        "price_value": Decimal(row["price_value"]),
                        "bedrooms": row["bedrooms"],
                        "bathrooms": baths,
                        "garage": row["garage"],
                        "living": 2 if row["bedrooms"] >= 4 else 1,
                        "study": 1 if row["bedrooms"] >= 5 else 0,
                        "house_size": row["house_size"],
                        "frontage": row["frontage"],
                        "depth": "20.0" if "Double" in row["category"] else "22.0",
                        "min_lot_width": row["frontage"],
                        "description": _desc(
                            row["title"], row["category"], row["bedrooms"],
                            row["bathrooms"], row["garage"], row["house_size"],
                        ),
                        "featured": row["featured"],
                        "published": True,
                    },
                )
                if created:
                    d_c += 1
                else:
                    d_u += 1
                _attach(obj, "hero_image", row["title"], seed=f"ss-{i}")
                _attach(obj, "floor_plan", f"{row['title']} plan", size=(1200, 1600), seed=f"ss-fp-{i}")
                if obj.gallery_images.count() < 3:
                    for g in range(3):
                        gal = HomeDesignGallery(
                            home_design=obj, alt_text=f"{row['title']} {g+1}", order=g
                        )
                        gal.save()
                        _attach(gal, "image", f"{row['title']} g{g+1}", seed=f"ss-g-{i}-{g}")
                if obj.features.count() == 0:
                    HomeDesignFeature.objects.create(
                        home_design=obj,
                        title="Shared ReyCorp collection",
                        description="Available through ReyHomes with Sandstone construction quality standards.",
                        order=0,
                    )
                    HomeDesignFeature.objects.create(
                        home_design=obj,
                        title=f"{row['bedrooms']} bed · {row['bathrooms']} bath · {row['garage']} car",
                        description=f"Approximately {row['house_size']} m² on a {row['frontage']} m min frontage.",
                        order=1,
                    )
                if inclusions and obj.inclusion_links.count() == 0:
                    for li, inc in enumerate(inclusions):
                        DesignInclusion.objects.get_or_create(
                            home_design=obj, inclusion=inc, defaults={"order": li}
                        )
                if len(samples) < 5:
                    samples.append(
                        {
                            "slug": obj.slug,
                            "title": obj.title,
                            "beds": obj.bedrooms,
                            "baths": str(obj.bathrooms),
                            "garage": obj.garage,
                            "size": obj.house_size,
                            "price": obj.price,
                        }
                    )

            estate_map = {e.slug: e for e in Estate.objects.all()}
            for row in EXTRA_ESTATES:
                obj, created = Estate.objects.update_or_create(
                    slug=row["slug"],
                    defaults={
                        "name": row["name"],
                        "suburb": row["suburb"],
                        "state": row["state"],
                        "description": row["description"],
                        "published": True,
                    },
                )
                estate_map[row["slug"]] = obj
                if created:
                    e_c += 1
                else:
                    e_u += 1

            for i, row in enumerate(EXTRA_PACKAGES):
                estate = estate_map.get(row["estate_slug"])
                obj, created = HomeLandPackage.objects.update_or_create(
                    slug=row["slug"],
                    defaults={
                        "title": row["title"],
                        "estate": estate,
                        "category": "House & Land",
                        "suburb": row["suburb"],
                        "state": "NSW",
                        "price": row["price"],
                        "price_value": Decimal(row["price_value"]),
                        "bedrooms": row["bedrooms"],
                        "bathrooms": Decimal(row["bathrooms"]),
                        "garage": row["garage"],
                        "house_size": row["house_size"],
                        "land_size": row["land_size"],
                        "description": row["description"],
                        "featured": row["featured"],
                        "published": True,
                        "badge": "Popular" if row["featured"] else "",
                    },
                )
                if created:
                    p_c += 1
                else:
                    p_u += 1
                _attach(obj, "hero_image", row["title"], seed=f"ssp-{i}")
                if obj.gallery_images.count() < 2:
                    for g in range(2):
                        gal = PackageGallery(package=obj, alt_text=f"{row['title']} {g+1}", order=g)
                        gal.save()
                        _attach(gal, "image", f"{row['title']} g{g+1}", seed=f"ssp-g-{i}-{g}")
                if obj.features.count() == 0:
                    PackageFeature.objects.create(
                        package=obj,
                        title="House & land included",
                        description=f"{row['land_size']} m² lot with standard package site costs.",
                        order=0,
                    )
                if inclusions and obj.inclusion_links.count() == 0:
                    for li, inc in enumerate(inclusions[:5]):
                        PackageInclusion.objects.get_or_create(
                            package=obj, inclusion=inc, defaults={"order": li}
                        )

            for i, row in enumerate(EXTRA_PROJECTS):
                obj, created = Project.objects.update_or_create(
                    slug=row["slug"],
                    defaults={
                        "title": row["title"],
                        "location": row["location"],
                        "category": row["category"],
                        "status": row["status"],
                        "description": row["description"],
                        "featured": row["featured"],
                        "published": True,
                    },
                )
                if created:
                    pr_c += 1
                else:
                    pr_u += 1
                _attach(obj, "hero_image", row["title"], seed=f"sspr-{i}")
                if obj.gallery_images.count() < 2:
                    for g in range(2):
                        gal = ProjectGallery(project=obj, alt_text=f"{row['title']} {g+1}", order=g)
                        gal.save()
                        _attach(gal, "image", f"{row['title']} g{g+1}", seed=f"sspr-g-{i}-{g}")
                if obj.features.count() == 0:
                    ProjectFeature.objects.create(
                        project=obj,
                        title="ReyCorp delivery",
                        description="Built to group quality standards shared across ReyHomes and Sandstone.",
                        order=0,
                    )

        self.stdout.write(self.style.SUCCESS(
            f"Designs created={d_c} updated={d_u} | Estates c={e_c} u={e_u} | "
            f"Packages c={p_c} u={p_u} | Projects c={pr_c} u={pr_u}"
        ))
        self.stdout.write("Sample Sandstone-range designs:")
        for s in samples:
            self.stdout.write(f"  {s}")
        self.stdout.write(
            f"Totals now: designs={HomeDesign.objects.count()} "
            f"packages={HomeLandPackage.objects.count()} "
            f"projects={Project.objects.count()}"
        )
