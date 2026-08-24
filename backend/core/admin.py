from django.contrib import admin
from django import forms
from .models import HeroSlide, Inclusion, Testimonial, SiteSetting, SearchEvent
from .widgets import LinesToListField


class InclusionAdminForm(forms.ModelForm):
    features = LinesToListField(required=False)

    class Meta:
        model = Inclusion
        fields = "__all__"


@admin.register(HeroSlide)
class HeroSlideAdmin(admin.ModelAdmin):
    list_display = ("order", "title", "button_text", "has_video", "has_poster", "active", "updated_at")
    list_display_links = ("title",)
    list_editable = ("order", "active")
    list_filter = ("active",)
    search_fields = ("title", "subtitle", "description")
    ordering = ("order",)
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Content", {
            "fields": ("title", "subtitle", "description", "button_text", "button_link"),
        }),
        ("Media – Video (recommended for fast load)", {
            "fields": ("video", "poster"),
            "description": (
                "Upload a compressed MP4 (H.264) under ~8–12 MB for fast loading. "
                "Always set a poster image so something appears immediately while the video buffers."
            ),
        }),
        ("Media – Images (fallback)", {
            "fields": ("image", "mobile_image"),
        }),
        ("Display", {
            "fields": ("order", "active", "created_at", "updated_at"),
        }),
    )

    @admin.display(boolean=True, description="Video")
    def has_video(self, obj):
        return bool(obj.video)

    @admin.display(boolean=True, description="Poster")
    def has_poster(self, obj):
        return bool(obj.poster)


@admin.register(Inclusion)
class InclusionAdmin(admin.ModelAdmin):
    search_fields = ("title", "slug", "category", "tier", "subtitle", "description")
    form = InclusionAdminForm
    list_display = ("title", "category", "tier", "order", "featured", "published", "updated_at")
    list_filter = ("category", "tier", "featured", "published")
    search_fields = ("title", "description", "subtitle")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("order", "featured", "published")
    ordering = ("order",)
    fieldsets = (
        ("① What is this inclusion?", {
            "fields": ("title", "slug", "category", "tier", "subtitle"),
            "description": "Tier (Standard / Signature / Atelier) filters the public inclusions page.",
        }),
        ("② Details & media", {
            "fields": ("description", "icon", "image", "pdf"),
            "description": "Image appears in the library card. PDF is optional brochure download.",
        }),
        ("③ Feature list (one per line)", {
            "fields": ("features",),
            "description": "Type each feature on its own line. No brackets or commas needed.",
        }),
        ("④ Publish", {
            "fields": ("order", "featured", "published"),
            "description": "Lower order appears first. Published = visible on the website.",
        }),
    )


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "suburb", "design", "rating", "has_video", "featured", "published", "created_at")
    list_filter = ("featured", "published", "rating")
    search_fields = ("name", "review", "suburb", "design")
    list_editable = ("featured", "published")
    fieldsets = (
        ("Person", {
            "fields": ("name", "role", "suburb", "design", "photo", "rating"),
        }),
        ("Review text", {
            "fields": ("review",),
        }),
        ("Video testimonial", {
            "fields": ("video", "video_url"),
            "description": "Upload an MP4 or paste a YouTube/Vimeo URL. Prefer a short compressed clip.",
        }),
        ("Publishing", {
            "fields": ("featured", "published"),
        }),
    )

    @admin.display(boolean=True, description="Video")
    def has_video(self, obj):
        return bool(obj.video) or bool(obj.video_url)


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ("company_name", "phone", "email", "updated_at")
    fieldsets = (
        ("Company", {
            "fields": ("company_name", "phone", "email", "address"),
        }),
        ("Logos", {
            "fields": ("logo", "footer_logo"),
        }),
        ("Social links", {
            "fields": ("instagram", "facebook", "youtube", "linkedin"),
        }),
    )

    def has_add_permission(self, request):
        return not SiteSetting.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False



@admin.register(SearchEvent)
class SearchEventAdmin(admin.ModelAdmin):
    list_display = ("created_at", "event_type", "query", "result_type", "result_label", "result_count")
    list_filter = ("event_type", "result_type", "created_at")
    search_fields = ("query", "result_label", "result_id")
    readonly_fields = ("created_at", "ip_hash", "user_agent")
    ordering = ("-created_at",)
