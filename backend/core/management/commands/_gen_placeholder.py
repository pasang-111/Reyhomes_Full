"""Generate on-brand placeholder JPGs for seed data (cross-platform fonts)."""
from __future__ import annotations

import io
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter

NAVY = (11, 18, 39)
NAVY_DEEP = (7, 8, 10)
SILVER = (197, 202, 211)
SILVER_LIGHT = (238, 240, 243)

# Linux / macOS / common local installs — first existing path wins.
_FONT_CANDIDATES = {
    "display": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
        "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/System/Library/Fonts/NewYork.ttf",
        "/Library/Fonts/Georgia.ttf",
        "/Library/Fonts/Times New Roman.ttf",
    ],
    "sans": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ],
    "sans_bold": [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf",
        "/Library/Fonts/Arial.ttf",
    ],
}

_font_cache: dict[str, str | None] = {}


def _resolve_font_path(kind: str) -> str | None:
    if kind in _font_cache:
        return _font_cache[kind]
    for path in _FONT_CANDIDATES.get(kind, []):
        if Path(path).is_file():
            _font_cache[kind] = path
            return path
    _font_cache[kind] = None
    return None


def _font(kind: str, size: int):
    """Load a TrueType font when available; otherwise PIL default (no crash)."""
    path = _resolve_font_path(kind)
    if path:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            pass
    # Bitmap default cannot take size on older Pillow; try load_default(size=)
    try:
        return ImageFont.load_default(size=max(10, size // 2))
    except TypeError:
        return ImageFont.load_default()


def _vertical_gradient(size, top, bottom):
    w, h = size
    base = Image.new("RGB", (1, h), 0)
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        base.putpixel((0, y), (r, g, b))
    return base.resize((w, h))


def make_placeholder(label, subtitle="", size=(1600, 1000), seed=None):
    """Returns raw JPEG bytes: navy gradient + soft orbs + label."""
    rng = random.Random(seed or label)
    img = _vertical_gradient(size, NAVY_DEEP, NAVY).convert("RGB")

    orb_layer = Image.new("RGB", size, NAVY)
    draw = ImageDraw.Draw(orb_layer)
    for _ in range(3):
        r = rng.randint(int(size[0] * 0.18), int(size[0] * 0.32))
        cx = rng.randint(0, size[0])
        cy = rng.randint(0, size[1])
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=SILVER)
    orb_layer = orb_layer.filter(ImageFilter.GaussianBlur(90))
    img = Image.blend(img, orb_layer, alpha=0.16)

    draw = ImageDraw.Draw(img)

    margin = int(size[1] * 0.035)
    draw.rectangle(
        [margin, margin, size[0] - margin, size[1] - margin],
        outline=(*SILVER, 255)[:3],
        width=2,
    )

    f_display = _font("display", int(size[1] * 0.11))
    f_kicker = _font("sans_bold", int(size[1] * 0.032))

    pad = int(size[1] * 0.09)
    # Prefer anchor= when available; fall back for default bitmap fonts
    try:
        draw.text(
            (pad, size[1] - pad - int(size[1] * 0.03)),
            "REY HOMES",
            font=f_kicker,
            fill=SILVER,
            anchor="ls",
        )
        draw.text(
            (pad, size[1] - pad - int(size[1] * 0.14)),
            label,
            font=f_display,
            fill=SILVER_LIGHT,
            anchor="ls",
        )
        if subtitle:
            f_sub = _font("sans", int(size[1] * 0.028))
            draw.text(
                (pad, size[1] - pad),
                subtitle,
                font=f_sub,
                fill=SILVER,
                anchor="ls",
            )
    except TypeError:
        y = size[1] - pad - int(size[1] * 0.18)
        draw.text((pad, y), "REY HOMES", font=f_kicker, fill=SILVER)
        draw.text((pad, y + 28), label, font=f_display, fill=SILVER_LIGHT)
        if subtitle:
            draw.text((pad, y + 56), subtitle, font=_font("sans", 14), fill=SILVER)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=87)
    buf.seek(0)
    return buf.read()