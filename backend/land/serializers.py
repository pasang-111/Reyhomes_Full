from rest_framework import serializers
from .models import Estate, HomeLandPackage, PackageGallery, PackageFeature, PackageInclusion
from core.media_urls import absolute_media_url


def _normalize_list(value):
    if value is None or value == "" or value == []:
        return []
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if isinstance(value, str):
        return [line.strip() for line in value.splitlines() if line.strip()]
    return []


class PackageGallerySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PackageGallery
        fields = ["id", "image_url", "alt_text", "order"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return absolute_media_url(request, url)
        return None


class PackageFeatureSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PackageFeature
        fields = ["id", "title", "description", "image_url", "order"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return absolute_media_url(request, url)
        return None


class EstateSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()
    package_count = serializers.SerializerMethodField()

    class Meta:
        model = Estate
        fields = [
            "id", "name", "slug", "suburb", "state", "description",
            "hero_image_url", "package_count", "published",
        ]
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
            "suburb": {"required": False, "allow_blank": True},
            "state": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "hero_image": {"required": False, "allow_null": True},
        }

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            url = obj.hero_image.url
            return absolute_media_url(request, url)
        return None

    def get_package_count(self, obj):
        return obj.packages.filter(published=True).count()


class PackageInclusionSerializer(serializers.ModelSerializer):
    """Wraps a linked core.Inclusion with the through-row's ordering."""
    id = serializers.IntegerField(source="inclusion.id")
    title = serializers.CharField(source="inclusion.title")
    slug = serializers.CharField(source="inclusion.slug")
    category = serializers.CharField(source="inclusion.category")
    image_url = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()

    class Meta:
        model = PackageInclusion
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


class HomeLandPackageListSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()
    estate_name = serializers.CharField(source="estate.name", read_only=True, default="", allow_null=True)
    beds = serializers.IntegerField(source="bedrooms")
    baths = serializers.FloatField(source="bathrooms")
    landSize = serializers.CharField(source="land_size", allow_blank=True, required=False)
    houseSize = serializers.CharField(source="house_size", allow_blank=True, required=False)
    image = serializers.SerializerMethodField()
    heroImage = serializers.SerializerMethodField()

    class Meta:
        model = HomeLandPackage
        fields = [
            "id", "slug", "title", "estate", "estate_name", "category",
            "state", "suburb", "price", "beds", "baths", "garage",
            "landSize", "houseSize", "frontage", "depth",
            "hero_image_url", "image", "heroImage", "badge", "featured",
        ]

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            url = obj.hero_image.url
            return absolute_media_url(request, url)
        return None

    def get_image(self, obj):
        return self.get_hero_image_url(obj)

    def get_heroImage(self, obj):
        return self.get_hero_image_url(obj)


class HomeLandPackageDetailSerializer(serializers.ModelSerializer):
    gallery = PackageGallerySerializer(source="gallery_images", many=True, read_only=True)
    features = PackageFeatureSerializer(many=True, read_only=True)
    estate_detail = EstateSerializer(source="estate", read_only=True)
    hero_image_url = serializers.SerializerMethodField()
    floor_plan_url = serializers.SerializerMethodField()
    beds = serializers.IntegerField(source="bedrooms")
    baths = serializers.FloatField(source="bathrooms")
    landSize = serializers.CharField(source="land_size", allow_blank=True, required=False)
    houseSize = serializers.CharField(source="house_size", allow_blank=True, required=False)
    image = serializers.SerializerMethodField()
    heroImage = serializers.SerializerMethodField()
    floorPlan = serializers.SerializerMethodField()
    inclusions = serializers.SerializerMethodField()
    estate_name = serializers.CharField(source="estate.name", read_only=True, default="", allow_null=True)

    class Meta:
        model = HomeLandPackage
        fields = [
            "id", "slug", "title", "estate", "estate_name", "estate_detail",
            "category", "state", "suburb", "price", "price_value",
            "beds", "baths", "garage",
            "landSize", "houseSize", "frontage", "depth",
            "description",
            "hero_image_url", "image", "heroImage", "floor_plan_url", "floorPlan",
            "gallery", "features", "inclusions", "badge",
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

    def get_heroImage(self, obj):
        return self.get_hero_image_url(obj)

    def get_floor_plan_url(self, obj):
        request = self.context.get("request")
        if obj.floor_plan:
            url = obj.floor_plan.url
            return absolute_media_url(request, url)
        return None

    def get_floorPlan(self, obj):
        return self.get_floor_plan_url(obj)

    def get_inclusions(self, obj):
        links = obj.inclusion_links.select_related("inclusion").all()
        if links:
            return PackageInclusionSerializer(links, many=True, context=self.context).data
        # DEPRECATED fallback: no real links yet, surface the legacy strings so
        # nothing breaks mid-migration. Remove once inclusion_list is retired.
        return _normalize_list(obj.inclusion_list)


class HomeLandPackageWriteSerializer(serializers.ModelSerializer):
    beds = serializers.IntegerField(source="bedrooms", required=False)
    baths = serializers.DecimalField(
        source="bathrooms", max_digits=3, decimal_places=1, required=False, allow_null=True
    )
    inclusions = serializers.JSONField(source="inclusion_list", required=False, allow_null=True)
    inclusion_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_null=True,
        help_text="Real core.Inclusion ids to link, replacing inclusion_list.",
    )

    class Meta:
        model = HomeLandPackage
        fields = [
            "id", "slug", "title", "estate", "category", "state", "suburb",
            "price", "price_value", "bedrooms", "beds", "bathrooms", "baths", "garage",
            "land_size", "house_size", "frontage", "depth", "description",
            "hero_image", "floor_plan", "badge", "inclusion_list", "inclusions",
            "inclusion_ids",
            "featured", "published",
        ]
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
            "title": {"required": True},
            "price": {"required": True},
            "estate": {"required": False, "allow_null": True},
            "state": {"required": False, "allow_blank": True},
            "suburb": {"required": False, "allow_blank": True},
            "price_value": {"required": False, "allow_null": True},
            "land_size": {"required": False, "allow_blank": True},
            "house_size": {"required": False, "allow_blank": True},
            "frontage": {"required": False, "allow_blank": True},
            "depth": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "hero_image": {"required": False, "allow_null": True},
            "floor_plan": {"required": False, "allow_null": True},
            "badge": {"required": False, "allow_blank": True},
            "featured": {"required": False},
            "published": {"required": False},
        }

    def validate_inclusion_list(self, value):
        return _normalize_list(value)

    def validate_slug(self, value):
        if value is not None and value != "":
            value = value.strip().lower()
            from django.utils.text import slugify
            if " " in value:
                value = slugify(value)
            qs = HomeLandPackage.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("A package with this slug already exists.")
        return value

    def _sync_inclusion_ids(self, instance, inclusion_ids):
        from core.models import Inclusion
        valid_ids = list(
            Inclusion.objects.filter(id__in=inclusion_ids).values_list("id", flat=True)
        )
        instance.inclusion_links.all().delete()
        PackageInclusion.objects.bulk_create([
            PackageInclusion(package=instance, inclusion_id=inc_id, order=i)
            for i, inc_id in enumerate(valid_ids)
        ])

    def create(self, validated_data):
        validated_data.setdefault("inclusion_list", [])
        inclusion_ids = validated_data.pop("inclusion_ids", None)
        instance = super().create(validated_data)
        if inclusion_ids is not None:
            self._sync_inclusion_ids(instance, inclusion_ids)
        return instance

    def update(self, instance, validated_data):
        if "inclusion_list" in validated_data and validated_data["inclusion_list"] is None:
            validated_data["inclusion_list"] = []
        inclusion_ids = validated_data.pop("inclusion_ids", None)
        instance = super().update(instance, validated_data)
        if inclusion_ids is not None:
            self._sync_inclusion_ids(instance, inclusion_ids)
        return instance
