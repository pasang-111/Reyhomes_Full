from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Estate,
    HomeLandPackage,
    PackageGallery,
    PackageFeature,
    PackageInclusion,
)


class PackageGalleryInline(admin.TabularInline):
    model = PackageGallery
    extra = 1
    fields = ("image", "alt_text", "order")


class PackageFeatureInline(admin.TabularInline):
    model = PackageFeature
    extra = 1
    fields = ("title", "description", "image", "order")



class PackageInclusionInline(admin.TabularInline):
    """Attach library inclusions to this package — searchable by title/category/tier."""
    model = PackageInclusion
    extra = 1
    fields = ("inclusion", "inclusion_tier", "inclusion_category", "order")
    readonly_fields = ("inclusion_tier", "inclusion_category")
    autocomplete_fields = ("inclusion",)
    ordering = ("order", "id")
    verbose_name_plural = "Linked inclusions (from library)"
    verbose_name = "Inclusion link"

    @admin.display(description="Tier")
    def inclusion_tier(self, obj):
        if not obj or not obj.pk or not obj.inclusion_id:
            return "—"
        return (obj.inclusion.tier or "—").title()

    @admin.display(description="Category")
    def inclusion_category(self, obj):
        if not obj or not obj.pk or not obj.inclusion_id:
            return "—"
        return (obj.inclusion.category or "—").title()



@admin.register(Estate)
class EstateAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "suburb", "state", "published", "updated_at")
    list_filter = ("published", "state")
    search_fields = ("name", "suburb", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ("published",)
    save_on_top = True


@admin.register(HomeLandPackage)
class HomeLandPackageAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "slug",
        "estate",
        "category",
        "price",
        "bedrooms",
        "featured",
        "published",
        "preview_link",
        "updated_at",
    )
    list_filter = ("category", "featured", "published", "state", "estate")
    search_fields = ("title", "slug", "suburb", "description")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("featured", "published")
    list_per_page = 25
    autocomplete_fields = ("estate",)
    readonly_fields = ("created_at", "updated_at", "preview_panel")
    inlines = [PackageGalleryInline, PackageFeatureInline, PackageInclusionInline]
    save_on_top = True

    fieldsets = (
        (
            "① Package identity",
            {
                "fields": (
                    "title",
                    "slug",
                    "estate",
                    "category",
                    "badge",
                    "state",
                    "suburb",
                    "preview_panel",
                ),
                "description": "Estate + suburb power filters on /home-land. Title is the public package name.",
            },
        ),
        (
            "② Price & rooms",
            {
                "fields": (
                    ("price", "price_value"),
                    ("bedrooms", "bathrooms", "garage"),
                    ("land_size", "house_size"),
                    ("frontage", "depth"),
                ),
                "description": "Price text for display; price_value for sorting. Sizes: m² for areas, metres for frontage/depth.",
            },
        ),
        (
            "③ Images",
            {
                "fields": ("hero_image", "floor_plan"),
                "description": "Hero → listing cards. Floor plan → package detail.",
            },
        ),
        ("④ Description", {"fields": ("description",)}),
        (
            "⑤ Publish",
            {
                "fields": ("featured", "published", "created_at", "updated_at"),
                "description": "Published = on website. Featured = homepage packages row.",
            },
        ),
    )

    @admin.display(description="Site")
    def preview_link(self, obj):
        if not obj.slug:
            return "—"
        return format_html(
            '<a href="/home-land/{}" target="_blank" rel="noopener">View ↗</a>',
            obj.slug,
        )

    @admin.display(description="Frontend reference")
    def preview_panel(self, obj):
        if not obj.pk or not obj.slug:
            return "Save once to get public preview links."
        return format_html(
            '<div style="line-height:1.6">'
            "<strong>Public pages this record powers</strong><br>"
            '• Detail: <a href="/home-land/{0}" target="_blank">/home-land/{0}</a><br>'
            '• Listing: <a href="/home-land" target="_blank">/home-land</a><br>'
            "• Homepage packages row (if Featured)"
            "</div>",
            obj.slug,
        )


@admin.register(PackageGallery)
class PackageGalleryAdmin(admin.ModelAdmin):
    list_display = ("package", "alt_text", "order")
    list_filter = ("package",)


@admin.register(PackageFeature)
class PackageFeatureAdmin(admin.ModelAdmin):
    list_display = ("package", "title", "order")
    list_filter = ("package",)
