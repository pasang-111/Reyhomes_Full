"""Seed ReyHomes Pro portal data for the demo client (idempotent on client username)."""
from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from homes.models import HomeDesign
from land.models import HomeLandPackage
from pro.models import (
    BuildProject,
    ClientInclusion,
    Contract,
    Message,
    MessageThread,
    Milestone,
    Notification,
)

User = get_user_model()

CLIENT_USERNAME = "client.demo"
AGENT_USERNAME = "staff.agent"

MILESTONES = [
    ("Deposit & contracts", "Initial deposit received and building contract executed.", "completed", 0),
    ("Council approvals", "DA / CDC documentation lodged and approved.", "completed", 1),
    ("Site establishment", "Fencing, amenities and site induction complete.", "completed", 2),
    ("Slab / foundation", "Engineering slab poured and cured.", "in_progress", 3),
    ("Frame stage", "Structural frame and roof trusses.", "pending", 4),
    ("Lock-up", "Windows, doors and external envelope secured.", "pending", 5),
    ("Fixing & fit-out", "Internal linings, joinery and wet areas.", "pending", 6),
    ("Practical completion", "Final inspection and defects list.", "pending", 7),
    ("Handover", "Keys, warranties and maintenance guide.", "pending", 8),
]

CLIENT_INCLUSIONS = [
    ("kitchen", "Stone upgrade — Calacatta look", "40mm engineered stone to island and benches.", True),
    ("kitchen", "Appliance package — premium", "900mm oven, induction cooktop, integrated dishwasher.", True),
    ("bathroom", "Frameless shower screens", "All wet areas.", True),
    ("flooring", "Hybrid flooring throughout living", "Timber-look hybrid to living/meals/hall.", True),
    ("electrical", "Ducted air-conditioning", "Zoned reverse-cycle system.", True),
    ("exterior", "Alfresco ceiling fan circuit", "Power and mounting provision.", True),
    ("facade", "Feature brick entry portal", "Selected from facade schedule.", False),
]


class Command(BaseCommand):
    help = "Seed contract, build, milestones, messages, notifications, client inclusions for client.demo."

    def handle(self, *args, **options):
        client = User.objects.filter(username=CLIENT_USERNAME).first()
        agent = User.objects.filter(username=AGENT_USERNAME).first()
        if not client:
            self.stderr.write("client.demo not found — run seed_accounts_enquiries first.")
            return
        if not agent:
            self.stderr.write("staff.agent not found — run seed_accounts_enquiries first.")
            return

        design = HomeDesign.objects.filter(slug="verona").first() or HomeDesign.objects.first()
        package = HomeLandPackage.objects.filter(slug="verona-harbour-view").first()

        with transaction.atomic():
            contract, c_created = Contract.objects.update_or_create(
                client=client,
                title="Verona — Harbour View Residences",
                defaults={
                    "home_design": design,
                    "land_package": package,
                    "status": "active",
                    "contract_value": Decimal("1295000.00"),
                    "signed_date": date.today() - timedelta(days=90),
                    "notes": "Demo active build for ReyHomes Pro portal testing.",
                },
            )

            build, b_created = BuildProject.objects.update_or_create(
                contract=contract,
                defaults={
                    "current_stage": "foundation",
                    "site_address": "14 Horizon Circuit, Schofields NSW 2762",
                    "start_date": date.today() - timedelta(days=60),
                    "estimated_completion": date.today() + timedelta(days=200),
                },
            )

            ms_created = ms_updated = 0
            today = date.today()
            for title, desc, status, order in MILESTONES:
                due = today + timedelta(days=(order - 3) * 21)
                obj, created = Milestone.objects.update_or_create(
                    build=build,
                    order=order,
                    defaults={
                        "title": title,
                        "description": desc,
                        "status": status,
                        "due_date": due,
                        "completed_at": timezone.now() - timedelta(days=10) if status == "completed" else None,
                    },
                )
                if created:
                    ms_created += 1
                else:
                    ms_updated += 1

            thread, t_created = MessageThread.objects.update_or_create(
                build=build,
                client=client,
                agent=agent,
                defaults={"subject": "Slab pour schedule"},
            )
            if thread.messages.count() == 0:
                Message.objects.create(
                    thread=thread,
                    sender=agent,
                    body="Hi Alex — the engineering inspection passed. We are targeting slab pour next Thursday, weather permitting.",
                    read=True,
                )
                Message.objects.create(
                    thread=thread,
                    sender=client,
                    body="Thanks Sam. Please send a photo once the pour is complete.",
                    read=True,
                )
                Message.objects.create(
                    thread=thread,
                    sender=agent,
                    body="Will do. You can also track progress under Build in the Pro portal.",
                    read=False,
                )

            notif_specs = [
                ("Slab stage underway", "Foundation works are in progress on site.", "milestone", "/pro/build"),
                ("New message from your agent", "Sam replied about the slab pour schedule.", "message", "/pro/messages"),
                ("Contract active", "Your building contract is marked active.", "contract", "/pro/home"),
                ("Welcome to ReyHomes Pro", "Track milestones, messages and inclusions in one place.", "system", "/pro/home"),
            ]
            n_created = 0
            for title, msg, ntype, link in notif_specs:
                _, created = Notification.objects.get_or_create(
                    user=client,
                    title=title,
                    defaults={
                        "message": msg,
                        "notification_type": ntype,
                        "link": link,
                        "read": False,
                    },
                )
                n_created += int(created)

            ci_created = 0
            for cat, title, desc, selected in CLIENT_INCLUSIONS:
                _, created = ClientInclusion.objects.update_or_create(
                    client=client,
                    build=build,
                    title=title,
                    defaults={
                        "category": cat,
                        "description": desc,
                        "selected": selected,
                        "notes": "",
                    },
                )
                ci_created += int(created)

        self.stdout.write(self.style.SUCCESS(
            f"Contract {'created' if c_created else 'updated'}: {contract.title} "
            f"status={contract.status} value={contract.contract_value}"
        ))
        self.stdout.write(
            f"Build stage={build.current_stage} site={build.site_address!r}"
        )
        self.stdout.write(f"Milestones created={ms_created} updated={ms_updated} (total {build.milestones.count()})")
        self.stdout.write(f"Thread messages={thread.messages.count()} subject={thread.subject!r}")
        self.stdout.write(f"Notifications new={n_created} total={client.notifications.count()}")
        self.stdout.write(f"ClientInclusions upserted new={ci_created} total={client.custom_inclusions.count()}")
        self.stdout.write("\nSample milestone rows:")
        for m in build.milestones.all()[:5]:
            self.stdout.write(f"  [{m.order}] {m.title} status={m.status} due={m.due_date}")
