from django.contrib import admin
from django.utils import timezone

from .models import Contract, BuildProject, Milestone, MessageThread, Message, Notification, ClientInclusion


@admin.register(Contract)
class ContractAdmin(admin.ModelAdmin):
    list_display = ("title", "client", "status", "contract_value", "signed_date", "updated_at")
    list_filter = ("status", "signed_date")
    search_fields = ("title", "client__email", "client__first_name", "client__last_name")
    autocomplete_fields = ("client", "home_design", "land_package")
    list_editable = ("status",)
    fieldsets = (("Client & home", {"fields": ("client", "home_design", "land_package", "title")}),("Commercial", {"fields": ("status", "contract_value", "signed_date", "notes")}))

    def save_model(self, request, obj, form, change):
        previous = None
        if change and obj.pk:
            previous = Contract.objects.get(pk=obj.pk).status
        if obj.status in {"signed", "active", "completed"} and not obj.signed_date:
            obj.signed_date = timezone.localdate()
        super().save_model(request, obj, form, change)
        if change and previous != obj.status:
            Notification.objects.create(
                user=obj.client,
                title="Contract status updated",
                message=f'Your contract "{obj.title}" is now {obj.get_status_display()}.',
                notification_type="contract",
                link="/pro",
            )


@admin.register(BuildProject)
class BuildProjectAdmin(admin.ModelAdmin):
    list_display = ("contract", "current_stage", "site_address", "start_date", "estimated_completion", "updated_at")
    list_filter = ("current_stage",)
    search_fields = ("contract__title", "contract__client__email", "site_address")
    autocomplete_fields = ("contract",)
    list_editable = ("current_stage",)

    def save_model(self, request, obj, form, change):
        previous = None
        if change and obj.pk:
            previous = BuildProject.objects.get(pk=obj.pk).current_stage
        super().save_model(request, obj, form, change)
        if change and previous != obj.current_stage:
            Notification.objects.create(
                user=obj.contract.client,
                title="Build stage updated",
                message=f"Your ReyHomes build is now at {obj.get_current_stage_display()}.",
                notification_type="milestone",
                link="/pro",
            )


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ("title", "build", "status", "order", "due_date", "completed_at")
    list_filter = ("status",)
    search_fields = ("title", "build__contract__title")
    autocomplete_fields = ("build",)
    list_editable = ("status", "order", "due_date")

    def save_model(self, request, obj, form, change):
        previous = None
        if change and obj.pk:
            previous = Milestone.objects.get(pk=obj.pk).status
        if obj.status == "completed" and not obj.completed_at:
            obj.completed_at = timezone.now()
        elif obj.status != "completed":
            obj.completed_at = None
        super().save_model(request, obj, form, change)
        if change and previous != obj.status:
            Notification.objects.create(
                user=obj.build.contract.client,
                title="Milestone updated",
                message=f'"{obj.title}" is now {obj.get_status_display().lower()}.',
                notification_type="milestone",
                link="/pro",
            )


@admin.register(MessageThread)
class MessageThreadAdmin(admin.ModelAdmin):
    list_display = ("subject", "client", "agent", "build", "updated_at")
    search_fields = ("subject", "client__email", "agent__email")
    autocomplete_fields = ("client", "agent", "build")


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "thread", "read", "created_at")
    list_filter = ("read",)
    search_fields = ("body", "sender__email")
    autocomplete_fields = ("thread", "sender")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "notification_type", "read", "created_at")
    list_filter = ("notification_type", "read")
    search_fields = ("title", "message", "user__email")
    autocomplete_fields = ("user",)


@admin.register(ClientInclusion)
class ClientInclusionAdmin(admin.ModelAdmin):
    list_display = ("title", "client", "category", "selected", "build", "updated_at")
    list_filter = ("category", "selected")
    search_fields = ("title", "client__email", "description", "notes")
    autocomplete_fields = ("client", "build")
