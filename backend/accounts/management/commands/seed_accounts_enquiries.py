"""Seed users by role, wishlist items, and sample enquiries (idempotent by username/email)."""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import UserProfile, WishlistItem
from enquiries.models import Enquiry
from homes.models import HomeDesign
from land.models import HomeLandPackage

User = get_user_model()

USERS = [
    {
        "username": "admin",
        "email": "admin@reyhomes.local",
        "password": "admin123",
        "first_name": "Rey",
        "last_name": "Admin",
        "is_staff": True,
        "is_superuser": True,
        "profile": {"phone": "1300 739 466", "is_client": False, "is_reypro": False},
    },
    {
        "username": "staff.agent",
        "email": "agent@reyhomes.local",
        "password": "agent123",
        "first_name": "Sam",
        "last_name": "Agent",
        "is_staff": True,
        "is_superuser": False,
        "profile": {"phone": "0412 000 111", "is_client": False, "is_reypro": False},
    },
    {
        "username": "client.demo",
        "email": "client@reyhomes.local",
        "password": "client123",
        "first_name": "Alex",
        "last_name": "Client",
        "is_staff": False,
        "is_superuser": False,
        "profile": {"phone": "0412 222 333", "is_client": True, "is_reypro": True},
    },
    {
        "username": "pro.client",
        "email": "pro@reyhomes.local",
        "password": "pro12345",
        "first_name": "Jordan",
        "last_name": "Pro",
        "is_staff": False,
        "is_superuser": False,
        "profile": {"phone": "0412 444 555", "is_client": True, "is_reypro": True},
    },
    {
        "username": "registered.user",
        "email": "member@reyhomes.local",
        "password": "member123",
        "first_name": "Taylor",
        "last_name": "Member",
        "is_staff": False,
        "is_superuser": False,
        "profile": {"phone": "0412 666 777", "is_client": False, "is_reypro": False, "marketing_opt_in": True},
    },
]

ENQUIRIES = [
    {
        "first_name": "Mia",
        "last_name": "Chen",
        "email": "mia.chen@example.com",
        "phone": "0401 111 222",
        "subject": "Ravello design enquiry",
        "message": "We love the Ravello plan and would like to discuss lot options in Leppington.",
        "source": "design page",
        "status": "new",
        "related_slug": "ravello",
    },
    {
        "first_name": "Daniel",
        "last_name": "Okoye",
        "email": "daniel.okoye@example.com",
        "phone": "0402 333 444",
        "subject": "Home & land package",
        "message": "Interested in Verona at Harbour View — is the package still available?",
        "source": "package page",
        "status": "contacted",
        "related_slug": "verona-harbour-view",
        "notes": "Called back; sent package PDF.",
    },
    {
        "first_name": "Priya",
        "last_name": "Nair",
        "email": "priya.nair@example.com",
        "phone": "0403 555 666",
        "subject": "Knockdown rebuild",
        "message": "Looking to rebuild on an existing block in the Inner West.",
        "source": "contact form",
        "status": "qualified",
    },
    {
        "first_name": "Chris",
        "last_name": "Walsh",
        "email": "chris.walsh@example.com",
        "phone": "0404 777 888",
        "subject": "Display home visit",
        "message": "Booked a visit — thank you.",
        "source": "contact form",
        "status": "closed",
        "notes": "Visited display; not proceeding this quarter.",
    },
]


class Command(BaseCommand):
    help = "Seed role users, wishlist items, and sample enquiries."

    def handle(self, *args, **options):
        created_u = updated_u = 0
        samples = []

        with transaction.atomic():
            agent = None
            for row in USERS:
                user, was_created = User.objects.get_or_create(
                    username=row["username"],
                    defaults={
                        "email": row["email"],
                        "first_name": row["first_name"],
                        "last_name": row["last_name"],
                        "is_staff": row["is_staff"],
                        "is_superuser": row["is_superuser"],
                    },
                )
                if was_created:
                    user.set_password(row["password"])
                    user.save()
                    created_u += 1
                else:
                    user.email = row["email"]
                    user.first_name = row["first_name"]
                    user.last_name = row["last_name"]
                    user.is_staff = row["is_staff"]
                    user.is_superuser = row["is_superuser"]
                    user.save()
                    updated_u += 1

                profile, _ = UserProfile.objects.get_or_create(user=user)
                for k, v in row["profile"].items():
                    setattr(profile, k, v)
                profile.save()

                if row["username"] == "staff.agent":
                    agent = user

                samples.append(
                    {
                        "username": user.username,
                        "email": user.email,
                        "is_staff": user.is_staff,
                        "is_client": profile.is_client,
                        "is_reypro": profile.is_reypro,
                    }
                )

            # Assign agent to pro clients
            if agent:
                for uname in ("client.demo", "pro.client"):
                    u = User.objects.filter(username=uname).first()
                    if u and hasattr(u, "profile"):
                        u.profile.assigned_agent = agent
                        u.profile.save()

            # Wishlist for registered + client
            designs = list(HomeDesign.objects.filter(published=True)[:2])
            packages = list(HomeLandPackage.objects.filter(published=True)[:1])
            member = User.objects.filter(username="registered.user").first()
            client = User.objects.filter(username="client.demo").first()
            wl_created = 0
            for u in filter(None, [member, client]):
                for d in designs:
                    _, c = WishlistItem.objects.get_or_create(user=u, home_design=d)
                    wl_created += int(c)
                for p in packages:
                    _, c = WishlistItem.objects.get_or_create(user=u, land_package=p)
                    wl_created += int(c)

            # Enquiries — upsert on email+subject natural key
            enq_c = enq_u = 0
            enq_samples = []
            for row in ENQUIRIES:
                obj, c = Enquiry.objects.update_or_create(
                    email=row["email"],
                    subject=row["subject"],
                    defaults={
                        "first_name": row["first_name"],
                        "last_name": row["last_name"],
                        "phone": row.get("phone", ""),
                        "message": row["message"],
                        "source": row.get("source", ""),
                        "status": row["status"],
                        "notes": row.get("notes", ""),
                        "related_slug": row.get("related_slug", ""),
                    },
                )
                if c:
                    enq_c += 1
                else:
                    enq_u += 1
                if len(enq_samples) < 3:
                    enq_samples.append(
                        {
                            "email": obj.email,
                            "status": obj.status,
                            "subject": obj.subject,
                        }
                    )

        self.stdout.write(self.style.SUCCESS(f"Users created={created_u} updated={updated_u}"))
        for s in samples:
            self.stdout.write(f"  {s}")
        self.stdout.write(self.style.SUCCESS(f"Wishlist items created (new links)≈{wl_created}"))
        self.stdout.write(self.style.SUCCESS(f"Enquiries created={enq_c} updated={enq_u}"))
        for s in enq_samples:
            self.stdout.write(f"  {s}")
        self.stdout.write(
            "\nTest logins: client.demo / client123 (ReyPro), "
            "registered.user / member123, admin / admin123"
        )
