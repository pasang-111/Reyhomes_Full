from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from core.media_urls import absolute_media_url
from core.review_pdf import build_review_pdf, inclusion_payload_from_link
from django.http import HttpResponse
from django.core.cache import cache
from .models import Estate, HomeLandPackage, PackageGallery
from .serializers import (
    EstateSerializer,
    HomeLandPackageListSerializer,
    HomeLandPackageDetailSerializer,
    HomeLandPackageWriteSerializer,
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


class EstateViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    serializer_class = EstateSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Estate.objects.all()
        if self.action in ("list", "retrieve") and not getattr(self.request.user, "is_staff", False):
            qs = qs.filter(published=True)
        return qs


class HomeLandPackageViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = {
        "category": ["exact"], "bedrooms": ["exact", "gte", "lte"],
        "bathrooms": ["exact", "gte"], "garage": ["exact", "gte"],
        "featured": ["exact"], "state": ["exact"], "estate__slug": ["exact"],
        "published": ["exact"],
    }
    search_fields = ["title", "description", "suburb", "estate__name", "slug"]
    ordering_fields = ["price_value", "bedrooms", "created_at", "title"]
    ordering = ["-featured", "title"]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        # Public catalogue + design pack PDF (no login required) — intentional.
        # Do not gate review / review_pdf; marketing share links depend on AllowAny.
        if self.action in ("list", "retrieve", "review", "review_pdf"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = HomeLandPackage.objects.select_related("estate").prefetch_related(
            "gallery_images", "features"
        )
        if self.action in ("list", "retrieve") and not getattr(self.request.user, "is_staff", False):
            qs = qs.filter(published=True)
        min_price = self.request.query_params.get("minPrice")
        max_price = self.request.query_params.get("maxPrice")
        if min_price:
            qs = qs.filter(price_value__gte=min_price)
        if max_price:
            qs = qs.filter(price_value__lte=max_price)
        estate = self.request.query_params.get("estate")
        if estate:
            qs = qs.filter(estate__name__icontains=estate) | qs.filter(estate__slug=estate)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return HomeLandPackageListSerializer
        if self.action in ("create", "update", "partial_update"):
            return HomeLandPackageWriteSerializer
        return HomeLandPackageDetailSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def upload_gallery(self, request, slug=None):
        package = self.get_object()
        files = request.FILES.getlist("images") or (
            [request.FILES["image"]] if "image" in request.FILES else []
        )
        if not files:
            return Response({"detail": "No images provided."}, status=status.HTTP_400_BAD_REQUEST)
        created = []
        base_order = package.gallery_images.count()
        for i, f in enumerate(files):
            obj = PackageGallery.objects.create(
                package=package, image=f,
                alt_text=request.data.get("alt_text", ""), order=base_order + i,
            )
            created.append({
                "id": obj.id,
                "image_url": absolute_media_url(request, obj.image.url),
                "order": obj.order,
            })
        return Response(created, status=status.HTTP_201_CREATED)

    def _review_inclusions(self, package):
        links = package.inclusion_links.select_related("inclusion").order_by("order", "id")
        return [inclusion_payload_from_link(link, self.request) for link in links]

    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="review")
    def review(self, request, slug=None):
        limited = _rate_limit_ip(request, "review_json_rate", limit=120, window=60)
        if limited is not None:
            return limited
        package = self.get_object()
        inclusions = self._review_inclusions(package)
        floor_plan_url = None
        if package.floor_plan:
            floor_plan_url = absolute_media_url(request, package.floor_plan.url)
        from django.core.signing import TimestampSigner
        signer = TimestampSigner(salt="reyhomes-review")
        token = signer.sign(f"package:{package.slug}")
        return Response(
            {
                "kind": "package",
                "slug": package.slug,
                "title": package.title,
                "subtitle": getattr(package, "subtitle", "") or "",
                "floor_plan_url": floor_plan_url,
                "inclusions": [
                    {k: v for k, v in inc.items() if k not in ("image_field", "image_name", "updated")}
                    for inc in inclusions
                ],
                "share_token": token,
                "share_path": f"/review/{token}/",
                "pdf_url": f"/api/packages/{package.slug}/review-pdf/",
            }
        )

    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="review-pdf")
    def review_pdf(self, request, slug=None):
        # Align with homes: 120/min per IP
        limited = _rate_limit_ip(request, "review_pdf_rate", limit=120, window=60)
        if limited is not None:
            return limited

        package = self.get_object()
        inclusions = self._review_inclusions(package)
        _key, pdf_bytes = build_review_pdf(
            title=package.title,
            subtitle=getattr(package, "subtitle", "") or "",
            floor_plan_field=package.floor_plan,
            inclusions=inclusions,
            kind="package",
            slug=package.slug,
        )
        resp = HttpResponse(pdf_bytes, content_type="application/pdf")
        resp["Content-Disposition"] = f'inline; filename="{package.slug}-review.pdf"'
        resp["Cache-Control"] = "public, max-age=3600"
        return resp

