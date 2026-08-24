from django.db.models.signals import post_save
from django.dispatch import receiver

from accounts.models import UserProfile
from .models import Contract, Milestone
from .models import Notification


@receiver(post_save, sender=Contract)
def contract_status_updates_client(sender, instance, created, **kwargs):
    # Contract status never promotes a user to Client automatically.
    # Client/ReyHomes Pro access is an explicit admin decision.
    if not created:
        Notification.objects.get_or_create(
            user=instance.client,
            title="Contract updated",
            message=f"{instance.title} is now {instance.get_status_display()}.",
            notification_type="contract",
            link="/pro",
        )


@receiver(post_save, sender=Milestone)
def milestone_updates_client(sender, instance, created, **kwargs):
    if created:
        return
    client = instance.build.contract.client
    Notification.objects.create(
        user=client,
        title="Milestone updated",
        message=f"{instance.title} is now {instance.get_status_display()}.",
        notification_type="milestone",
        link="/pro",
    )
