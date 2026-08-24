"""
Idempotent catalogue seed: Inclusion, HomeDesign (+gallery/features/links),
Estate, HomeLandPackage (+gallery/features/links), Project (+gallery/features).

Original ReyHomes copy. Structure inspired by typical NSW single/double-storey
ranges — not a scrape of third-party photography or marketing text.
Images: generated placeholders via _gen_placeholder (dev/demo only).
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
from land.models import (
    Estate,
    HomeLandPackage,
    PackageFeature,
    PackageGallery,
    PackageInclusion,
)
from projects.models import Project, ProjectFeature, ProjectGallery

from ._gen_placeholder import make_placeholder


INCLUSIONS = [
    {
        "title": "Architectural Facade Package",
        "category": "facade",
        "tier": "signature",
        "subtitle": "Street presence, resolved",
        "description": "Feature brick or render combinations, articulated entries and balanced proportions designed for lasting kerb appeal.",
        "features": ["Feature entry portal", "Mixed material facade", "Designer letterbox package"],
        "icon": "Home",
        "featured": True,
        "order": 0,
    },
    {
        "title": "Kitchen Atelier Collection",
        "category": "kitchen",
        "tier": "atelier",
        "subtitle": "The working heart of the home",
        "description": "Stone benchtops, soft-close joinery, premium appliance package and a walk-in pantry engineered for real family cooking.",
        "features": ["40mm engineered stone", "Soft-close drawers", "900mm oven package", "Walk-in pantry"],
        "icon": "CookingPot",
        "featured": True,
        "order": 1,
    },
    {
        "title": "Bath & Ensuite Suite",
        "category": "bathroom",
        "tier": "signature",
        "subtitle": "Calm, tactile finishes",
        "description": "Floor-to-ceiling tiling zones, frameless shower screens and quality tapware selected for daily durability.",
        "features": ["Frameless showers", "Wall-hung vanities", "LED mirror cabinets"],
        "icon": "Bath",
        "featured": True,
        "order": 2,
    },
    {
        "title": "Flooring Continuity Package",
        "category": "flooring",
        "tier": "standard",
        "subtitle": "Flow from room to room",
        "description": "Hard-wearing timber-look floors through living zones with plush carpet to bedrooms for acoustic comfort.",
        "features": ["Hybrid living floors", "Carpet to bedrooms", "Tiled wet areas"],
        "icon": "Layers",
        "featured": False,
        "order": 3,
    },
    {
        "title": "Climate & Comfort System",
        "category": "electrical",
        "tier": "signature",
        "subtitle": "Year-round ease",
        "description": "Ducted reverse-cycle air conditioning with zoned control and LED lighting throughout.",
        "features": ["Ducted reverse-cycle", "Zone controls", "LED downlights"],
        "icon": "Thermometer",
        "featured": True,
        "order": 4,
    },
    {
        "title": "Outdoor Living Extension",
        "category": "exterior",
        "tier": "atelier",
        "subtitle": "Indoor-outdoor connection",
        "description": "Covered alfresco with ceiling fan provision, outdoor power and seamless thresholds from the living wing.",
        "features": ["Covered alfresco", "Outdoor GPO", "Level threshold"],
        "icon": "Trees",
        "featured": False,
        "order": 5,
    },
    {
        "title": "Security & Access",
        "category": "other",
        "tier": "standard",
        "subtitle": "Peace of mind as standard",
        "description": "Deadlocks to external doors, smoke alarms hardwired, and garage remote access.",
        "features": ["Deadlocks", "Hardwired smoke alarms", "Garage remote"],
        "icon": "Shield",
        "featured": False,
        "order": 6,
    },
    {
        "title": "Insulation & Energy Shell",
        "category": "other",
        "tier": "standard",
        "subtitle": "Quiet and efficient",
        "description": "Wall and ceiling insulation to code-plus targets for thermal performance and acoustic comfort.",
        "features": ["Ceiling insulation", "Wall insulation", "Weather seals"],
        "icon": "Leaf",
        "featured": False,
        "order": 7,
    },
]

DESIGNS = [
    {
        "title": "Ravello",
        "category": "Single Storey",
        "subtitle": "Resort calm on a single level",
        "bedrooms": 4, "bathrooms": Decimal("2.5"), "garage": 2, "living": 2, "study": 1,
        "house_size": "224.5", "frontage": "14.0", "depth": "22.5", "min_lot_width": "14.0",
        "price": "From $448,000", "price_value": Decimal("448000"),
        "featured": True, "status": "Popular",
        "description": (
            "Ravello opens into a generous kitchen-dining-living wing that spills onto a "
            "covered alfresco, while the main suite sits quietly apart from secondary bedrooms. "
            "A study nook and dual living zones keep family life flexible without feeling crowded."
        ),
        "features": [
            ("Open living wing", "Kitchen, dining and family room aligned to the rear garden."),
            ("Private main suite", "Walk-in robe and ensuite oriented away from the kids' wing."),
            ("Covered alfresco", "Under-roof outdoor dining with ceiling-fan provision."),
        ],
    },
    {
        "title": "Lugano",
        "category": "Single Storey",
        "subtitle": "Compact, considered family plan",
        "bedrooms": 4, "bathrooms": Decimal("2.0"), "garage": 1, "living": 1, "study": 0,
        "house_size": "196.8", "frontage": "12.5", "depth": "21.0", "min_lot_width": "12.5",
        "price": "From $398,500", "price_value": Decimal("398500"),
        "featured": False, "status": "New Release",
        "description": (
            "Lugano is tuned for narrower lots without sacrificing light or storage. "
            "A central living spine connects the kitchen to an outdoor courtyard, with "
            "three secondary bedrooms clustered for efficient circulation."
        ),
        "features": [
            ("Narrow-lot ready", "Optimised for 12.5 m frontage without cramped rooms."),
            ("Courtyard light", "Central void pulls daylight deep into the plan."),
        ],
    },
    {
        "title": "Verona",
        "category": "Double Storey",
        "subtitle": "Vertical living with a quiet upper floor",
        "bedrooms": 4, "bathrooms": Decimal("2.5"), "garage": 2, "living": 2, "study": 1,
        "house_size": "248.2", "frontage": "12.5", "depth": "18.5", "min_lot_width": "12.5",
        "price": "From $512,000", "price_value": Decimal("512000"),
        "featured": True, "status": "Popular",
        "description": (
            "Verona places formal and informal living on the ground floor and retreats "
            "upstairs for four bedrooms. A first-floor void and balcony give the facade "
            "presence without overcomplicating the structure."
        ),
        "features": [
            ("Ground-floor living", "Kitchen, meals and family oriented to the rear."),
            ("Upper balcony", "Street-facing balcony with refined balustrade."),
            ("Study nook", "Flexible workspace off the entry hall."),
        ],
    },
    {
        "title": "Aspen",
        "category": "Double Storey",
        "subtitle": "Five bedrooms, dual living",
        "bedrooms": 5, "bathrooms": Decimal("3.0"), "garage": 2, "living": 2, "study": 1,
        "house_size": "286.4", "frontage": "14.0", "depth": "20.0", "min_lot_width": "14.0",
        "price": "From $568,000", "price_value": Decimal("568000"),
        "featured": True, "status": "Featured",
        "description": (
            "Aspen is designed for larger households — five bedrooms, three bathrooms "
            "and a rumpus that can shift between media, play or guest use. The kitchen "
            "is sized for serious cooking with a walk-in pantry and island bench."
        ),
        "features": [
            ("Five bedrooms", "Main suite upstairs with three secondary rooms and a fifth on ground."),
            ("Rumpus flex", "Upper living that adapts as the family grows."),
        ],
    },
    {
        "title": "Capri",
        "category": "Double Storey",
        "subtitle": "Light-filled contemporary",
        "bedrooms": 4, "bathrooms": Decimal("2.5"), "garage": 2, "living": 2, "study": 0,
        "house_size": "235.0", "frontage": "12.5", "depth": "17.5", "min_lot_width": "12.5",
        "price": "From $495,000", "price_value": Decimal("495000"),
        "featured": False, "status": "",
        "description": (
            "Capri emphasises glazing and clean lines — a contemporary double-storey "
            "with strong indoor-outdoor connection and a practical mud-room entry from the garage."
        ),
        "features": [
            ("Mud-room entry", "Drop-zone from garage into the kitchen wing."),
            ("Rear glazing", "Stacking doors to the alfresco."),
        ],
    },
    {
        "title": "Sorrento",
        "category": "Double Storey",
        "subtitle": "Balanced street appeal",
        "bedrooms": 4, "bathrooms": Decimal("2.0"), "garage": 1, "living": 2, "study": 0,
        "house_size": "206.1", "frontage": "10.0", "depth": "18.0", "min_lot_width": "10.0",
        "price": "From $455,000", "price_value": Decimal("455000"),
        "featured": False, "status": "Popular",
        "description": (
            "Sorrento works hard on tighter frontages with a single garage and clever "
            "vertical circulation. Ideal for established suburbs where width is constrained "
            "but height is available."
        ),
        "features": [
            ("Narrow frontage", "Designed for 10 m lots."),
            ("Upper living", "Secondary lounge for teens or guests."),
        ],
    },
]

ESTATES = [
    {
        "name": "Willow Creek Estate",
        "slug": "willow-creek",
        "suburb": "Leppington",
        "state": "NSW",
        "description": "Masterplanned community with parks, schools nearby and generous lot depths suited to double-storey living.",
    },
    {
        "name": "Harbour View Residences",
        "slug": "harbour-view",
        "suburb": "Schofields",
        "state": "NSW",
        "description": "Elevated lots with northern aspect opportunities and easy rail access to the Sydney CBD.",
    },
    {
        "name": "Orchard Grove",
        "slug": "orchard-grove",
        "suburb": "Box Hill",
        "state": "NSW",
        "description": "Family-oriented estate with tree-lined streets and a mix of 12.5 m and 14 m frontages.",
    },
]

PACKAGES = [
    {
        "title": "Ravello at Willow Creek",
        "slug": "ravello-willow-creek",
        "estate_slug": "willow-creek",
        "suburb": "Leppington",
        "state": "NSW",
        "bedrooms": 4, "bathrooms": Decimal("2.5"), "garage": 2,
        "house_size": "224.5", "land_size": "450",
        "price": "$1,185,000", "price_value": Decimal("1185000"),
        "featured": True,
        "description": (
            "The Ravello single-storey paired with a 450 m² lot at Willow Creek — "
            "fixed package pricing including site costs within standard inclusions."
        ),
        "features": [
            ("Land included", "450 m² titled lot within the estate."),
            ("Turnkey scope", "House, land and standard site costs in one figure."),
        ],
    },
    {
        "title": "Verona at Harbour View",
        "slug": "verona-harbour-view",
        "estate_slug": "harbour-view",
        "suburb": "Schofields",
        "state": "NSW",
        "bedrooms": 4, "bathrooms": Decimal("2.5"), "garage": 2,
        "house_size": "248.2", "land_size": "375",
        "price": "$1,295,000", "price_value": Decimal("1295000"),
        "featured": True,
        "description": (
            "Double-storey Verona on a north-facing lot at Harbour View Residences, "
            "with package pricing locked at contract."
        ),
        "features": [
            ("North-facing rear", "Living spaces oriented for winter sun."),
            ("Rail access", "Short drive to Schofields station."),
        ],
    },
    {
        "title": "Aspen at Orchard Grove",
        "slug": "aspen-orchard-grove",
        "estate_slug": "orchard-grove",
        "suburb": "Box Hill",
        "state": "NSW",
        "bedrooms": 5, "bathrooms": Decimal("3.0"), "garage": 2,
        "house_size": "286.4", "land_size": "512",
        "price": "$1,420,000", "price_value": Decimal("1420000"),
        "featured": False,
        "description": (
            "Five-bedroom Aspen on a larger Orchard Grove lot — room for a pool zone "
            "and extended outdoor living beyond the alfresco."
        ),
        "features": [
            ("512 m² lot", "Space for outdoor recreation beyond the build footprint."),
        ],
    },
    {
        "title": "Capri at Willow Creek",
        "slug": "capri-willow-creek",
        "estate_slug": "willow-creek",
        "suburb": "Leppington",
        "state": "NSW",
        "bedrooms": 4, "bathrooms": Decimal("2.5"), "garage": 2,
        "house_size": "235.0", "land_size": "400",
        "price": "$1,245,000", "price_value": Decimal("1245000"),
        "featured": False,
        "description": "Contemporary Capri package with balanced land and build costs for first-home and upgrader buyers.",
        "features": [
            ("Contemporary facade", "Clean lines suited to estate covenants."),
        ],
    },
]

PROJECTS = [
    {
        "title": "Kuiper Street Residence",
        "slug": "kuiper-street-box-hill",
        "location": "Box Hill, NSW",
        "category": "Double Storey",
        "status": "completed",
        "featured": True,
        "description": (
            "A completed double-storey family home with articulated facade, "
            "open rear living and a landscaped frontage delivered on a standard suburban lot."
        ),
        "features": [
            ("Facade mix", "Brick and render composition with feature entry."),
            ("Rear living", "Kitchen and family opening to outdoor dining."),
        ],
    },
    {
        "title": "Summit Place Semi-Hampton",
        "slug": "summit-place-leppington",
        "location": "Leppington, NSW",
        "category": "Single Storey",
        "status": "completed",
        "featured": True,
        "description": (
            "Single-storey residence with soft Hampton-inspired detailing, "
            "wide entry and a practical mud-room connection from the garage."
        ),
        "features": [
            ("Hampton detailing", "Classical proportions with modern planning."),
        ],
    },
    {
        "title": "Austral Family Home",
        "slug": "austral-family-home",
        "location": "Austral, NSW",
        "category": "Double Storey",
        "status": "under_construction",
        "featured": False,
        "description": (
            "Currently under construction — dual living zones and five bedrooms "
            "on a corner lot with dual aspect opportunities."
        ),
        "features": [
            ("Corner lot", "Additional side setback for light and privacy."),
        ],
    },
    {
        "title": "Schofields North Release",
        "slug": "schofields-north-release",
        "location": "Schofields, NSW",
        "category": "Double Storey",
        "status": "upcoming",
        "featured": True,
        "description": (
            "Upcoming display-quality residence showcasing the Verona plan with "
            "upgraded facade and landscape package — opening to the public mid season."
        ),
        "features": [
            ("Display home", "Full specification for inspection once complete."),
        ],
    },
    {
        "title": "Orchard Grove Display",
        "slug": "orchard-grove-display",
        "location": "Box Hill, NSW",
        "category": "Double Storey",
        "status": "upcoming",
        "featured": False,
        "description": "Upcoming Aspen display home within Orchard Grove estate.",
        "features": [
            ("Estate display", "Located within the masterplan for easy access."),
        ],
    },
]


def _attach_image(instance, field_name, label, size=(1600, 1000), seed=None):
    field = getattr(instance, field_name)
    if field:
        return
    data = make_placeholder(label[:32], size=size, seed=seed or label)
    getattr(instance, field_name).save(
        f"{slugify(label)[:40] or 'img'}.jpg",
        ContentFile(data),
        save=True,
    )


class Command(BaseCommand):
    help = "Seed inclusions, designs, estates, packages, projects (idempotent by slug)."

    def handle(self, *args, **options):
        counts = {
            "inclusions": [0, 0],
            "designs": [0, 0],
            "estates": [0, 0],
            "packages": [0, 0],
            "projects": [0, 0],
        }
        samples = {"Inclusion": [], "HomeDesign": [], "HomeLandPackage": [], "Project": []}

        with transaction.atomic():
            # --- Inclusions ---
            inclusion_by_slug = {}
            for i, row in enumerate(INCLUSIONS):
                slug = slugify(row["title"])
                obj, created = Inclusion.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": row["title"],
                        "category": row["category"],
                        "tier": row["tier"],
                        "subtitle": row["subtitle"],
                        "description": row["description"],
                        "features": row["features"],
                        "icon": row["icon"],
                        "featured": row["featured"],
                        "published": True,
                        "order": row["order"],
                    },
                )
                counts["inclusions"][0 if created else 1] += 1
                _attach_image(obj, "image", row["title"], seed=f"inc-{i}")
                inclusion_by_slug[slug] = obj
                if len(samples["Inclusion"]) < 3:
                    samples["Inclusion"].append(
                        {
                            "slug": obj.slug,
                            "title": obj.title,
                            "tier": obj.tier,
                            "category": obj.category,
                            "features": obj.features,
                        }
                    )

            # --- Designs ---
            design_by_slug = {}
            for i, row in enumerate(DESIGNS):
                slug = slugify(row["title"])
                obj, created = HomeDesign.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": row["title"],
                        "subtitle": row["subtitle"],
                        "category": row["category"],
                        "status": row.get("status", ""),
                        "state": "NSW",
                        "suburb": "",
                        "price": row["price"],
                        "price_value": row["price_value"],
                        "bedrooms": row["bedrooms"],
                        "bathrooms": row["bathrooms"],
                        "garage": row["garage"],
                        "living": row["living"],
                        "study": row["study"],
                        "house_size": row["house_size"],
                        "frontage": row["frontage"],
                        "depth": row["depth"],
                        "min_lot_width": row["min_lot_width"],
                        "description": row["description"],
                        "featured": row["featured"],
                        "published": True,
                    },
                )
                counts["designs"][0 if created else 1] += 1
                _attach_image(obj, "hero_image", row["title"], size=(1600, 1000), seed=f"des-{i}")
                _attach_image(obj, "floor_plan", f"{row['title']} plan", size=(1200, 1600), seed=f"fp-{i}")

                # Gallery (3 images)
                if obj.gallery_images.count() < 3:
                    for g in range(3):
                        gal = HomeDesignGallery(home_design=obj, alt_text=f"{row['title']} gallery {g+1}", order=g)
                        gal.save()
                        _attach_image(gal, "image", f"{row['title']} g{g+1}", seed=f"des-g-{i}-{g}")

                # Features
                if obj.features.count() == 0:
                    for fi, (ft, fd) in enumerate(row["features"]):
                        HomeDesignFeature.objects.create(
                            home_design=obj, title=ft, description=fd, order=fi
                        )

                # Link first 4 inclusions
                if obj.inclusion_links.count() == 0:
                    for li, inc in enumerate(list(inclusion_by_slug.values())[:5]):
                        DesignInclusion.objects.get_or_create(
                            home_design=obj, inclusion=inc, defaults={"order": li}
                        )

                design_by_slug[slug] = obj
                if len(samples["HomeDesign"]) < 3:
                    samples["HomeDesign"].append(
                        {
                            "slug": obj.slug,
                            "title": obj.title,
                            "category": obj.category,
                            "bedrooms": obj.bedrooms,
                            "bathrooms": str(obj.bathrooms),
                            "price": obj.price,
                            "house_size": obj.house_size,
                            "gallery": obj.gallery_images.count(),
                        }
                    )

            # Related designs (simple ring)
            for slug, obj in design_by_slug.items():
                others = [d for s, d in design_by_slug.items() if s != slug][:3]
                obj.related_designs.set(others)

            # --- Estates ---
            estate_by_slug = {}
            for row in ESTATES:
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
                counts["estates"][0 if created else 1] += 1
                estate_by_slug[row["slug"]] = obj

            # --- Packages ---
            for i, row in enumerate(PACKAGES):
                estate = estate_by_slug.get(row["estate_slug"])
                obj, created = HomeLandPackage.objects.update_or_create(
                    slug=row["slug"],
                    defaults={
                        "title": row["title"],
                        "estate": estate,
                        "category": "House & Land",
                        "suburb": row["suburb"],
                        "state": row["state"],
                        "price": row["price"],
                        "price_value": row["price_value"],
                        "bedrooms": row["bedrooms"],
                        "bathrooms": row["bathrooms"],
                        "garage": row["garage"],
                        "house_size": row["house_size"],
                        "land_size": row["land_size"],
                        "description": row["description"],
                        "featured": row["featured"],
                        "published": True,
                        "badge": "Popular" if row["featured"] else "",
                    },
                )
                counts["packages"][0 if created else 1] += 1
                _attach_image(obj, "hero_image", row["title"], seed=f"pkg-{i}")

                if obj.gallery_images.count() < 3:
                    for g in range(3):
                        gal = PackageGallery(package=obj, alt_text=f"{row['title']} {g+1}", order=g)
                        gal.save()
                        _attach_image(gal, "image", f"{row['title']} g{g+1}", seed=f"pkg-g-{i}-{g}")

                if obj.features.count() == 0:
                    for fi, (ft, fd) in enumerate(row["features"]):
                        PackageFeature.objects.create(
                            package=obj, title=ft, description=fd, order=fi
                        )

                if obj.inclusion_links.count() == 0:
                    for li, inc in enumerate(list(inclusion_by_slug.values())[:5]):
                        PackageInclusion.objects.get_or_create(
                            package=obj, inclusion=inc, defaults={"order": li}
                        )

                if len(samples["HomeLandPackage"]) < 3:
                    samples["HomeLandPackage"].append(
                        {
                            "slug": obj.slug,
                            "title": obj.title,
                            "price": obj.price,
                            "land_size": obj.land_size,
                            "suburb": obj.suburb,
                        }
                    )

            # --- Projects ---
            for i, row in enumerate(PROJECTS):
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
                counts["projects"][0 if created else 1] += 1
                _attach_image(obj, "hero_image", row["title"], seed=f"prj-{i}")

                if obj.gallery_images.count() < 3:
                    for g in range(3):
                        gal = ProjectGallery(project=obj, alt_text=f"{row['title']} {g+1}", order=g)
                        gal.save()
                        _attach_image(gal, "image", f"{row['title']} g{g+1}", seed=f"prj-g-{i}-{g}")

                if obj.features.count() == 0:
                    for fi, (ft, fd) in enumerate(row["features"]):
                        ProjectFeature.objects.create(
                            project=obj, title=ft, description=fd, order=fi
                        )

                if len(samples["Project"]) < 3:
                    samples["Project"].append(
                        {
                            "slug": obj.slug,
                            "title": obj.title,
                            "status": obj.status,
                            "location": obj.location,
                        }
                    )

        for key, (c, u) in counts.items():
            self.stdout.write(self.style.SUCCESS(f"{key}: created={c} updated={u}"))

        self.stdout.write("\n— Sample records —")
        for model_name, rows in samples.items():
            self.stdout.write(f"\n{model_name}:")
            for r in rows:
                self.stdout.write(f"  {r}")
