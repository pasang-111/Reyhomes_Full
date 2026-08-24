# Generated manually — makes HeroSlide.title, Inclusion.title, and
# Testimonial.name optional so staff can save a draft without the CMS
# blocking on required-field errors.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_inclusion_tier'),
    ]

    operations = [
        migrations.AlterField(
            model_name='heroslide',
            name='title',
            field=models.CharField(blank=True, default='Untitled slide', max_length=200),
        ),
        migrations.AlterField(
            model_name='inclusion',
            name='title',
            field=models.CharField(blank=True, default='Untitled inclusion', max_length=200),
        ),
        migrations.AlterField(
            model_name='testimonial',
            name='name',
            field=models.CharField(blank=True, default='Anonymous', max_length=150),
        ),
    ]
