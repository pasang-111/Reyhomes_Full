"""Idempotent seed for the SiteSetting singleton (navbar / footer)."""
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from core.models import SiteSetting

from ._gen_placeholder import make_placeholder


class Command(BaseCommand):
    help = "Upsert ReyHomes SiteSetting (singleton) with complete contact + social fields."

    def handle(self, *args, **options):
        obj, created = SiteSetting.objects.get_or_create(pk=1)
        before = {
            "company_name": obj.company_name,
            "phone": obj.phone,
            "email": obj.email,
        }

        obj.company_name = "ReyHomes"
        obj.phone = "1300 739 466"
        obj.email = "hello@reyhomes.com.au"
        obj.address = "Suite 12, 88 Pacific Highway\nNorth Sydney NSW 2060"
        obj.instagram = "https://www.instagram.com/reyhomes"
        obj.facebook = "https://www.facebook.com/reyhomes"
        obj.youtube = "https://www.youtube.com/@SandstoneConstructions"
        obj.linkedin = "https://www.linkedin.com/company/reyhomes"
        obj.save()

        if not obj.logo:
            data = make_placeholder("ReyHomes", "Wordmark", size=(640, 200), seed="logo")
            obj.logo.save("reyhomes-logo.jpg", ContentFile(data), save=True)
        if not obj.footer_logo:
            data = make_placeholder("ReyHomes", "Footer", size=(640, 200), seed="footer-logo")
            obj.footer_logo.save("reyhomes-footer-logo.jpg", ContentFile(data), save=True)

        action = "created" if created else "updated"
        self.stdout.write(self.style.SUCCESS(f"SiteSetting {action}"))
        self.stdout.write(
            f"  company_name={obj.company_name!r} phone={obj.phone!r} email={obj.email!r}"
        )
        self.stdout.write(f"  address={obj.address!r}")
        self.stdout.write(
            f"  socials instagram/facebook/youtube/linkedin set; "
            f"logo={'yes' if obj.logo else 'no'} footer_logo={'yes' if obj.footer_logo else 'no'}"
        )
        if not created:
            self.stdout.write(f"  previous: {before}")
