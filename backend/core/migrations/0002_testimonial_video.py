from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [("core", "0001_initial")]
    operations = [
        migrations.AlterField(
            model_name="testimonial", name="review",
            field=models.TextField(blank=True, help_text="Optional if video only"),
        ),
        migrations.AddField(
            model_name="testimonial", name="video",
            field=models.FileField(blank=True, null=True, upload_to="testimonials/videos/"),
        ),
        migrations.AddField(
            model_name="testimonial", name="video_url",
            field=models.URLField(blank=True, help_text="YouTube/Vimeo URL"),
        ),
    ]
