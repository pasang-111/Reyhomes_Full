from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0003_inclusion_pdf"),
    ]

    operations = [
        migrations.AddField(
            model_name="inclusion",
            name="tier",
            field=models.CharField(
                choices=[
                    ("standard", "Standard"),
                    ("signature", "Signature"),
                    ("atelier", "Atelier"),
                ],
                default="standard",
                help_text="Collection: Standard · Signature · Atelier",
                max_length=20,
            ),
        ),
    ]
