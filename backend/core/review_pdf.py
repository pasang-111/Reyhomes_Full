"""Generate a combined floorplan + inclusions review PDF."""
from __future__ import annotations

import hashlib
import io
from pathlib import Path
from typing import Any, Iterable

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas


PAGE = A4
MARGIN = 18 * mm


def _cache_key(kind: str, slug: str, fingerprint: str) -> str:
    return f"reviews/{kind}/{slug}-{fingerprint[:16]}.pdf"


def _fingerprint(parts: Iterable[str]) -> str:
    h = hashlib.sha256()
    for p in parts:
        h.update((p or "").encode("utf-8", errors="ignore"))
        h.update(b"\0")
    return h.hexdigest()


def _draw_wrapped(c: canvas.Canvas, text: str, x: float, y: float, max_width: float, font="Helvetica", size=11, leading=14):
    c.setFont(font, size)
    words = (text or "").split()
    line = []
    for w in words:
        trial = " ".join(line + [w])
        if c.stringWidth(trial, font, size) <= max_width:
            line.append(w)
        else:
            if line:
                c.drawString(x, y, " ".join(line))
                y -= leading
            line = [w]
    if line:
        c.drawString(x, y, " ".join(line))
        y -= leading
    return y


def _try_image(field) -> ImageReader | None:
    if not field:
        return None
    try:
        field.open("rb")
        data = field.read()
        field.close()
        return ImageReader(io.BytesIO(data))
    except Exception:
        return None


def build_review_pdf(
    *,
    title: str,
    subtitle: str,
    floor_plan_field,
    inclusions: list[dict[str, Any]],
    kind: str,
    slug: str,
) -> tuple[str, bytes]:
    """
    Build (and cache) a multi-page PDF.
    Returns (storage_path_or_url_key, pdf_bytes).
    """
    fp_parts = [title, subtitle, str(getattr(floor_plan_field, "name", "") or "")]
    for inc in inclusions:
        fp_parts.extend(
            [
                str(inc.get("id", "")),
                str(inc.get("title", "")),
                str(inc.get("description", "")),
                str(inc.get("image_name", "")),
                str(inc.get("updated", "")),
            ]
        )
    fingerprint = _fingerprint(fp_parts)
    key = _cache_key(kind, slug, fingerprint)

    if default_storage.exists(key):
        with default_storage.open(key, "rb") as f:
            return key, f.read()

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=PAGE)
    width, height = PAGE
    navy = (0.04, 0.09, 0.16)  # #0A1628-ish
    cream = (0.97, 0.96, 0.94)
    brass = (0.85, 0.78, 0.64)  # #D8C7A4

    def _header_bar(page_title: str, page_sub: str = ""):
        c.setFillColorRGB(*navy)
        c.rect(0, height - 22 * mm, width, 22 * mm, fill=1, stroke=0)
        c.setFillColorRGB(*brass)
        c.rect(0, height - 22 * mm - 1.2, width, 1.2, fill=1, stroke=0)
        c.setFillColorRGB(*cream)
        c.setFont("Helvetica", 9)
        c.drawString(MARGIN, height - 10 * mm, "REYHOMES")
        c.setFont("Helvetica-Bold", 14)
        c.drawString(MARGIN, height - 16 * mm, (page_title or "Review")[:70])
        if page_sub:
            c.setFont("Helvetica", 9)
            c.setFillColorRGB(*brass)
            c.drawRightString(width - MARGIN, height - 12 * mm, page_sub[:50])

    def _footer(page_no: int, total: int):
        c.setStrokeColorRGB(*brass)
        c.setLineWidth(0.4)
        c.line(MARGIN, 12 * mm, width - MARGIN, 12 * mm)
        c.setFillColorRGB(0.35, 0.35, 0.35)
        c.setFont("Helvetica", 8)
        c.drawString(MARGIN, 7 * mm, "ReyHomes · Design pack (indicative)")
        c.drawRightString(width - MARGIN, 7 * mm, f"{page_no} / {total}")

    # Page budget: cover + one per inclusion (min 1)
    total_pages = 1 + max(len(inclusions), 0)
    page_no = 1

    # Cover / floorplan page
    _header_bar(title or "Design pack", (subtitle or kind or "").title())
    y_top = height - 28 * mm
    c.setFillColorRGB(0.2, 0.2, 0.2)
    c.setFont("Helvetica", 10)
    c.drawString(MARGIN, y_top, "Floor plan")
    c.setStrokeColorRGB(*brass)
    c.setLineWidth(0.6)
    c.line(MARGIN, y_top - 3, MARGIN + 40, y_top - 3)

    img = _try_image(floor_plan_field)
    if img:
        max_w = width - 2 * MARGIN
        max_h = height - 48 * mm
        iw, ih = img.getSize()
        scale = min(max_w / iw, max_h / ih)
        dw, dh = iw * scale, ih * scale
        c.drawImage(
            img,
            MARGIN + (max_w - dw) / 2,
            18 * mm,
            width=dw,
            height=dh,
            preserveAspectRatio=True,
            mask="auto",
        )
    else:
        c.setFillColorRGB(0.45, 0.45, 0.45)
        c.setFont("Helvetica", 11)
        c.drawCentredString(width / 2, height / 2, "Floor plan image not available.")
    _footer(page_no, total_pages)
    c.showPage()
    page_no += 1

    # One page per inclusion
    for inc in inclusions:
        _header_bar(inc.get("title") or "Inclusion", (inc.get("tier") or inc.get("category") or "").title())
        y = height - 30 * mm
        meta_bits = [b for b in [inc.get("category"), inc.get("tier")] if b]
        if meta_bits:
            c.setFillColorRGB(0.4, 0.35, 0.25)
            c.setFont("Helvetica", 9)
            c.drawString(MARGIN, y, " · ".join(str(b).title() for b in meta_bits))
            y -= 14

        img = _try_image(inc.get("image_field"))
        if img:
            max_w = width - 2 * MARGIN
            max_h = height * 0.38
            iw, ih = img.getSize()
            scale = min(max_w / iw, max_h / ih)
            dw, dh = iw * scale, ih * scale
            c.drawImage(
                img,
                MARGIN + (max_w - dw) / 2,
                y - dh - 6,
                width=dw,
                height=dh,
                preserveAspectRatio=True,
                mask="auto",
            )
            y = y - dh - 16

        desc = inc.get("description") or ""
        if desc:
            c.setFillColorRGB(0.15, 0.15, 0.15)
            y = _draw_wrapped(c, desc, MARGIN, y, width - 2 * MARGIN, size=11, leading=14)
            y -= 10

        features = inc.get("features") or []
        if features:
            c.setFillColorRGB(*navy)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(MARGIN, y, "Included")
            y -= 14
            c.setFillColorRGB(0.2, 0.2, 0.2)
            c.setFont("Helvetica", 10)
            for feat in features:
                if y < MARGIN + 18 * mm:
                    _footer(page_no, total_pages)
                    c.showPage()
                    page_no += 1
                    total_pages += 1
                    _header_bar(inc.get("title") or "Inclusion", "continued")
                    y = height - 30 * mm
                    c.setFillColorRGB(0.2, 0.2, 0.2)
                    c.setFont("Helvetica", 10)
                c.setFillColorRGB(*brass)
                c.circle(MARGIN + 3, y + 3, 1.6, fill=1, stroke=0)
                c.setFillColorRGB(0.2, 0.2, 0.2)
                c.drawString(MARGIN + 10, y, str(feat)[:90])
                y -= 13
        _footer(page_no, total_pages)
        c.showPage()
        page_no += 1

    c.save()
    pdf_bytes = buf.getvalue()
    default_storage.save(key, ContentFile(pdf_bytes))
    return key, pdf_bytes


def inclusion_payload_from_link(link, request=None) -> dict[str, Any]:
    """Build inclusion dict for PDF + JSON review from a DesignInclusion/PackageInclusion link."""
    from core.media_urls import absolute_media_url

    inc = link.inclusion
    image_url = None
    pdf_url = None
    if request is not None:
        if inc.image:
            image_url = absolute_media_url(request, inc.image.url)
        if getattr(inc, "pdf", None):
            pdf_url = absolute_media_url(request, inc.pdf.url)
    features = inc.features if isinstance(inc.features, list) else []
    # Public marketing payload only — never include supplier cost / internal pricing.
    return {
        "id": inc.id,
        "title": inc.title,
        "slug": inc.slug,
        "category": getattr(inc, "category", "") or "",
        "tier": getattr(inc, "tier", "") or "",
        "subtitle": getattr(inc, "subtitle", "") or "",
        "description": getattr(inc, "description", "") or "",
        "features": features,
        "image_url": image_url,
        "pdf_url": pdf_url,
        "image_field": inc.image if inc.image else None,
        "image_name": getattr(inc.image, "name", "") if inc.image else "",
        "updated": str(getattr(inc, "updated_at", "") or ""),
        "order": link.order,
    }
