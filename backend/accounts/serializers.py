from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import UserProfile, WishlistItem
from core.media_urls import absolute_media_url


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = (
            "phone",
            "marketing_opt_in",
            "is_client",
            "is_reypro",
            "assigned_agent",
        )
        read_only_fields = ("is_client", "is_reypro", "assigned_agent")


class ApiUserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source="profile.phone", read_only=True)
    marketing_opt_in = serializers.BooleanField(
        source="profile.marketing_opt_in", read_only=True
    )
    is_client = serializers.BooleanField(source="profile.is_client", read_only=True)
    is_reypro = serializers.BooleanField(source="profile.is_reypro", read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "marketing_opt_in",
            "is_client",
            "is_reypro",
            "date_joined",
        )


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=32, required=False, allow_blank=True)
    marketing_opt_in = serializers.BooleanField(default=False)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        phone = validated_data.pop("phone", "")
        marketing = validated_data.pop("marketing_opt_in", False)
        email = validated_data.pop("email")

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.phone = phone
        profile.marketing_opt_in = marketing
        profile.save()
        return user


class WishlistItemSerializer(serializers.ModelSerializer):
    home_design = serializers.SerializerMethodField()
    land_package = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = ("id", "home_design", "land_package", "created_at")
        read_only_fields = ("id", "created_at")

    def _design_payload(self, design):
        request = self.context.get("request")
        image = design.hero_image.url if design.hero_image else ""
        if image and request and not image.startswith("http"):
            image = absolute_media_url(request, image)
        return {
            "id": design.id,
            "slug": design.slug,
            "name": design.title,
            "image": image,
            "price": design.price,
        }

    def _package_payload(self, package):
        request = self.context.get("request")
        image = package.hero_image.url if package.hero_image else ""
        if image and request and not image.startswith("http"):
            image = absolute_media_url(request, image)
        return {
            "id": package.id,
            "slug": package.slug,
            "title": package.title,
            "image": image,
            "price": package.price,
        }

    def get_home_design(self, obj):
        return self._design_payload(obj.home_design) if obj.home_design else None

    def get_land_package(self, obj):
        return self._package_payload(obj.land_package) if obj.land_package else None


class WishlistCreateSerializer(serializers.Serializer):
    home_design_id = serializers.IntegerField(required=False)
    land_package_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        design_id = attrs.get("home_design_id")
        package_id = attrs.get("land_package_id")
        if bool(design_id) == bool(package_id):
            raise serializers.ValidationError(
                "Provide exactly one of home_design_id or land_package_id."
            )
        return attrs


class AdminClientSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            "user_id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "is_client",
            "is_reypro",
            "assigned_agent",
            "marketing_opt_in",
            "updated_at",
        )


class AdminUserSerializer(serializers.ModelSerializer):
    """
    Unified, role-aware representation of a User for the admin "Users" area.
    Segments every account into exactly one of the four levels the business
    actually uses (see README.md §3): Administrator, Staff, Client, or
    Normal user — computed from real fields (is_superuser/is_staff on the
    Django User, is_client on the profile), never stored redundantly.
    """

    phone = serializers.CharField(source="profile.phone", read_only=True)
    is_client = serializers.BooleanField(source="profile.is_client", read_only=True)
    is_reypro = serializers.BooleanField(source="profile.is_reypro", read_only=True)
    assigned_agent = serializers.IntegerField(
        source="profile.assigned_agent_id", read_only=True
    )
    agent_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "is_client",
            "is_reypro",
            "assigned_agent",
            "agent_name",
            "date_joined",
            "last_login",
        )

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email or obj.username

    def get_role(self, obj):
        if obj.is_superuser:
            return "admin"
        if obj.is_staff:
            return "staff"
        profile = getattr(obj, "profile", None)
        if profile and profile.is_client:
            return "client"
        return "user"

    def get_agent_name(self, obj):
        profile = getattr(obj, "profile", None)
        agent = getattr(profile, "assigned_agent", None) if profile else None
        if not agent:
            return None
        return agent.get_full_name() or agent.email
