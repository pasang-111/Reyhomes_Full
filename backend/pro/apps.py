from django.apps import AppConfig


class ProConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "pro"

    def ready(self):
        import pro.signals  # noqa: F401
