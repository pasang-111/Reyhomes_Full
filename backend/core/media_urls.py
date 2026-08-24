"""Helpers for absolute media URLs that work with local disk and S3."""


def absolute_media_url(request, url: str | None) -> str | None:
    """Return a usable absolute URL for a FileField/ImageField .url value.

    - If *url* is already absolute (http/https) — e.g. S3 — return as-is.
    - Otherwise build an absolute URI from the current request (local media).
    """
    if not url:
        return None
    if url.startswith(("http://", "https://")):
        return url
    if request is not None:
        return request.build_absolute_uri(url)
    return url
