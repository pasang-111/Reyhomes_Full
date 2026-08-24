from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    phone = models.CharField(max_length=32, blank=True)
    marketing_opt_in = models.BooleanField(default=False)
    is_client = models.BooleanField(
        default=False,
        help_text="Set automatically when a contract is signed, or manually by admin.",
    )
    is_reypro = models.BooleanField(
        default=False,
        help_text="Grants access to ReyHomes Pro portal (milestones, chat, custom inclusions).",
    )
    assigned_agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_clients",
        limit_choices_to={"is_staff": True},
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User profile"
        verbose_name_plural = "User profiles"

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.email} profile"


class WishlistItem(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wishlist_items",
    )
    home_design = models.ForeignKey(
        "homes.HomeDesign",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="wishlisted_by",
    )
    land_package = models.ForeignKey(
        "land.HomeLandPackage",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="wishlisted_by",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "home_design"],
                condition=models.Q(home_design__isnull=False),
                name="unique_wishlist_design",
            ),
            models.UniqueConstraint(
                fields=["user", "land_package"],
                condition=models.Q(land_package__isnull=False),
                name="unique_wishlist_package",
            ),
        ]

    def __str__(self):
        target = self.home_design or self.land_package
        return f"{self.user.email} → {target}"
