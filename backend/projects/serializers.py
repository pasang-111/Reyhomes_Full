from rest_framework import serializers
from .models import Project, ProjectGallery, ProjectFeature
from core.media_urls import absolute_media_url


class ProjectGallerySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectGallery
        fields = ["id", "image_url", "alt_text", "order"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return absolute_media_url(request, url)
        return None


class ProjectFeatureSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProjectFeature
        fields = ["id", "title", "description", "image_url", "order"]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            url = obj.image.url
            return absolute_media_url(request, url)
        return None


class ProjectListSerializer(serializers.ModelSerializer):
    hero_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "location", "category", "status",
            "hero_image_url", "featured", "published",
        ]

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            url = obj.hero_image.url
            return absolute_media_url(request, url)
        return None


class ProjectDetailSerializer(serializers.ModelSerializer):
    gallery = ProjectGallerySerializer(source="gallery_images", many=True, read_only=True)
    features = ProjectFeatureSerializer(many=True, read_only=True)
    hero_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "location", "category", "status",
            "description", "hero_image_url", "gallery", "features",
            "featured", "published", "created_at", "updated_at",
        ]

    def get_hero_image_url(self, obj):
        request = self.context.get("request")
        if obj.hero_image:
            url = obj.hero_image.url
            return absolute_media_url(request, url)
        return None


class ProjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "location", "category", "status",
            "description", "hero_image", "featured", "published",
        ]
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
            "title": {"required": True},
            "location": {"required": False, "allow_blank": True},
            "category": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "hero_image": {"required": False, "allow_null": True},
            "featured": {"required": False},
            "published": {"required": False},
        }

    def validate_slug(self, value):
        if value is not None and value != "":
            value = value.strip().lower()
            from django.utils.text import slugify
            if " " in value:
                value = slugify(value)
            qs = Project.objects.filter(slug=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("A project with this slug already exists.")
        return value
