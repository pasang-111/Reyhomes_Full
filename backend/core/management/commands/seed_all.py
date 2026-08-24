"""Run the full local seed suite in dependency order."""
from django.core.management import call_command
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = (
        "Seed site settings, hero, catalogue, testimonials, accounts/enquiries, "
        "and ReyHomes Pro portal data (local/dev only)."
    )

    def handle(self, *args, **options):
        steps = [
            "seed_site_settings",
            "seed_hero_slides",
            "seed_catalogue",
            "seed_sandstone_range",
            "seed_wp_media",
            "seed_testimonials",
            "seed_accounts_enquiries",
            "seed_pro_portal",
            "seed_real_images",
        ]
        for name in steps:
            self.stdout.write(self.style.MIGRATE_HEADING(f"\n=== {name} ==="))
            call_command(name)
        self.stdout.write(self.style.SUCCESS("\nAll seed commands finished."))
