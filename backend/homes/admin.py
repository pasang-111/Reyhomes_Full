from django import forms
from django.contrib import admin
from django.contrib import messages
from django.urls import reverse
from django.utils.html import format_html
from django.conf import settings
import re

from .models import HomeDesign, HomeDesignGallery, HomeDesignFeature, DesignInclusion


def _parse_price(value: str):
    if not value:
        return None
    cleaned = re.sub(r"[^0-9.]", "", str(value))
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None


class HomeDesignGalleryInline(admin.TabularInline):
    model = HomeDesignGallery
    extra = 0
    fields = ("image", "alt_text", "order")
    verbose_name = "Gallery image"
    verbose_name_plural = "2 · Gallery images (optional)"


class HomeDesignFeatureInline(admin.TabularInline):
    model = HomeDesignFeature
    extra = 0
    fields = ("title", "description", "image", "order")
    verbose_name_plural = "3 · Feature highlights (optional)"



class DesignInclusionInline(admin.TabularInline):
    """Attach library inclusions to this design — searchable by title/category/tier."""
    model = DesignInclusion
    extra = 1
    fields = ("inclusion", "inclusion_tier", "inclusion_category", "order")
    readonly_fields = ("inclusion_tier", "inclusion_category")
    autocomplete_fields = ("inclusion",)
    ordering = ("order", "id")
    verbose_name_plural = "4 · Linked inclusions (from library)"
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


@admin.register(HomeDesign)
class HomeDesignAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "price",
        "bedrooms",
        "bathrooms",
        "garage",
        "featured",
        "published",
        "preview_link",
        "updated_at",
    )
    list_display_links = ("title",)
    list_filter = ("category", "featured", "published", "state", "status")
    search_fields = ("title", "slug", "description", "suburb", "price")
    prepopulated_fields = {"slug": ("title",)}
    list_editable = ("featured", "published")
    list_per_page = 20
    readonly_fields = ("created_at", "updated_at", "preview_panel", "entry_checklist")
    inlines = [HomeDesignGalleryInline, HomeDesignFeatureInline, DesignInclusionInline]
    filter_horizontal = ("related_designs",)
    save_on_top = True
    actions = (
        "publish_selected",
        "unpublish_selected",
        "mark_featured",
        "clear_featured",
        "fill_price_value",
    )

    fieldsets = (
        (
            "① Identity (what customers see first)",
            {
                "fields": (
                    "entry_checklist",
                    "title",
                    "slug",
                    "subtitle",
                    "category",
                    "status",
                    ("state", "suburb"),
                    "preview_panel",
                ),
                "description": (
                    "Title becomes the public name (e.g. “The Malaga”). "
                    "Slug is the URL: /home-designs/your-slug/. "
                    "Category drives website filters."
                ),
            },
        ),
        (
            "② Price (display + filters)",
            {
                "fields": (("price", "price_value"),),
                "description": (
                    "Price = text shown on the site (e.g. $435,000). "
                    "Price value = number used for sorting/filters. "
                    "Leave price value blank — it is filled automatically from Price when you save."
                ),
            },
        ),
        (
            "③ Rooms & parking",
            {
                "fields": (
                    ("bedrooms", "bathrooms", "garage"),
                    ("living", "study"),
                ),
                "description": "These appear on cards and the specs grid.",
            },
        ),
        (
            "④ Sizes (m² and metres)",
            {
                "fields": (
                    ("house_size", "land_size"),
                    ("frontage", "depth", "min_lot_width"),
                ),
                "description": (
                    "House / land size → square metres (e.g. 190.04 or 190.04 m²). "
                    "Frontage, depth, min. lot width → metres (e.g. 12.5). "
                    "Bare numbers are fine; the website adds units."
                ),
            },
        ),
        (
            "⑤ Description",
            {
                "fields": ("description",),
                "description": "Short, clear copy for the design detail page.",
            },
        ),
        (
            "⑥ Main images (required for a polished listing)",
            {
                "fields": ("hero_image", "floor_plan"),
                "description": (
                    "Hero image = card + top of detail page (prefer wide landscape). "
                    "Floor plan = plans section. Gallery images are added below."
                ),
            },
        ),
        (
            "⑦ Related designs",
            {
                "fields": ("related_designs",),
                "description": "Optional. Shown as “Related” on the detail page. Same category works best.",
                "classes": ("collapse",),
            },
        ),
        (
            "⑧ Publish",
            {
                "fields": (("featured", "published"), "created_at", "updated_at"),
                "description": (
                    "Published = visible on the website. "
                    "Featured = homepage / featured carousel (must also be published)."
                ),
            },
        ),
    )

    @admin.display(description="Site")
    def preview_link(self, obj):
        if not obj.slug:
            return "—"
        path = f"/home-designs/{obj.slug}"
        return format_html('<a href="{}" target="_blank" rel="noopener">View ↗</a>', path)

    @admin.display(description="Quick preview")
    def preview_panel(self, obj):
        if not obj.pk:
            return "Save once to see preview links."
        site = getattr(settings, "PUBLIC_SITE_URL", "") or ""
        path = f"/home-designs/{obj.slug}"
        url = f"{site.rstrip('/')}{path}" if site else path
        img = ""
        if obj.hero_image:
            img = format_html(
                '<img src="{}" style="max-height:120px;border-radius:8px;margin-bottom:8px;" />',
                obj.hero_image.url,
            )
        return format_html(
            '{}<div style="font-size:13px;line-height:1.5;">'
            "<strong>{}</strong><br/>{} · {} bed / {} bath<br/>"
            '<a href="{}" target="_blank">Open on website ↗</a></div>',
            img,
            obj.title,
            obj.category,
            obj.bedrooms,
            obj.bathrooms,
            url,
        )

    @admin.display(description="Staff checklist")
    def entry_checklist(self, obj):
        if not obj.pk:
            return format_html(
                '<ol style="margin:0;padding-left:1.2rem;font-size:13px;line-height:1.6;">'
                "<li>Name the design and pick a category</li>"
                "<li>Add price (e.g. $435,000)</li>"
                "<li>Fill beds / baths / garage</li>"
                "<li>Upload a hero image</li>"
                "<li>Tick <strong>Published</strong> when ready</li>"
                "</ol>"
            )
        checks = []
        checks.append(("Name", bool(obj.title)))
        checks.append(("Category", bool(obj.category)))
        checks.append(("Price text", bool(obj.price)))
        checks.append(("Hero image", bool(obj.hero_image)))
        checks.append(("Published", bool(obj.published)))
        rows = "".join(
            f'<li style="color:{"#1a7f4b" if ok else "#b45309"};">{label}: {"✓" if ok else "needs attention"}</li>'
            for label, ok in checks
        )
        return format_html(
            '<ul style="margin:0;padding-left:1.2rem;font-size:13px;line-height:1.6;">{}</ul>',
            format_html(rows),
        )

    def save_model(self, request, obj, form, change):
        if obj.price and obj.price_value is None:
            parsed = _parse_price(obj.price)
            if parsed is not None:
                obj.price_value = parsed
        super().save_model(request, obj, form, change)

    @admin.action(description="Publish selected")
    def publish_selected(self, request, queryset):
        n = queryset.update(published=True)
        self.message_user(request, f"Published {n} design(s).", messages.SUCCESS)

    @admin.action(description="Unpublish selected")
    def unpublish_selected(self, request, queryset):
        n = queryset.update(published=False)
        self.message_user(request, f"Unpublished {n} design(s).", messages.WARNING)

    @admin.action(description="Mark featured")
    def mark_featured(self, request, queryset):
        n = queryset.update(featured=True)
        self.message_user(request, f"Featured {n} design(s).", messages.SUCCESS)

    @admin.action(description="Clear featured")
    def clear_featured(self, request, queryset):
        n = queryset.update(featured=False)
        self.message_user(request, f"Cleared featured on {n}.", messages.INFO)

    @admin.action(description="Fill empty price_value from price text")
    def fill_price_value(self, request, queryset):
        updated = 0
        for obj in queryset:
            if obj.price_value is None and obj.price:
                parsed = _parse_price(obj.price)
                if parsed is not None:
                    obj.price_value = parsed
                    obj.save(update_fields=["price_value"])
                    updated += 1
        self.message_user(request, f"Updated price_value on {updated} design(s).", messages.SUCCESS)
