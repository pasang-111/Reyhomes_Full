"""
Import Sandstone WordPress home-design + home-&-land CONTENT and media.

Catalog: core/management/data/wp_sandstone_media.json (from WXR export).

Updates matching rows with:
  title, category, bedrooms, bathrooms, garage, house_size,
  frontage/depth, description, hero, floor plan, gallery, features.

Usage:
    python manage.py seed_wp_media
    python manage.py seed_wp_media --content-only
    python manage.py seed_wp_media --force
    python manage.py seed_wp_media --create-missing
    python manage.py seed_wp_media --local-dir=/path/to/wp-content/uploads
"""
from __future__ import annotations

import json
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.parse import urlparse

import requests
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from homes.models import HomeDesign, HomeDesignGallery, HomeDesignFeature
from land.models import HomeLandPackage, PackageGallery, Estate

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "wp_sandstone_media.json"
TIMEOUT = 45


def _ext_from_url(url: str) -> str:
    path = urlparse(url).path
    ext = Path(path).suffix.lower()
    return ext if ext in {".jpg", ".jpeg", ".png", ".webp", ".gif"} else ".jpg"


def download_media(url: str, local_dir: Path | None = None) -> tuple[bytes, str] | None:
    if not url:
        return None
    if local_dir is not None:
        path = urlparse(url).path
        candidates: list[Path] = []
        if "wp-content/uploads/" in path:
            rel = path.split("wp-content/uploads/", 1)[1]
            candidates.extend([
                local_dir / rel,
                local_dir / "uploads" / rel,
                local_dir / "wp-content" / "uploads" / rel,
            ])
        candidates.append(local_dir / Path(path).name)
        for c in candidates:
            if c.is_file():
                data = c.read_bytes()
                if len(data) >= 500:
                    return data, c.suffix.lower() or _ext_from_url(url)
    try:
        resp = requests.get(
            url, timeout=TIMEOUT,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                ),
                "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
                "Referer": "https://sandstoneconstructions.com.au/",
            },
            stream=True,
        )
        if resp.status_code != 200:
            return None
        data = resp.content
        if not data or len(data) < 500:
            return None
        ctype = (resp.headers.get("Content-Type") or "").lower()
        if "text/html" in ctype:
            return None
        ext = _ext_from_url(url)
        if "png" in ctype:
            ext = ".png"
        elif "webp" in ctype:
            ext = ".webp"
        elif "gif" in ctype:
            ext = ".gif"
        elif "jpeg" in ctype or "jpg" in ctype:
            ext = ".jpg"
        return data, ext
    except requests.RequestException:
        return None


def _int(val, default=0):
    if val is None or val == "":
        return default
    try:
        return int(float(str(val).strip()))
    except (ValueError, TypeError):
        return default


def _dec(val, default="0"):
    try:
        return Decimal(str(val).strip())
    except (InvalidOperation, TypeError, AttributeError):
        return Decimal(str(default))


def _category(types: list) -> str:
    if not types:
        return "Single Storey"
    t = types[0]
    if t in ("Single Storey", "Double Storey", "Duplex"):
        return t
    low = t.lower()
    if "double" in low:
        return "Double Storey"
    if "duplex" in low:
        return "Duplex"
    return "Single Storey"


class Command(BaseCommand):
    help = "Import Sandstone WP home-design and home-&-land content + media."

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="Replace existing images/features.")
        parser.add_argument("--content-only", action="store_true", help="Specs/description only.")
        parser.add_argument("--only", default="", help="designs,packages")
        parser.add_argument("--create-missing", action="store_true", help="Create rows with no match.")
        parser.add_argument("--local-dir", default="", help="WP uploads folder root.")
        parser.add_argument("--catalog", default="", help="Override JSON catalog path.")

    def handle(self, *args, **options):
        self.force = options["force"]
        self.content_only = options["content_only"]
        self.create_missing = options["create_missing"]
        self.local_dir = Path(options["local_dir"]).resolve() if options["local_dir"] else None
        only = {s.strip() for s in options["only"].split(",") if s.strip()} or None

        catalog_path = Path(options["catalog"]) if options["catalog"] else DATA_PATH
        if not catalog_path.is_file():
            self.stderr.write(self.style.ERROR(f"Catalog not found: {catalog_path}"))
            return

        catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
        self.stats = {
            "set": 0, "skipped": 0, "failed": 0,
            "created": 0, "matched": 0, "content_updated": 0,
        }
        if self.local_dir:
            self.stdout.write(f"Using local media dir: {self.local_dir}")

        if not only or "designs" in only:
            self._seed_designs(catalog.get("designs") or [])
        if not only or "packages" in only:
            self._seed_packages(catalog.get("packages") or [])

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. matched={self.stats['matched']} created={self.stats['created']} "
            f"content_updated={self.stats['content_updated']} "
            f"images_set={self.stats['set']} skipped={self.stats['skipped']} "
            f"failed={self.stats['failed']}"
        ))

    def _seed_designs(self, rows):
        self.stdout.write(self.style.MIGRATE_HEADING("HomeDesign — WP content + media"))
        for row in rows:
            design = self._find_design(row)
            if design is None:
                if not self.create_missing:
                    self.stdout.write(self.style.WARNING(
                        f"  no match for design {row.get('title')!r} — skip "
                        f"(use --create-missing to import all 37)"
                    ))
                    continue
                design = self._create_design(row)
                self.stats["created"] += 1
                self.stdout.write(self.style.SUCCESS(f"  created {design.title}"))
            else:
                self.stats["matched"] += 1
                self._apply_design_content(design, row)
                self.stdout.write(f"  matched {design.title} — content updated")

            if not self.content_only:
                self._attach_field(design, "hero_image", row.get("front_image"), f"{design.slug}-hero")
                self._attach_field(design, "floor_plan", row.get("floor_plan"), f"{design.slug}-plan")
                self._attach_gallery_design(design, row.get("gallery") or [])
            self._sync_design_features(design, row.get("features") or [])

    def _find_design(self, row):
        slug = (row.get("slug") or slugify(row.get("title") or "")).strip().lower()
        title = (row.get("title") or "").strip()
        qs = HomeDesign.objects.all()
        if slug:
            obj = qs.filter(slug__iexact=slug).first()
            if obj:
                return obj
        if title:
            obj = qs.filter(title__iexact=title).first()
            if obj:
                return obj
            return qs.filter(title__icontains=title).first()
        return None

    def _apply_design_content(self, design, row):
        changed = False
        title = (row.get("title") or "").strip()
        if title and design.title != title:
            design.title = title
            changed = True
        cat = _category(row.get("types") or [])
        if design.category != cat:
            design.category = cat
            changed = True
        beds = _int(row.get("bedroom"), design.bedrooms or 4)
        if design.bedrooms != beds:
            design.bedrooms = beds
            changed = True
        baths = _dec(row.get("bathroom"), design.bathrooms or 2)
        if design.bathrooms != baths:
            design.bathrooms = baths
            changed = True
        garage = _int(row.get("garage"), design.garage or 2)
        if design.garage != garage:
            design.garage = garage
            changed = True
        size = str(row.get("house_size") or row.get("total_area_m2") or "").strip()
        if size and design.house_size != size:
            design.house_size = size
            changed = True
        width = str(row.get("ground_floor_width_m") or "").strip()
        if width and design.frontage != width:
            design.frontage = width
            changed = True
        depth = str(row.get("ground_floor_depth_m") or "").strip()
        if depth and design.depth != depth:
            design.depth = depth
            changed = True
        desc = (row.get("description") or "").strip()
        if desc and design.description != desc:
            design.description = desc
            changed = True
        if changed:
            design.save()
            self.stats["content_updated"] += 1

    def _create_design(self, row):
        title = row.get("title") or "Untitled"
        slug = (row.get("slug") or slugify(title)).strip().lower()
        size = str(row.get("house_size") or row.get("total_area_m2") or "").strip()
        design = HomeDesign(
            title=title, slug=slug,
            category=_category(row.get("types") or []),
            bedrooms=_int(row.get("bedroom"), 4),
            bathrooms=_dec(row.get("bathroom"), "2"),
            garage=_int(row.get("garage"), 2),
            house_size=size,
            frontage=str(row.get("ground_floor_width_m") or "").strip(),
            depth=str(row.get("ground_floor_depth_m") or "").strip(),
            description=(row.get("description") or "").strip(),
            published=True, featured=False, state="NSW",
        )
        design.save()
        self.stats["content_updated"] += 1
        return design

    def _sync_design_features(self, design, features):
        features = [str(f).strip() for f in features if f and str(f).strip()]
        if not features:
            return
        existing = list(design.features.order_by("order").values_list("title", flat=True))
        if existing and not self.force:
            return
        if self.force and existing:
            design.features.all().delete()
        for i, title in enumerate(features[:12]):
            HomeDesignFeature.objects.create(home_design=design, title=title[:200], order=i)

    def _attach_gallery_design(self, design, urls):
        if not urls:
            return
        existing = design.gallery_images.count()
        if existing and not self.force:
            self.stats["skipped"] += existing
            return
        if self.force and existing:
            design.gallery_images.all().delete()
        for i, url in enumerate(urls[:6]):
            result = download_media(url, self.local_dir)
            if not result:
                self.stats["failed"] += 1
                continue
            data, ext = result
            gal = HomeDesignGallery(home_design=design, order=i)
            gal.image.save(f"{design.slug}-g{i+1}{ext}", ContentFile(data), save=True)
            self.stats["set"] += 1

    def _seed_packages(self, rows):
        self.stdout.write(self.style.MIGRATE_HEADING("HomeLandPackage — WP content + media"))
        for row in rows:
            pkg = self._find_package(row)
            if pkg is None:
                if not self.create_missing:
                    self.stdout.write(self.style.WARNING(
                        f"  no match for package {row.get('title')!r} — skip "
                        f"(use --create-missing)"
                    ))
                    continue
                pkg = self._create_package(row)
                self.stats["created"] += 1
                self.stdout.write(self.style.SUCCESS(f"  created {pkg.title}"))
            else:
                self.stats["matched"] += 1
                self._apply_package_content(pkg, row)
                self.stdout.write(f"  matched {pkg.title} — content updated")

            if not self.content_only:
                self._attach_field(pkg, "hero_image", row.get("front_image"), f"{pkg.slug}-hero")
                self._attach_field(pkg, "floor_plan", row.get("floor_plan"), f"{pkg.slug}-plan")
                self._attach_gallery_package(pkg, row.get("gallery") or [])

    def _find_package(self, row):
        slug = (row.get("slug") or "").strip().lower()
        title = (row.get("title") or "").strip()
        qs = HomeLandPackage.objects.all()
        if slug:
            obj = qs.filter(slug__iexact=slug).first()
            if obj:
                return obj
        if title:
            obj = qs.filter(title__iexact=title).first()
            if obj:
                return obj
            base = title.split("|")[0].strip()
            obj = qs.filter(title__icontains=base).first()
            if obj:
                return obj
            return qs.filter(suburb__icontains=base).first()
        return None

    def _apply_package_content(self, pkg, row):
        changed = False
        title = (row.get("title") or "").strip()
        if title and pkg.title != title:
            pkg.title = title
            changed = True
        beds = _int(row.get("bedroom"), pkg.bedrooms or 4)
        if pkg.bedrooms != beds:
            pkg.bedrooms = beds
            changed = True
        baths = _dec(row.get("bathroom"), pkg.bathrooms or 2)
        if pkg.bathrooms != baths:
            pkg.bathrooms = baths
            changed = True
        garage = _int(row.get("garage"), pkg.garage or 2)
        if pkg.garage != garage:
            pkg.garage = garage
            changed = True
        size = str(row.get("house_size") or "").strip()
        if size and pkg.house_size != size:
            pkg.house_size = size
            changed = True
        desc = (row.get("description") or "").strip()
        if desc and pkg.description != desc:
            pkg.description = desc
            changed = True
        if changed:
            pkg.save()
            self.stats["content_updated"] += 1

    def _create_package(self, row):
        title = row.get("title") or "Untitled package"
        slug = (row.get("slug") or slugify(title)).strip().lower()
        estate = Estate.objects.filter(name__icontains="Austral").first()
        if estate is None:
            estate = Estate.objects.create(name="Austral Rise", suburb="Austral", state="NSW")
        pkg = HomeLandPackage(
            title=title, slug=slug, estate=estate,
            suburb=getattr(estate, "suburb", "Austral") or "Austral",
            bedrooms=_int(row.get("bedroom"), 4),
            bathrooms=_dec(row.get("bathroom"), "2"),
            garage=_int(row.get("garage"), 2),
            house_size=str(row.get("house_size") or "").strip(),
            description=(row.get("description") or "").strip(),
            published=True, featured=False, state="NSW",
        )
        pkg.save()
        self.stats["content_updated"] += 1
        return pkg

    def _attach_gallery_package(self, pkg, urls):
        if not urls:
            return
        existing = pkg.gallery_images.count()
        if existing and not self.force:
            self.stats["skipped"] += existing
            return
        if self.force and existing:
            pkg.gallery_images.all().delete()
        for i, url in enumerate(urls[:6]):
            result = download_media(url, self.local_dir)
            if not result:
                self.stats["failed"] += 1
                continue
            data, ext = result
            gal = PackageGallery(package=pkg, order=i)
            gal.image.save(f"{pkg.slug}-g{i+1}{ext}", ContentFile(data), save=True)
            self.stats["set"] += 1

    def _attach_field(self, instance, field_name, url, filename_stem):
        if not url:
            return
        field = getattr(instance, field_name)
        if field and not self.force:
            self.stats["skipped"] += 1
            return
        result = download_media(url, self.local_dir)
        if not result:
            self.stats["failed"] += 1
            self.stdout.write(self.style.WARNING(
                f"    download failed ({field_name}): {str(url)[:90]}"
            ))
            return
        data, ext = result
        getattr(instance, field_name).save(
            f"{slugify(filename_stem)[:50]}{ext}", ContentFile(data), save=True,
        )
        self.stats["set"] += 1
