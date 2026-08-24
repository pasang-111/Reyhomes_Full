from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from homes.models import HomeDesign
from land.models import HomeLandPackage
from core.media_urls import absolute_media_url
from core.review_pdf import inclusion_payload_from_link


class PublicReviewByTokenView(APIView):
    """Public read-only review resolved from a signed, expiring token."""

    permission_classes = [AllowAny]
    # 14 days
    MAX_AGE = 60 * 60 * 24 * 14

    def get(self, request, token: str):
        signer = TimestampSigner(salt="reyhomes-review")
        try:
            value = signer.unsign(token, max_age=self.MAX_AGE)
        except SignatureExpired:
            return Response({"detail": "This share link has expired."}, status=410)
        except BadSignature:
            return Response({"detail": "Invalid share link."}, status=400)

        if ":" not in value:
            return Response({"detail": "Invalid share link."}, status=400)
        kind, slug = value.split(":", 1)

        if kind == "design":
            obj = HomeDesign.objects.filter(slug=slug, published=True).first()
            if not obj:
                return Response({"detail": "Not found."}, status=404)
            links = obj.inclusion_links.select_related("inclusion").order_by("order", "id")
            floor_plan_url = absolute_media_url(request, obj.floor_plan.url) if obj.floor_plan else None
            title, subtitle = obj.title, obj.subtitle
            pdf_url = f"/api/designs/{obj.slug}/review-pdf/"
        elif kind == "package":
            obj = HomeLandPackage.objects.filter(slug=slug, published=True).first()
            if not obj:
                return Response({"detail": "Not found."}, status=404)
            links = obj.inclusion_links.select_related("inclusion").order_by("order", "id")
            floor_plan_url = absolute_media_url(request, obj.floor_plan.url) if obj.floor_plan else None
            title = obj.title
            subtitle = getattr(obj, "subtitle", "") or ""
            pdf_url = f"/api/packages/{obj.slug}/review-pdf/"
        else:
            return Response({"detail": "Invalid share link."}, status=400)

        inclusions = [
            {k: v for k, v in inclusion_payload_from_link(link, request).items()
             if k not in ("image_field", "image_name", "updated")}
            for link in links
        ]
        return Response(
            {
                "kind": kind,
                "slug": slug,
                "title": title,
                "subtitle": subtitle,
                "floor_plan_url": floor_plan_url,
                "inclusions": inclusions,
                "pdf_url": pdf_url,
            }
        )
