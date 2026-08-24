# Generated manually — makes title, slug and price optional so staff can
# save a Home Design as a draft without the CMS blocking on required-field
# errors. HomeDesign.save() still auto-fills a unique slug (and a
# placeholder title) when they're left blank.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('homes', '0003_migrate_inclusion_and_related_strings'),
    ]

    operations = [
        migrations.AlterField(
            model_name='homedesign',
            name='title',
            field=models.CharField(blank=True, default='Untitled design', max_length=200),
        ),
        migrations.AlterField(
            model_name='homedesign',
            name='slug',
            field=models.SlugField(blank=True, max_length=220, unique=True),
        ),
        migrations.AlterField(
            model_name='homedesign',
            name='price',
            field=models.CharField(blank=True, help_text='Display price e.g. $435,000', max_length=50),
        ),
    ]
