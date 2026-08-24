"""Safe deploy seed: full seed_all when empty; else backfill missing media."""
from django.conf import settings
from django.core.management import call_command
from django.core.management.base import BaseCommand

from homes.models import HomeDesign


class Command(BaseCommand):
    help = "Run seed_all only if HomeDesign is empty; else backfill missing heroes."

    def handle(self, *args, **options):
        if not HomeDesign.objects.exists():
            self.stdout.write(self.style.MIGRATE_HEADING("Empty DB — running seed_all..."))
            call_command("seed_all")
            self._log()
            return
        self.stdout.write(self.style.WARNING(
            "HomeDesign has data — skip full seed_all. "
            "Shell: python manage.py seed_wp_media --create-missing"
        ))
        missing = sum(1 for d in HomeDesign.objects.all() if not d.hero_image)
        if missing == 0:
            self.stdout.write(self.style.SUCCESS("All design heroes present."))
            self._log()
            return
        self.stdout.write(self.style.MIGRATE_HEADING(f"{missing} missing heroes — seed_wp_media + seed_real_images"))
        call_command("seed_wp_media")
        call_command("seed_real_images")
        self._log()

    def _log(self):
        remote = getattr(settings, "USE_S3", False) or getattr(settings, "USE_CLOUDINARY", False)
        if remote:
            self.stdout.write("Media: remote")
        else:
            self.stdout.write(self.style.SUCCESS(f"Media: MEDIA_ROOT={settings.MEDIA_ROOT}"))
