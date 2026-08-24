from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import UserProfile, WishlistItem


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    fk_name = "user"
    fields = (
        "phone",
        "marketing_opt_in",
        "is_client",
        "is_reypro",
        "assigned_agent",
    )


class UserAdmin(BaseUserAdmin):
    inlines = [UserProfileInline]
    list_display = ("username", "email", "first_name", "last_name", "is_staff", "is_superuser", "reypro_status")
    list_filter = ("is_staff", "is_superuser", "profile__is_reypro", "profile__is_client")

    def get_readonly_fields(self, request, obj=None):
        fields = list(super().get_readonly_fields(request, obj))
        if not request.user.is_superuser:
            fields.extend(["is_staff", "is_superuser", "groups", "user_permissions"])
        return tuple(dict.fromkeys(fields))

    def has_add_permission(self, request):
        # Only the superuser can create/assign administrative accounts.
        return request.user.is_superuser

    @admin.display(boolean=True, description="ReyPro")
    def reypro_status(self, obj):
        return getattr(getattr(obj, "profile", None), "is_reypro", False)


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ("user", "home_design", "land_package", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "user__username", "home_design__title", "land_package__title")
    autocomplete_fields = ("user", "home_design", "land_package")


admin.site.unregister(User)
admin.site.register(User, UserAdmin)
