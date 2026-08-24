from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import HeroSlide
from homes.models import HomeDesign
from land.models import Estate, HomeLandPackage

from ._gen_placeholder import make_placeholder


HERO_SLIDES = [
    {
        "title": "Crafting Dream Homes Across Sydney",
        "subtitle": "New Home Designs",
        "description": "From first sketch to final handover, every Rey Homes build is designed around the way your family actually lives.",
        "button_text": "Explore Home Designs",
        "button_link": "/home-designs",
    },
    {
        "title": "Home & Land, Made Simple",
        "subtitle": "Turnkey Packages",
        "description": "Fixed-price house and land packages across Sydney's best growth corridors — land secured, home designed, ready to build.",
        "button_text": "View Home & Land",
        "button_link": "/home-land",
    },
    {
        "title": "Trusted By Hundreds Of Families",
        "subtitle": "Built On Experience",
        "description": "Two decades of building premium homes across NSW, backed by a 5-star client satisfaction record.",
        "button_text": "Book A Consultation",
        "button_link": "/contact",
    },
]

# Bed / bath / garage counts and naming convention referenced from
# Sandstone Constructions AU's single & double storey ranges.
HOME_DESIGNS = [
    {
        "title": "Ravello",
        "category": "Single Storey",
        "subtitle": "Effortless single-level luxury",
        "bedrooms": 4, "bathrooms": 2.5, "garage": 2, "living": 2, "study": 1,
        "house_size": "224.5", "land_size": "450", "frontage": "14",
        "price": "From $448,000",
        "price_value": 448000,
        "featured": True,
        "description": (
            "Ravello brings resort-style single-level living to a compact "
            "footprint, with an open kitchen-dining-living wing that opens "
            "onto a covered alfresco, and a private main suite tucked away "
            "from the secondary bedrooms."
        ),
    },
    {
        "title": "Lugano",
        "category": "Single Storey",
        "subtitle": "Streamlined family living",
        "bedrooms": 4, "bathrooms": 2, "garage": 1, "living": 1, "study": 0,
        "house_size": "196.8", "land_size": "375", "frontage": "12.5",
        "price": "From $398,500",
        "price_value": 398500,
        "featured": False,
        "description": (
            "Lugano is built for narrower blocks without compromising on "
            "space — four genuine bedrooms, a central open-plan living zone "
            "and a low-maintenance layout suited to first-home buyers and "
            "downsizers alike."
        ),
    },
    {
        "title": "Malaga",
        "category": "Single Storey",
        "subtitle": "Family entertainer",
        "bedrooms": 4, "bathrooms": 2, "garage": 2, "living": 2, "study": 0,
        "house_size": "231.2", "land_size": "500", "frontage": "16",
        "price": "From $462,000",
        "price_value": 462000,
        "featured": True,
        "description": (
            "Malaga is the entertainer of the range — a wide open living and "
            "dining zone flows directly onto a generous alfresco, with a "
            "dedicated kids' retreat separating the bedroom wings."
        ),
    },
    {
        "title": "Modena",
        "category": "Double Storey",
        "subtitle": "Executive family home",
        "bedrooms": 4, "bathrooms": 3, "garage": 1, "living": 2, "study": 1,
        "house_size": "289.6", "land_size": "350", "frontage": "10.5",
        "price": "From $565,000",
        "price_value": 565000,
        "featured": True,
        "description": (
            "Modena maximises a narrow block with a ground-floor study and "
            "guest bath, an upstairs retreat separating the main suite from "
            "the kids' bedrooms, and a butler's pantry off the main kitchen."
        ),
    },
    {
        "title": "Savona",
        "category": "Double Storey",
        "subtitle": "Grand family living",
        "bedrooms": 5, "bathrooms": 3, "garage": 2, "living": 3, "study": 1,
        "house_size": "342.4", "land_size": "500", "frontage": "16",
        "price": "From $648,000",
        "price_value": 648000,
        "featured": True,
        "description": (
            "Savona is built for growing and multi-generational families — "
            "five bedrooms, three living zones, a home theatre and a "
            "resort-style alfresco anchor a genuinely grand floor plan."
        ),
    },
    {
        "title": "Siena",
        "category": "Double Storey",
        "subtitle": "Premium double storey",
        "bedrooms": 5, "bathrooms": 3, "garage": 2, "living": 2, "study": 1,
        "house_size": "329.1", "land_size": "450", "frontage": "14",
        "price": "From $612,000",
        "price_value": 612000,
        "featured": False,
        "description": (
            "Siena pairs a striking double-storey facade with a considered "
            "internal layout — a ground-floor guest suite, an upstairs "
            "parents' retreat, and a central void that floods the staircase "
            "with natural light."
        ),
    },
]

# Estates / packages referenced from Sandstone's Sydney growth-corridor
# Home & Land listings (Austral, Box Hill).
ESTATES = [
    {"name": "Austral Rise", "suburb": "Austral", "state": "NSW"},
    {"name": "Box Hill Gardens", "suburb": "Box Hill", "state": "NSW"},
]

HOME_LAND_PACKAGES = [
    {
        "title": "Ravello — Austral Rise",
        "estate": "Austral Rise",
        "suburb": "Austral",
        "bedrooms": 4, "bathrooms": 2.5, "garage": 2,
        "land_size": "450", "house_size": "224.5", "frontage": "14",
        "price": "From $895,000",
        "price_value": 895000,
        "badge": "New Release",
        "featured": True,
        "description": (
            "A fixed-price Ravello build on a titled 450m² lot in Austral "
            "Rise, ready for a mid-2026 registration — land and home in one "
            "contract, no surprises."
        ),
    },
    {
        "title": "Modena — Austral Rise",
        "estate": "Austral Rise",
        "suburb": "Austral",
        "bedrooms": 4, "bathrooms": 3, "garage": 1,
        "land_size": "350", "house_size": "289.6", "frontage": "10.5",
        "price": "From $982,000",
        "price_value": 982000,
        "badge": "Popular",
        "featured": True,
        "description": (
            "The executive double-storey Modena on a low-maintenance 350m² "
            "block, close to Austral's new town centre and future rail link."
        ),
    },
    {
        "title": "Savona — Box Hill Gardens",
        "estate": "Box Hill Gardens",
        "suburb": "Box Hill",
        "bedrooms": 5, "bathrooms": 3, "garage": 2,
        "land_size": "500", "house_size": "342.4", "frontage": "16",
        "price": "From $1,150,000",
        "price_value": 1150000,
        "badge": "",
        "featured": False,
        "description": (
            "Five bedrooms and three living zones on a full 500m² block in "
            "Box Hill Gardens — space for a growing family, minutes from "
            "the new Box Hill town centre."
        ),
    },
]


class Command(BaseCommand):
    help = "Seed Hero, Home Design and Home & Land demo content (style referenced from Sandstone Constructions AU)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--flush",
            action="store_true",
            help="Delete existing HeroSlide / HomeDesign / HomeLandPackage / Estate rows before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["flush"]:
            HeroSlide.objects.all().delete()
            HomeLandPackage.objects.all().delete()
            Estate.objects.all().delete()
            HomeDesign.objects.all().delete()
            self.stdout.write(self.style.WARNING("Cleared existing hero / design / package / estate rows."))

        # ---- Hero slides ----
        for i, slide in enumerate(HERO_SLIDES):
            obj, created = HeroSlide.objects.get_or_create(
                title=slide["title"],
                defaults={
                    "subtitle": slide["subtitle"],
                    "description": slide["description"],
                    "button_text": slide["button_text"],
                    "button_link": slide["button_link"],
                    "order": i,
                    "active": True,
                },
            )
            if created:
                img_bytes = make_placeholder(slide["title"], slide["subtitle"], size=(1920, 1080))
                obj.image.save(f"hero-{obj.pk}.jpg", ContentFile(img_bytes), save=True)
            self.stdout.write(f"Hero slide: {obj.title} ({'created' if created else 'exists'})")

        # ---- Home designs ----
        design_by_title = {}
        for design in HOME_DESIGNS:
            obj, created = HomeDesign.objects.get_or_create(
                title=design["title"],
                defaults={
                    "category": design["category"],
                    "subtitle": design["subtitle"],
                    "bedrooms": design["bedrooms"],
                    "bathrooms": design["bathrooms"],
                    "garage": design["garage"],
                    "living": design["living"],
                    "study": design["study"],
                    "house_size": design["house_size"],
                    "land_size": design["land_size"],
                    "frontage": design["frontage"],
                    "price": design["price"],
                    "price_value": design["price_value"],
                    "description": design["description"],
                    "featured": design["featured"],
                    "published": True,
                },
            )
            if created:
                img_bytes = make_placeholder(design["title"], design["category"], size=(1600, 1000))
                obj.hero_image.save(f"design-{obj.pk}.jpg", ContentFile(img_bytes), save=True)
            design_by_title[design["title"]] = obj
            self.stdout.write(f"Home design: {obj.title} ({'created' if created else 'exists'})")

        # ---- Estates ----
        estate_by_name = {}
        for est in ESTATES:
            obj, created = Estate.objects.get_or_create(
                name=est["name"],
                defaults={"suburb": est["suburb"], "state": est["state"], "published": True},
            )
            if created:
                img_bytes = make_placeholder(est["name"], est["suburb"], size=(1600, 1000))
                obj.hero_image.save(f"estate-{obj.pk}.jpg", ContentFile(img_bytes), save=True)
            estate_by_name[est["name"]] = obj
            self.stdout.write(f"Estate: {obj.name} ({'created' if created else 'exists'})")

        # ---- Home & Land packages ----
        for pkg in HOME_LAND_PACKAGES:
            obj, created = HomeLandPackage.objects.get_or_create(
                title=pkg["title"],
                defaults={
                    "estate": estate_by_name[pkg["estate"]],
                    "category": "House & Land",
                    "suburb": pkg["suburb"],
                    "bedrooms": pkg["bedrooms"],
                    "bathrooms": pkg["bathrooms"],
                    "garage": pkg["garage"],
                    "land_size": pkg["land_size"],
                    "house_size": pkg["house_size"],
                    "frontage": pkg["frontage"],
                    "price": pkg["price"],
                    "price_value": pkg["price_value"],
                    "badge": pkg["badge"],
                    "featured": pkg["featured"],
                    "description": pkg["description"],
                    "published": True,
                },
            )
            if created:
                img_bytes = make_placeholder(pkg["title"], pkg["suburb"], size=(1600, 1000))
                obj.hero_image.save(f"package-{obj.pk}.jpg", ContentFile(img_bytes), save=True)
            self.stdout.write(f"Home & Land package: {obj.title} ({'created' if created else 'exists'})")

        self.stdout.write(self.style.SUCCESS("Demo content seeded."))
