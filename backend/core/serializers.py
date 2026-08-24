from rest_framework import serializers
from .models import HeroSlide, Inclusion, Testimonial, SiteSetting
from core.media_urls import absolute_media_url


def _normalize_list(value):
    """Accept list, newline string, or empty → always return a clean list."""
    if value is None or value == "" or value == []:
        return []
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if isinstance(value, str):
        return [line.strip() for line in value.splitlines() if line.strip()]
    return []


class HeroSlideSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    mobile_image_url = serializers.SerializerMethodField()
    video_url = serializers.SerializerMethodField()
    poster_url = serializers.SerializerMethodField()

    class Meta:
        model = HeroSlide
        fields = [
            "id", "title", "subtitle", "description",
            "button_text", "button_link",
            "image_url", "mobile_image_url", "video_url", "poster_url",
            "order", "active",
        ]

    def _abs(self, field):
        request = self.context.get("request")
        if field:
            return absolute_media_url(request, field.url)
        return None


    def get_image_url(self, obj):
        return self._abs(obj.image)

    def get_mobile_image_url(self, obj):
        return self._abs(obj.mobile_image)

    def get_video_url(self, obj):
        return self._abs(obj.video)

    def get_poster_url(self, obj):
        return self._abs(obj.poster)


class InclusionSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()

    class Meta:
        model = Inclusion
        fields = [
            "id", "title", "slug", "category", "tier", "subtitle", "description",
            "image_url", "pdf_url", "icon", "features", "order", "featured",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return absolute_media_url(request, url)
        return None

    def get_pdf_url(self, obj):
        request = self.context.get("request")
        if getattr(obj, "pdf", None):
            url = obj.pdf.url
            return absolute_media_url(request, url)
        return None

    def get_features(self, obj):
        return _normalize_list(obj.features)


class TestimonialSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()
    video_file_url = serializers.SerializerMethodField()

    class Meta:
        model = Testimonial
        fields = [
            "id", "name", "role", "suburb", "design", "review",
            "rating", "photo_url", "video_file_url", "video_url", "featured",
        ]

    def get_photo_url(self, obj):
        request = self.context.get("request")
        if obj.photo:
            url = obj.photo.url
            return absolute_media_url(request, url)
        return None

    def get_video_file_url(self, obj):
        request = self.context.get("request")
        if obj.video:
            url = obj.video.url
            return absolute_media_url(request, url)
        return None


class SiteSettingSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    footer_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = SiteSetting
        fields = [
            "company_name", "phone", "email", "address",
            "logo_url", "footer_logo_url",
            "instagram", "facebook", "youtube", "linkedin",
        ]

    def _abs(self, field):
        request = self.context.get("request")
        if field:
            return absolute_media_url(request, field.url)
        return None


    def get_logo_url(self, obj):
        return self._abs(obj.logo)

    def get_footer_logo_url(self, obj):
        return self._abs(obj.footer_logo)


class InclusionWriteSerializer(serializers.ModelSerializer):
    features = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Inclusion
        fields = [
            "id", "title", "slug", "category", "tier", "subtitle", "description",
            "image", "pdf", "icon", "features", "order", "featured", "published",
        ]
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
            "title": {"required": True},
            "subtitle": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "icon": {"required": False, "allow_blank": True},
            "image": {"required": False, "allow_null": True},
            "pdf": {"required": False, "allow_null": True},
            "order": {"required": False},
            "featured": {"required": False},
            "published": {"required": False},
        }

    def validate_features(self, value):
        return _normalize_list(value)

    def validate_slug(self, value):
        if value is not None and value != "":
            value = value.strip().lower()
            from django.utils.text import slugify
            if " " in value:
                value = slugify(value)
            qs = Inclusion.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("An inclusion with this slug already exists.")
        return value

    def create(self, validated_data):
        if "features" not in validated_data or validated_data["features"] is None:
            validated_data["features"] = []
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "features" in validated_data and validated_data["features"] is None:
            validated_data["features"] = []
        return super().update(instance, validated_data)


class TestimonialWriteSerializer(serializers.ModelSerializer):
    """Accepts text + optional photo / video file uploads (multipart)."""

    class Meta:
        model = Testimonial
        fields = [
            "id", "name", "role", "suburb", "design", "review", "rating",
            "photo", "video", "video_url", "featured", "published",
        ]
        extra_kwargs = {
            "name": {"required": True},
            "role": {"required": False, "allow_blank": True},
            "suburb": {"required": False, "allow_blank": True},
            "design": {"required": False, "allow_blank": True},
            "review": {"required": False, "allow_blank": True},
            "rating": {"required": False},
            "photo": {"required": False, "allow_null": True},
            "video": {"required": False, "allow_null": True},
            "video_url": {"required": False, "allow_blank": True},
            "featured": {"required": False},
            "published": {"required": False},
        }
