from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_testimonial_video"),
    ]

    operations = [
        migrations.AddField(
            model_name="inclusion",
            name="pdf",
            field=models.FileField(
                blank=True,
                help_text="Optional inclusions PDF brochure (downloadable on the site).",
                null=True,
                upload_to="inclusions/pdfs/",
            ),
        ),
    ]
