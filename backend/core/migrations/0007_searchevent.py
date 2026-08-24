from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_alter_heroslide_poster_alter_heroslide_video_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="SearchEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("event_type", models.CharField(choices=[("query", "Query"), ("click", "Result click")], default="query", max_length=16)),
                ("query", models.CharField(max_length=200)),
                ("result_type", models.CharField(blank=True, help_text="designs|packages|projects|inclusions", max_length=32)),
                ("result_id", models.CharField(blank=True, max_length=64)),
                ("result_label", models.CharField(blank=True, max_length=200)),
                ("result_count", models.PositiveIntegerField(default=0, help_text="Hits at time of query")),
                ("path", models.CharField(blank=True, max_length=200)),
                ("ip_hash", models.CharField(blank=True, db_index=True, max_length=64)),
                ("user_agent", models.CharField(blank=True, max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
            ],
            options={
                "verbose_name": "Search event",
                "verbose_name_plural": "Search events",
                "ordering": ["-created_at"],
            },
        ),
    ]
