"""
Fetch *real* photography for seed/demo data instead of generated placeholders.

Fallback chain per image (never hard-fails the seed run):
    1. Unsplash API  (needs UNSPLASH_ACCESS_KEY — real, curated, on-topic photos)
    2. Picsum Photos (no key needed — random but stable, always works)
    3. Local generated placeholder (last resort — no internet at all)

YouTube: given any watch/embed/share URL, resolve the thumbnail Google
already hosts at img.youtube.com — nothing is downloaded from YouTube
itself and no video is re-hosted, mirroring the "don't rehost footage"
approach already used in seed_testimonials.py.
"""
from __future__ import annotations

import random
import re
from urllib.parse import urlparse, parse_qs

import requests

from ._gen_placeholder import make_placeholder

UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos"
REQUEST_TIMEOUT = 12


def _unsplash_bytes(query: str, width: int, height: int, access_key: str) -> bytes | None:
    if not access_key:
        return None
    try:
        resp = requests.get(
            UNSPLASH_SEARCH_URL,
            params={"query": query, "per_page": 30, "orientation": "landscape" if width >= height else "portrait"},
            headers={"Authorization": f"Client-ID {access_key}"},
            timeout=REQUEST_TIMEOUT,
        )
        if resp.status_code != 200:
            return None
        results = resp.json().get("results") or []
        if not results:
            return None
        photo = random.choice(results)
        raw_url = photo["urls"]["raw"]
        img_resp = requests.get(
            raw_url,
            params={"w": width, "h": height, "fit": "crop", "crop": "entropy", "q": 80},
            timeout=REQUEST_TIMEOUT,
        )
        if img_resp.status_code != 200:
            return None
        return img_resp.content
    except (requests.RequestException, KeyError, ValueError, IndexError):
        return None


def _picsum_bytes(seed: str, width: int, height: int) -> bytes | None:
    try:
        safe_seed = re.sub(r"[^a-zA-Z0-9\-]", "-", seed)[:60]
        resp = requests.get(
            f"https://picsum.photos/seed/{safe_seed}/{width}/{height}",
            timeout=REQUEST_TIMEOUT,
        )
        if resp.status_code == 200:
            return resp.content
    except requests.RequestException:
        pass
    return None


def fetch_photo(query: str, seed: str, width: int, height: int, access_key: str, label: str) -> bytes:
    """Best real photo available for `query`; always returns *something*."""
    data = _unsplash_bytes(query, width, height, access_key)
    if data:
        return data
    data = _picsum_bytes(seed, width, height)
    if data:
        return data
    return make_placeholder(label[:32], size=(width, height), seed=seed)


_YOUTUBE_ID_RE = re.compile(r"(?:youtu\.be/|youtube\.com/(?:embed/|shorts/|watch\?v=))([A-Za-z0-9_-]{11})")


def extract_youtube_id(url: str) -> str | None:
    if not url:
        return None
    match = _YOUTUBE_ID_RE.search(url)
    if match:
        return match.group(1)
    # Fallback: watch?v= with extra query params in a different order
    parsed = urlparse(url)
    if "youtube.com" in parsed.netloc:
        qs = parse_qs(parsed.query)
        if "v" in qs and qs["v"]:
            return qs["v"][0]
    return None


def fetch_youtube_thumbnail(video_url: str) -> bytes | None:
    """Google-hosted thumbnail for a YouTube video — no footage is downloaded."""
    video_id = extract_youtube_id(video_url)
    if not video_id:
        return None
    for variant in ("maxresdefault.jpg", "hqdefault.jpg", "mqdefault.jpg"):
        try:
            resp = requests.get(
                f"https://img.youtube.com/vi/{video_id}/{variant}",
                timeout=REQUEST_TIMEOUT,
            )
            # YouTube returns a tiny placeholder GIF-as-jpg (120x90, ~1-2KB)
            # for resolutions that don't exist for a given video.
            if resp.status_code == 200 and len(resp.content) > 2000:
                return resp.content
        except requests.RequestException:
            continue
    return None
