# Generated manually — makes name/title, slug and price optional so staff
# can save an Estate or Home & Land Package as a draft without the CMS
# blocking on required-field errors. Both models' save() methods still
# auto-fill a unique slug (and a placeholder name/title) when left blank.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('land', '0003_migrate_inclusion_strings'),
    ]

    operations = [
        migrations.AlterField(
            model_name='estate',
            name='name',
            field=models.CharField(blank=True, default='Untitled estate', max_length=150),
        ),
        migrations.AlterField(
            model_name='estate',
            name='slug',
            field=models.SlugField(blank=True, max_length=170, unique=True),
        ),
        migrations.AlterField(
            model_name='homelandpackage',
            name='title',
            field=models.CharField(blank=True, default='Untitled package', max_length=200),
        ),
        migrations.AlterField(
            model_name='homelandpackage',
            name='slug',
            field=models.SlugField(blank=True, max_length=220, unique=True),
        ),
        migrations.AlterField(
            model_name='homelandpackage',
            name='price',
            field=models.CharField(blank=True, max_length=50),
        ),
    ]
