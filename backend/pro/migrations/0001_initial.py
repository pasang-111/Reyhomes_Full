from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [("homes", "0001_initial"), ("land", "0001_initial"), ("accounts", "0001_initial")]
    operations = [
        migrations.CreateModel(name="Contract", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("title", models.CharField(max_length=200)),
            ("status", models.CharField(choices=[("draft","Draft"),("sent","Sent to client"),("signed","Signed"),("active","Active build"),("completed","Completed"),("cancelled","Cancelled")], default="draft", max_length=20)),
            ("contract_value", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
            ("signed_date", models.DateField(blank=True, null=True)),
            ("notes", models.TextField(blank=True)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("client", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="contracts", to=settings.AUTH_USER_MODEL)),
            ("home_design", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="contracts", to="homes.homedesign")),
            ("land_package", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="contracts", to="land.homelandpackage")),
        ], options={"ordering":["-updated_at"]}),
        migrations.CreateModel(name="BuildProject", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("current_stage", models.CharField(choices=[("planning","Planning & Approvals"),("foundation","Foundation"),("frame","Frame"),("lockup","Lock-up"),("fixing","Fixing"),("completion","Completion"),("handover","Handover")], default="planning", max_length=20)),
            ("site_address", models.CharField(blank=True, max_length=300)),
            ("start_date", models.DateField(blank=True, null=True)),
            ("estimated_completion", models.DateField(blank=True, null=True)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("contract", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="build", to="pro.contract")),
        ], options={"verbose_name":"Build project","verbose_name_plural":"Build projects"}),
        migrations.CreateModel(name="Milestone", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("title", models.CharField(max_length=200)), ("description", models.TextField(blank=True)),
            ("status", models.CharField(choices=[("pending","Pending"),("in_progress","In progress"),("completed","Completed")], default="pending", max_length=20)),
            ("order", models.PositiveIntegerField(default=0)), ("due_date", models.DateField(blank=True, null=True)), ("completed_at", models.DateTimeField(blank=True, null=True)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("build", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="milestones", to="pro.buildproject")),
        ], options={"ordering":["order","id"]}),
        migrations.CreateModel(name="MessageThread", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("subject", models.CharField(default="Build enquiry", max_length=200)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("agent", models.ForeignKey(limit_choices_to={"is_staff": True}, on_delete=django.db.models.deletion.CASCADE, related_name="agent_threads", to=settings.AUTH_USER_MODEL)),
            ("build", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="threads", to="pro.buildproject")),
            ("client", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="client_threads", to=settings.AUTH_USER_MODEL)),
        ], options={"ordering":["-updated_at"]}),
        migrations.CreateModel(name="Message", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("body", models.TextField()), ("read", models.BooleanField(default=False)), ("created_at", models.DateTimeField(auto_now_add=True)),
            ("sender", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sent_messages", to=settings.AUTH_USER_MODEL)),
            ("thread", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="messages", to="pro.messagethread")),
        ], options={"ordering":["created_at"]}),
        migrations.CreateModel(name="Notification", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("title", models.CharField(max_length=200)), ("message", models.TextField()),
            ("notification_type", models.CharField(choices=[("milestone","Milestone update"),("message","New message"),("contract","Contract update"),("system","System")], default="system", max_length=20)), ("read", models.BooleanField(default=False)), ("link", models.CharField(blank=True, max_length=300)), ("created_at", models.DateTimeField(auto_now_add=True)),
            ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to=settings.AUTH_USER_MODEL)),
        ], options={"ordering":["-created_at"]}),
        migrations.CreateModel(name="ClientInclusion", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("category", models.CharField(choices=[("kitchen","Kitchen"),("bathroom","Bathroom"),("electrical","Electrical"),("flooring","Flooring"),("facade","Facade"),("living","Living"),("exterior","Exterior"),("other","Other")], default="other", max_length=20)), ("title", models.CharField(max_length=200)), ("description", models.TextField(blank=True)), ("selected", models.BooleanField(default=True)), ("notes", models.TextField(blank=True)), ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("build", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="custom_inclusions", to="pro.buildproject")),
            ("client", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="custom_inclusions", to=settings.AUTH_USER_MODEL)),
        ], options={"ordering":["category","title"]}),
    ]
