from django import forms
from django.forms import widgets


class LinesToListWidget(widgets.Textarea):
    """Renders a JSON list as plain text (one item per line)."""

    def __init__(self, attrs=None):
        default = {
            "rows": 6,
            "cols": 60,
            "placeholder": "One item per line\nExample item\nAnother item",
            "style": "font-family: monospace; font-size: 13px;",
        }
        if attrs:
            default.update(attrs)
        super().__init__(default)

    def format_value(self, value):
        if value is None or value == "" or value == []:
            return ""
        if isinstance(value, list):
            return "\n".join(str(v).strip() for v in value if str(v).strip())
        return str(value) if value else ""


class LinesToListField(forms.CharField):
    """Form field that accepts one item per line and stores a Python list."""

    widget = LinesToListWidget

    def __init__(self, *args, **kwargs):
        kwargs.setdefault("required", False)
        kwargs.setdefault(
            "help_text",
            "Enter one item per line. Leave blank if none. No JSON brackets needed.",
        )
        super().__init__(*args, **kwargs)

    def to_python(self, value):
        if value is None or not str(value).strip():
            return []
        return [line.strip() for line in str(value).splitlines() if line.strip()]

    def prepare_value(self, value):
        if value is None or value == []:
            return ""
        if isinstance(value, list):
            return "\n".join(str(v).strip() for v in value if str(v).strip())
        return value or ""
