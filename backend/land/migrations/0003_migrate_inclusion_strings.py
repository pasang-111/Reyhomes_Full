"""
Data migration: convert legacy HomeLandPackage.inclusion_list string lists
into real FK relations (PackageInclusion), matching against core.Inclusion.title
case-insensitively. Unmatched strings are logged (not dropped) so staff can
create the missing Inclusion record and reconcile manually.
"""
from django.db import migrations


def migrate_inclusions(apps, schema_editor):
    HomeLandPackage = apps.get_model('land', 'HomeLandPackage')
    PackageInclusion = apps.get_model('land', 'PackageInclusion')
    Inclusion = apps.get_model('core', 'Inclusion')

    inclusion_by_title = {i.title.strip().lower(): i for i in Inclusion.objects.all()}
    unmatched = []

    for package in HomeLandPackage.objects.all():
        order = 0
        for raw in (package.inclusion_list or []):
            title = str(raw).strip()
            if not title:
                continue
            match = inclusion_by_title.get(title.lower())
            if match:
                PackageInclusion.objects.get_or_create(
                    package=package, inclusion=match, defaults={'order': order}
                )
                order += 1
            else:
                unmatched.append((package.slug, title))

    if unmatched:
        print(
            "\n[land.0003] WARNING: %d HomeLandPackage.inclusion_list string(s) had no "
            "matching core.Inclusion.title and were NOT linked. Reconcile manually:"
            % len(unmatched)
        )
        for package_slug, title in unmatched:
            print(f"    package='{package_slug}' inclusion_title='{title}'")


def noop_reverse(apps, schema_editor):
    # Not reversible for the same reason as homes.0003 — inclusion_list itself
    # is left untouched, so no data is lost by leaving this a no-op.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('land', '0002_packageinclusion'),
        ('core', '0003_inclusion_pdf'),
    ]

    operations = [
        migrations.RunPython(migrate_inclusions, noop_reverse),
    ]
