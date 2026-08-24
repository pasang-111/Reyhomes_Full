"""
Data migration: convert legacy HomeDesign.inclusion_list / related_slugs string
lists into real FK relations (DesignInclusion / related_designs).

For every string that doesn't match an existing core.Inclusion.title
(case-insensitive) or HomeDesign.slug, we log it instead of silently
dropping it, so staff can reconcile it manually (e.g. create the missing
Inclusion record). The report is written to the migration's stdout via
`print`, which `manage.py migrate` surfaces in the console, and also
collected on the migration state for optional later inspection.
"""
from django.db import migrations


def migrate_inclusions_and_related(apps, schema_editor):
    HomeDesign = apps.get_model('homes', 'HomeDesign')
    DesignInclusion = apps.get_model('homes', 'DesignInclusion')
    Inclusion = apps.get_model('core', 'Inclusion')

    inclusion_by_title = {i.title.strip().lower(): i for i in Inclusion.objects.all()}
    slug_to_design = {d.slug: d for d in HomeDesign.objects.all()}

    unmatched_inclusions = []
    unmatched_related = []

    for design in HomeDesign.objects.all():
        # --- inclusion_list -> DesignInclusion ---
        order = 0
        for raw in (design.inclusion_list or []):
            title = str(raw).strip()
            if not title:
                continue
            match = inclusion_by_title.get(title.lower())
            if match:
                DesignInclusion.objects.get_or_create(
                    home_design=design, inclusion=match, defaults={'order': order}
                )
                order += 1
            else:
                unmatched_inclusions.append((design.slug, title))

        # --- related_slugs -> related_designs M2M ---
        for raw_slug in (design.related_slugs or []):
            target_slug = str(raw_slug).strip()
            if not target_slug:
                continue
            target = slug_to_design.get(target_slug)
            if target and target.pk != design.pk:
                design.related_designs.add(target)
            else:
                unmatched_related.append((design.slug, target_slug))

    if unmatched_inclusions:
        print(
            "\n[homes.0003] WARNING: %d HomeDesign.inclusion_list string(s) had no "
            "matching core.Inclusion.title and were NOT linked. Reconcile manually:"
            % len(unmatched_inclusions)
        )
        for design_slug, title in unmatched_inclusions:
            print(f"    design='{design_slug}' inclusion_title='{title}'")

    if unmatched_related:
        print(
            "\n[homes.0003] WARNING: %d HomeDesign.related_slugs entr(y/ies) had no "
            "matching HomeDesign.slug and were NOT linked. Reconcile manually:"
            % len(unmatched_related)
        )
        for design_slug, target_slug in unmatched_related:
            print(f"    design='{design_slug}' related_slug='{target_slug}'")


def noop_reverse(apps, schema_editor):
    # Intentionally not reversible: reversing would require deciding whether to
    # delete DesignInclusion/related_designs rows created since, which risks
    # destroying legitimate post-migration data. inclusion_list/related_slugs
    # are left untouched by this migration (still deprecated fallback fields),
    # so no data is lost by leaving this a no-op.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('homes', '0002_designinclusion_relateddesigns'),
        ('core', '0003_inclusion_pdf'),
    ]

    operations = [
        migrations.RunPython(migrate_inclusions_and_related, noop_reverse),
    ]
