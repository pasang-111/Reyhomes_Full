"""
Input sanitization for ReyHomes.

- InputSanitizationMiddleware: cleans query strings and form bodies
  (null bytes, control chars, dangerous script patterns). File fields untouched.
- SanitizedJSONParser: same rules for DRF JSON bodies.

Passwords/tokens only have null bytes stripped.
Short identity fields also run through strip_tags.
"""

from __future__ import annotations

import re
from typing import Any

from django.http import QueryDict
from django.utils.encoding import force_str
from django.utils.html import strip_tags

_CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_SCRIPT_RE = re.compile(
    r"<\s*/?\s*script\b[^>]*>|"
    r"javascript\s*:|"
    r"vbscript\s*:|"
    r"on(?:error|load|click|mouseover|focus|blur|submit|input)\s*=",
    re.IGNORECASE,
)

SKIP_KEYS = frozenset({
    "password", "password1", "password2", "old_password", "new_password",
    "token", "access", "refresh", "csrfmiddlewaretoken",
})

STRIP_HTML_KEYS = frozenset({
    "title", "name", "first_name", "last_name", "email", "phone",
    "subject", "suburb", "state", "slug", "category", "status", "badge",
    "button_text", "button_link",
})


def sanitize_string(value: str, *, strip_html: bool = False) -> str:
    if not value:
        return value
    value = force_str(value)
    value = value.replace("\x00", "")
    value = _CONTROL_RE.sub("", value)
    if strip_html:
        value = strip_tags(value)
    value = _SCRIPT_RE.sub("", value)
    return value.strip() if strip_html else value


def sanitize_value(value: Any, key: str | None = None) -> Any:
    if value is None:
        return None
    key_l = (key or "").lower()
    if key_l in SKIP_KEYS:
        if isinstance(value, str):
            return value.replace("\x00", "")
        return value
    if isinstance(value, str):
        return sanitize_string(value, strip_html=key_l in STRIP_HTML_KEYS)
    if isinstance(value, list):
        return [sanitize_value(v, key) for v in value]
    if isinstance(value, dict):
        return {k: sanitize_value(v, str(k)) for k, v in value.items()}
    return value


def sanitize_querydict(qd: QueryDict) -> QueryDict:
    if qd is None:
        return qd
    clean = QueryDict(mutable=True)
    for key in qd.keys():
        key_s = force_str(key)
        for v in qd.getlist(key):
            if isinstance(v, (str, bytes)):
                clean.appendlist(key_s, sanitize_value(force_str(v), key_s))
            else:
                clean.appendlist(key_s, v)
    clean._mutable = False
    return clean


class InputSanitizationMiddleware:
    """Sanitize GET and form POST. JSON is handled by SanitizedJSONParser."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            if request.GET:
                request.GET = sanitize_querydict(request.GET)
        except Exception:
            pass
        try:
            if request.method in ("POST", "PUT", "PATCH") and getattr(request, "POST", None):
                request.POST = sanitize_querydict(request.POST)
        except Exception:
            pass
        return self.get_response(request)


try:
    from rest_framework.parsers import JSONParser

    class SanitizedJSONParser(JSONParser):
        """JSON parser that runs sanitize_value on the decoded payload."""

        def parse(self, stream, media_type=None, parser_context=None):
            data = super().parse(
                stream, media_type=media_type, parser_context=parser_context
            )
            return sanitize_value(data)

except ImportError:  # pragma: no cover
    SanitizedJSONParser = None  # type: ignore
