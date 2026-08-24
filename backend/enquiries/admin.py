from django.contrib import admin, messages
from django.utils.html import format_html
from .models import Enquiry


@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = (
        "status_badge",
        "full_name",
        "email",
        "phone",
        "subject",
        "related_slug",
        "source",
        "created_at",
    )
    list_filter = ("status", "source", "created_at")
    search_fields = ("first_name", "last_name", "email", "phone", "message", "subject", "related_slug")
    list_editable = ()
    readonly_fields = ("created_at", "updated_at", "staff_hint")
    date_hierarchy = "created_at"
    list_per_page = 30
    save_on_top = True
    actions = ("mark_contacted", "mark_qualified", "mark_closed")
    ordering = ("-created_at",)

    fieldsets = (
        (
            "Staff guide",
            {
                "fields": ("staff_hint",),
                "description": "Work top to bottom: contact the person, update status, add notes.",
            },
        ),
        (
            "Contact details",
            {"fields": (("first_name", "last_name"), ("email", "phone"))},
        ),
        (
            "What they asked for",
            {
                "fields": ("subject", "message", "source", "related_slug"),
                "description": "Related slug links to a design or package (from the website form).",
            },
        ),
        (
            "Your follow-up",
            {
                "fields": ("status", "notes", "created_at", "updated_at"),
                "description": "New → Contacted → Qualified → Closed. Use notes for call outcomes.",
            },
        ),
    )

    @admin.display(description="Name", ordering="first_name")
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    @admin.display(description="Status")
    def status_badge(self, obj):
        colours = {
            "new": "#b45309",
            "contacted": "#1d4ed8",
            "qualified": "#047857",
            "closed": "#6b7280",
        }
        c = colours.get(obj.status, "#6b7280")
        return format_html(
            '<span style="display:inline-block;padding:2px 8px;border-radius:999px;'
            'font-size:11px;font-weight:600;background:{}20;color:{};">{}</span>',
            c,
            c,
            obj.get_status_display() if hasattr(obj, "get_status_display") else obj.status,
        )

    @admin.display(description="How to process")
    def staff_hint(self, obj):
        return format_html(
            '<ol style="margin:0;padding-left:1.2rem;font-size:13px;line-height:1.6;">'
            "<li>Call or email using the details above</li>"
            "<li>Change status to <strong>Contacted</strong></li>"
            "<li>Add a short note (what they want, next step)</li>"
            "<li>When finished, set status to <strong>Closed</strong></li>"
            "</ol>"
        )

    @admin.action(description="Mark as Contacted")
    def mark_contacted(self, request, queryset):
        n = queryset.update(status="contacted")
        self.message_user(request, f"Marked {n} as contacted.", messages.SUCCESS)

    @admin.action(description="Mark as Qualified")
    def mark_qualified(self, request, queryset):
        n = queryset.update(status="qualified")
        self.message_user(request, f"Marked {n} as qualified.", messages.SUCCESS)

    @admin.action(description="Mark as Closed")
    def mark_closed(self, request, queryset):
        n = queryset.update(status="closed")
        self.message_user(request, f"Closed {n} enquir(y/ies).", messages.INFO)
