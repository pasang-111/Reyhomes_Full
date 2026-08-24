from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [("auth", "0012_alter_user_first_name_max_length"), ("homes", "0001_initial"), ("land", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="UserProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("phone", models.CharField(blank=True, max_length=32)),
                ("marketing_opt_in", models.BooleanField(default=False)),
                ("is_client", models.BooleanField(default=False, help_text="Set automatically when a contract is signed, or manually by admin.")),
                ("is_reypro", models.BooleanField(default=False, help_text="Grants access to ReyHomes Pro portal (milestones, chat, custom inclusions).")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("assigned_agent", models.ForeignKey(blank=True, limit_choices_to={"is_staff": True}, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="assigned_clients", to=settings.AUTH_USER_MODEL)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="profile", to=settings.AUTH_USER_MODEL)),
            ],
            options={"verbose_name":"User profile","verbose_name_plural":"User profiles"},
        ),
        migrations.CreateModel(
            name="WishlistItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("home_design", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="wishlisted_by", to="homes.homedesign")),
                ("land_package", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="wishlisted_by", to="land.homelandpackage")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="wishlist_items", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering":["-created_at"]},
        ),
        migrations.AddConstraint(model_name="wishlistitem", constraint=models.UniqueConstraint(condition=models.Q(home_design__isnull=False), fields=("user", "home_design"), name="unique_wishlist_design")),
        migrations.AddConstraint(model_name="wishlistitem", constraint=models.UniqueConstraint(condition=models.Q(land_package__isnull=False), fields=("user", "land_package"), name="unique_wishlist_package")),
    ]
