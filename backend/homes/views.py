from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.media_urls import absolute_media_url
from core.review_pdf import build_review_pdf, inclusion_payload_from_link
from django.http import HttpResponse
from django.core.signing import TimestampSigner, BadSignature, SignatureExpired
from django.core.cache import cache
from .models import HomeDesign, HomeDesignGallery
from .serializers import (
    HomeDesignListSerializer,
    HomeDesignDetailSerializer,
    HomeDesignWriteSerializer,
)


def _rate_limit_ip(request, key_prefix: str, limit: int = 120, window: int = 60):
    """Per-IP rate limit via Django cache. Returns Response on exceed, else None."""
    ip = request.META.get("REMOTE_ADDR", "unknown")
    cache_key = f"{key_prefix}:{ip}"
    hits = cache.get(cache_key, 0)
    if hits >= limit:
        return Response(
            {"detail": "Too many requests. Try again shortly."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    cache.set(cache_key, hits + 1, window)
    return None


class HomeDesignViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        "category": ["exact"],
        "bedrooms": ["exact", "gte", "lte"],
        "bathrooms": ["exact", "gte"],
        "garage": ["exact", "gte"],
        "featured": ["exact"],
        "state": ["exact"],
        "status": ["exact"],
        "published": ["exact"],
    }
    search_fields = ["title", "subtitle", "description", "suburb", "slug"]
    ordering_fields = ["price_value", "bedrooms", "house_size", "created_at", "title"]
    ordering = ["-featured", "title"]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        # Public catalogue + design pack PDF (no login required)
        if self.action in ("list", "retrieve", "review", "review_pdf"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = HomeDesign.objects.all().prefetch_related("gallery_images", "features", "inclusion_links__inclusion", "related_designs")
        if self.action in ("list", "retrieve") and not (
            getattr(self.request.user, "is_staff", False)
        ):
            qs = qs.filter(published=True)
        min_price = self.request.query_params.get("minPrice")
        max_price = self.request.query_params.get("maxPrice")
        if min_price:
            qs = qs.filter(price_value__gte=min_price)
        if max_price:
            qs = qs.filter(price_value__lte=max_price)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return HomeDesignListSerializer
        if self.action in ("create", "update", "partial_update"):
            return HomeDesignWriteSerializer
        return HomeDesignDetailSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def upload_gallery(self, request, slug=None):
        design = self.get_object()
        files = request.FILES.getlist("images") or (
            [request.FILES["image"]] if "image" in request.FILES else []
        )
        if not files:
            return Response({"detail": "No images provided."}, status=status.HTTP_400_BAD_REQUEST)
        created = []
        base_order = design.gallery_images.count()
        for i, f in enumerate(files):
            obj = HomeDesignGallery.objects.create(
                home_design=design, image=f,
                alt_text=request.data.get("alt_text", ""), order=base_order + i,
            )
            created.append({
                "id": obj.id,
                "image_url": absolute_media_url(request, obj.image.url),
                "order": obj.order,
            })
        return Response(created, status=status.HTTP_201_CREATED)

    def _review_inclusions(self, design):
        links = design.inclusion_links.select_related("inclusion").order_by("order", "id")
        return [inclusion_payload_from_link(link, self.request) for link in links]

    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="review")
    def review(self, request, slug=None):
        # Same per-IP limit as review_pdf (public catalogue; throttle abuse)
        limited = _rate_limit_ip(request, "review_json_rate", limit=120, window=60)
        if limited is not None:
            return limited
        design = self.get_object()
        inclusions = self._review_inclusions(design)
        floor_plan_url = None
        if design.floor_plan:
            floor_plan_url = absolute_media_url(request, design.floor_plan.url)
        signer = TimestampSigner(salt="reyhomes-review")
        token = signer.sign(f"design:{design.slug}")
        share_path = f"/review/{token}/"
        return Response(
            {
                "kind": "design",
                "slug": design.slug,
                "title": design.title,
                "subtitle": design.subtitle,
                "floor_plan_url": floor_plan_url,
                "inclusions": [
                    {k: v for k, v in inc.items() if k not in ("image_field", "image_name", "updated")}
                    for inc in inclusions
                ],
                "share_token": token,
                "share_path": share_path,
                "pdf_url": f"/api/designs/{design.slug}/review-pdf/",
            }
        )

    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="review-pdf")
    def review_pdf(self, request, slug=None):
        limited = _rate_limit_ip(request, "review_pdf_rate", limit=120, window=60)
        if limited is not None:
            return limited

        design = self.get_object()
        inclusions = self._review_inclusions(design)
        _key, pdf_bytes = build_review_pdf(
            title=design.title,
            subtitle=design.subtitle or design.category,
            floor_plan_field=design.floor_plan,
            inclusions=inclusions,
            kind="design",
            slug=design.slug,
        )
        resp = HttpResponse(pdf_bytes, content_type="application/pdf")
        resp["Content-Disposition"] = f'inline; filename="{design.slug}-review.pdf"'
        resp["Access-Control-Allow-Origin"] = "*"
        # Allow embedding in the public site PDF dialog (same-origin iframe)
        resp["Cache-Control"] = "public, max-age=300"
        return resp

