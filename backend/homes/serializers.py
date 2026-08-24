from rest_framework import serializers
from .models import HomeDesign, HomeDesignGallery, HomeDesignFeature, DesignInclusion
from core.media_urls import absolute_media_url


def _normalize_list(value):
    if value is None or value == "" or value == []:
        return []
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if isinstance(value, str):
        return [line.strip() for line in value.splitlines() if line.strip()]
    return []


class HomeDesignGallerySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = HomeDesignGallery
        fields = ["id", "image_url", "alt_text", "order"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return absolute_media_url(request, url)
        return None


class HomeDesignFeatureSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = HomeDesignFeature
        fields = ["id", "title", "description", "image_url", "order"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return absolute_media_url(request, url)
        return None


class DesignInclusionSerializer(serializers.ModelSerializer):
    """Wraps a linked core.Inclusion with the through-row's ordering."""
    id = serializers.IntegerField(source="inclusion.id")
    title = serializers.CharField(source="inclusion.title")
    slug = serializers.CharField(source="inclusion.slug")
    category = serializers.CharField(source="inclusion.category")
    image_url = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()

    class Meta:
        model = DesignInclusion
        fields = ["id", "title", "slug", "category", "image_url", "pdf_url", "features", "order"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.inclusion.image:
            url = obj.inclusion.image.url
            return absolute_media_url(request, url)
        return None

    def get_pdf_url(self, obj):
        request = self.context.get("request")
        if getattr(obj.inclusion, "pdf", None):
            url = obj.inclusion.pdf.url
            return absolute_media_url(request, url)
        return None

    def get_features(self, obj):
        return _normalize_list(obj.inclusion.features)


class RelatedDesignSerializer(serializers.ModelSerializer):
    """Lightweight representation of a related design for card/link rendering."""
    hero_image_url = serializers.SerializerMethodField()

    class Meta:
        model = HomeDesign
        fields = ["id", "slug", "title", "price", "hero_image_url"]

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            url = obj.hero_image.url
            return absolute_media_url(request, url)
        return None


class HomeDesignListSerializer(serializers.ModelSerializer):
    """Lightweight for list/grid views."""
    hero_image_url = serializers.SerializerMethodField()
    name = serializers.CharField(source="title")
    beds = serializers.IntegerField(source="bedrooms")
    baths = serializers.FloatField(source="bathrooms")
    houseSize = serializers.CharField(source="house_size", allow_blank=True, required=False)
    image = serializers.SerializerMethodField()

    class Meta:
        model = HomeDesign
        fields = [
            "id", "slug", "name", "title", "subtitle", "category", "status",
            "price", "beds", "baths", "garage", "living", "study",
            "houseSize", "house_size", "frontage", "depth", "min_lot_width",
            "hero_image_url", "image", "featured",
        ]

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            url = obj.hero_image.url
            return absolute_media_url(request, url)
        return None

    def get_image(self, obj):
        return self.get_hero_image_url(obj)


class HomeDesignDetailSerializer(serializers.ModelSerializer):
    gallery = HomeDesignGallerySerializer(source="gallery_images", many=True, read_only=True)
    features = HomeDesignFeatureSerializer(many=True, read_only=True)
    hero_image_url = serializers.SerializerMethodField()
    floor_plan_url = serializers.SerializerMethodField()
    name = serializers.CharField(source="title")
    beds = serializers.IntegerField(source="bedrooms")
    baths = serializers.FloatField(source="bathrooms")
    houseSize = serializers.CharField(source="house_size", allow_blank=True, required=False)
    width = serializers.CharField(source="frontage", allow_blank=True, required=False)
    length = serializers.CharField(source="depth", allow_blank=True, required=False)
    minLotWidth = serializers.CharField(source="min_lot_width", allow_blank=True, required=False)
    image = serializers.SerializerMethodField()
    floorplan = serializers.SerializerMethodField()
    inclusions = serializers.SerializerMethodField()
    related = serializers.SerializerMethodField()

    class Meta:
        model = HomeDesign
        fields = [
            "id", "slug", "name", "title", "subtitle", "category", "status",
            "state", "suburb", "price", "price_value",
            "beds", "baths", "garage", "living", "study",
            "houseSize", "house_size", "land_size",
            "width", "length", "frontage", "depth", "minLotWidth", "min_lot_width",
            "description",
            "hero_image_url", "image", "floor_plan_url", "floorplan",
            "gallery", "features", "inclusions", "related",
            "featured", "published", "created_at", "updated_at",
        ]

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            url = obj.hero_image.url
            return absolute_media_url(request, url)
        return None

    def get_image(self, obj):
        return self.get_hero_image_url(obj)

    def get_floor_plan_url(self, obj):
        request = self.context.get("request")
        if obj.floor_plan:
            url = obj.floor_plan.url
            return absolute_media_url(request, url)
        return None

    def get_floorplan(self, obj):
        return self.get_floor_plan_url(obj)

    def get_inclusions(self, obj):
        links = obj.inclusion_links.select_related("inclusion").all()
        if links:
            return DesignInclusionSerializer(links, many=True, context=self.context).data
        # DEPRECATED fallback: no real links yet, surface the legacy strings so
        # nothing breaks mid-migration. Remove once inclusion_list is retired.
        return _normalize_list(obj.inclusion_list)

    def get_related(self, obj):
        related = obj.related_designs.filter(published=True)
        if related:
            return RelatedDesignSerializer(related, many=True, context=self.context).data
        # DEPRECATED fallback: no real relations yet, surface the legacy slugs.
        # Remove once related_slugs is retired.
        return _normalize_list(obj.related_slugs)


class HomeDesignWriteSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="title", required=False, allow_blank=True)
    beds = serializers.IntegerField(source="bedrooms", required=False)
    baths = serializers.DecimalField(
        source="bathrooms", max_digits=3, decimal_places=1, required=False, allow_null=True
    )
    inclusions = serializers.JSONField(source="inclusion_list", required=False, allow_null=True)
    related = serializers.JSONField(source="related_slugs", required=False, allow_null=True)
    inclusion_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_null=True,
        help_text="Real core.Inclusion ids to link, replacing inclusion_list.",
    )
    related_design_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_null=True,
        help_text="Real HomeDesign ids to link, replacing related_slugs.",
    )

    class Meta:
        model = HomeDesign
        fields = [
            "id", "slug", "title", "name", "subtitle", "category", "status",
            "state", "suburb", "price", "price_value",
            "bedrooms", "beds", "bathrooms", "baths", "garage", "living", "study",
            "house_size", "land_size", "frontage", "depth", "min_lot_width",
            "description", "hero_image", "floor_plan",
            "inclusion_list", "inclusions", "related_slugs", "related",
            "inclusion_ids", "related_design_ids",
            "featured", "published",
        ]

        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
            "title": {"required": True},
            "price": {"required": True},
            "subtitle": {"required": False, "allow_blank": True},
            "status": {"required": False, "allow_blank": True},
            "state": {"required": False, "allow_blank": True},
            "suburb": {"required": False, "allow_blank": True},
            "price_value": {"required": False, "allow_null": True},
            "house_size": {"required": False, "allow_blank": True},
            "land_size": {"required": False, "allow_blank": True},
            "frontage": {"required": False, "allow_blank": True},
            "depth": {"required": False, "allow_blank": True},
            "min_lot_width": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "hero_image": {"required": False, "allow_null": True},
            "floor_plan": {"required": False, "allow_null": True},
            "featured": {"required": False},
            "published": {"required": False},
        }

    def validate_inclusion_list(self, value):
        return _normalize_list(value)

    def validate_category(self, value):
        from .models import HomeDesign
        allowed = {c[0] for c in HomeDesign.CATEGORY_CHOICES}
        if value and value not in allowed:
            raise serializers.ValidationError(
                "Category must be one of: " + ", ".join(sorted(allowed))
            )
        return value

    def validate_related_slugs(self, value):
        return _normalize_list(value)

    def validate_slug(self, value):
        if value is not None and value != "":
            value = value.strip().lower()
            from django.utils.text import slugify
            if " " in value:
                value = slugify(value)
            qs = HomeDesign.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("A design with this slug already exists.")
        return value

    def _sync_inclusion_ids(self, instance, inclusion_ids):
        from core.models import Inclusion
        valid_ids = list(
            Inclusion.objects.filter(id__in=inclusion_ids).values_list("id", flat=True)
        )
        instance.inclusion_links.all().delete()
        DesignInclusion.objects.bulk_create([
            DesignInclusion(home_design=instance, inclusion_id=inc_id, order=i)
            for i, inc_id in enumerate(valid_ids)
        ])

    def _sync_related_design_ids(self, instance, design_ids):
        valid_ids = HomeDesign.objects.filter(id__in=design_ids).exclude(pk=instance.pk)
        instance.related_designs.set(valid_ids)

    def create(self, validated_data):
        validated_data.setdefault("inclusion_list", [])
        validated_data.setdefault("related_slugs", [])
        inclusion_ids = validated_data.pop("inclusion_ids", None)
        related_design_ids = validated_data.pop("related_design_ids", None)
        instance = super().create(validated_data)
        if inclusion_ids is not None:
            self._sync_inclusion_ids(instance, inclusion_ids)
        if related_design_ids is not None:
            self._sync_related_design_ids(instance, related_design_ids)
        return instance

    def update(self, instance, validated_data):
        if "inclusion_list" in validated_data and validated_data["inclusion_list"] is None:
            validated_data["inclusion_list"] = []
        if "related_slugs" in validated_data and validated_data["related_slugs"] is None:
            validated_data["related_slugs"] = []
        inclusion_ids = validated_data.pop("inclusion_ids", None)
        related_design_ids = validated_data.pop("related_design_ids", None)
        instance = super().update(instance, validated_data)
        if inclusion_ids is not None:
            self._sync_inclusion_ids(instance, inclusion_ids)
        if related_design_ids is not None:
            self._sync_related_design_ids(instance, related_design_ids)
        return instance
