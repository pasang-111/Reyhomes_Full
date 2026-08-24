"""
Backfill real photography onto any blank image field, for a client-facing demo.

Usage:
    python manage.py seed_real_images
    python manage.py seed_real_images --force        # also replace existing images
    python manage.py seed_real_images --only=homes    # limit to one app

Requires (optional but recommended) a free Unsplash access key:
    1. https://unsplash.com/developers -> "New Application"
    2. Copy the "Access Key"
    3. Add to backend/.env:  UNSPLASH_ACCESS_KEY=your_key_here

Without a key the command still works — it falls back to Picsum Photos
(real photographs, but not keyword-matched), and finally to the local
generated placeholder if there is no internet access at all. Nothing here
ever fails the run; it always finishes and reports what it used.
"""
from __future__ import annotations

import os

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from core.models import HeroSlide, Inclusion, Testimonial
from homes.models import HomeDesign, HomeDesignFeature, HomeDesignGallery
from land.models import Estate, HomeLandPackage, PackageFeature, PackageGallery
from projects.models import Project, ProjectFeature, ProjectGallery

from ._real_images import fetch_photo, fetch_youtube_thumbnail

INCLUSION_QUERIES = {
    "kitchen": "modern kitchen interior stone benchtop",
    "bathroom": "modern bathroom interior design",
    "electrical": "smart home lighting interior",
    "flooring": "timber flooring interior modern home",
    "facade": "modern house facade exterior",
    "living": "modern living room interior",
    "exterior": "modern house exterior alfresco",
    "other": "modern home interior design detail",
}

GALLERY_QUERIES = [
    "modern living room interior",
    "modern kitchen interior design",
    "modern bathroom interior",
    "modern bedroom interior minimal",
]

FEATURE_FALLBACK_QUERY = "modern home interior detail"


class Command(BaseCommand):
    help = "Backfill real (Unsplash/Picsum) photography onto blank image fields for demo purposes."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Replace existing images too, not just blank ones.",
        )
        parser.add_argument(
            "--unsplash-key",
            default="",
            help="Override the UNSPLASH_ACCESS_KEY environment variable.",
        )
        parser.add_argument(
            "--only",
            default="",
            help="Comma-separated subset: hero,inclusions,testimonials,homes,land,projects",
        )

    def handle(self, *args, **options):
        self.force = options["force"]
        self.access_key = options["unsplash_key"] or os.getenv("UNSPLASH_ACCESS_KEY", "")
        only = {s.strip() for s in options["only"].split(",") if s.strip()} or None
        self.only = only

        if not self.access_key:
            self.stdout.write(
                self.style.WARNING(
                    "No UNSPLASH_ACCESS_KEY set — falling back to Picsum (real but "
                    "not keyword-matched photos). See this command's docstring for "
                    "how to get a free key in ~2 minutes."
                )
            )

        self.stats = {"set": 0, "skipped": 0}

        if not only or "hero" in only:
            self._seed_hero_slides()
        if not only or "inclusions" in only:
            self._seed_inclusions()
        if not only or "testimonials" in only:
            self._seed_testimonials()
        if not only or "homes" in only:
            self._seed_home_designs()
        if not only or "land" in only:
            self._seed_land_packages()
        if not only or "projects" in only:
            self._seed_projects()

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. Images set={self.stats['set']} skipped(existing)={self.stats['skipped']}"
            )
        )

    # -- generic attach ----------------------------------------------------

    def _attach(self, instance, field_name, query, seed, size, label):
        field = getattr(instance, field_name)
        if field and not self.force:
            self.stats["skipped"] += 1
            return
        width, height = size
        data = fetch_photo(query, seed, width, height, self.access_key, label)
        getattr(instance, field_name).save(f"{seed}.jpg", ContentFile(data), save=True)
        self.stats["set"] += 1
        self.stdout.write(f"  [{instance.__class__.__name__}] {field_name} <- {query!r} ({label})")

    # -- hero ----------------------------------------------------------------

    def _seed_hero_slides(self):
        self.stdout.write(self.style.MIGRATE_HEADING("HeroSlide"))
        for slide in HeroSlide.objects.all():
            self._attach(
                slide, "image", "luxury modern home exterior twilight",
                f"hero-{slide.pk}", (1920, 1080), slide.title,
            )
            self._attach(
                slide, "mobile_image", "luxury modern home exterior twilight",
                f"hero-m-{slide.pk}", (1080, 1920), slide.title,
            )
            # Only give a poster if this slide actually has (or will have) a video.
            if slide.video or slide.poster:
                self._attach(
                    slide, "poster", "modern home exterior video still",
                    f"hero-p-{slide.pk}", (1920, 1080), slide.title,
                )

    # -- inclusions ------------------------------------------------------------

    def _seed_inclusions(self):
        self.stdout.write(self.style.MIGRATE_HEADING("Inclusion"))
        for inc in Inclusion.objects.all():
            query = INCLUSION_QUERIES.get(inc.category, INCLUSION_QUERIES["other"])
            self._attach(inc, "image", query, f"inclusion-{inc.pk}", (1200, 900), inc.title)

    # -- testimonials: YouTube thumbnail first, Unsplash portrait otherwise ----

    def _seed_testimonials(self):
        self.stdout.write(self.style.MIGRATE_HEADING("Testimonial"))
        for t in Testimonial.objects.all():
            if t.photo and not self.force:
                self.stats["skipped"] += 1
                continue

            data = None
            source = "unsplash/picsum"
            if t.video_url:
                data = fetch_youtube_thumbnail(t.video_url)
                source = "youtube thumbnail"

            if data is None:
                data = fetch_photo(
                    "friendly homeowner portrait smiling",
                    f"testimonial-{t.pk}", 600, 600, self.access_key, t.name,
                )

            t.photo.save(f"testimonial-{t.pk}.jpg", ContentFile(data), save=True)
            self.stats["set"] += 1
            self.stdout.write(f"  [Testimonial] photo <- {source} ({t.name})")

    # -- home designs ------------------------------------------------------

    def _seed_home_designs(self):
        self.stdout.write(self.style.MIGRATE_HEADING("HomeDesign"))
        for design in HomeDesign.objects.all():
            self._attach(
                design, "hero_image", "modern house exterior architecture",
                f"design-{design.pk}", (1600, 1000), design.title,
            )
            self._attach(
                design, "floor_plan", "architecture blueprint floor plan",
                f"design-fp-{design.pk}", (1200, 1600), f"{design.title} plan",
            )
            for i, gal in enumerate(design.gallery_images.all()):
                query = GALLERY_QUERIES[i % len(GALLERY_QUERIES)]
                self._attach(gal, "image", query, f"design-g-{gal.pk}", (1600, 1000), design.title)
            for feat in design.features.all():
                query = f"{feat.title} interior" if feat.title else FEATURE_FALLBACK_QUERY
                self._attach(feat, "image", query, f"design-f-{feat.pk}", (1200, 900), feat.title)

    # -- home & land packages -----------------------------------------------

    def _seed_land_packages(self):
        self.stdout.write(self.style.MIGRATE_HEADING("Estate / HomeLandPackage"))
        for estate in Estate.objects.all():
            self._attach(
                estate, "hero_image", "residential estate street modern homes",
                f"estate-{estate.pk}", (1600, 1000), estate.name,
            )
        for pkg in HomeLandPackage.objects.all():
            self._attach(
                pkg, "hero_image", "modern house exterior architecture",
                f"pkg-{pkg.pk}", (1600, 1000), pkg.title,
            )
            self._attach(
                pkg, "floor_plan", "architecture blueprint floor plan",
                f"pkg-fp-{pkg.pk}", (1200, 1600), f"{pkg.title} plan",
            )
            for i, gal in enumerate(pkg.gallery_images.all()):
                query = GALLERY_QUERIES[i % len(GALLERY_QUERIES)]
                self._attach(gal, "image", query, f"pkg-g-{gal.pk}", (1600, 1000), pkg.title)
            for feat in pkg.features.all():
                query = f"{feat.title} interior" if feat.title else FEATURE_FALLBACK_QUERY
                self._attach(feat, "image", query, f"pkg-f-{feat.pk}", (1200, 900), feat.title)

    # -- projects --------------------------------------------------------------

    def _seed_projects(self):
        self.stdout.write(self.style.MIGRATE_HEADING("Project"))
        for proj in Project.objects.all():
            self._attach(
                proj, "hero_image", "residential construction development modern housing",
                f"proj-{proj.pk}", (1600, 1000), proj.title,
            )
            for i, gal in enumerate(proj.gallery_images.all()):
                query = GALLERY_QUERIES[i % len(GALLERY_QUERIES)]
                self._attach(gal, "image", query, f"proj-g-{gal.pk}", (1600, 1000), proj.title)
            for feat in proj.features.all():
                query = f"{feat.title} interior" if feat.title else FEATURE_FALLBACK_QUERY
                self._attach(feat, "image", query, f"proj-f-{feat.pk}", (1200, 900), feat.title)
