from rest_framework import generics, viewsets, parsers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.decorators import action

from .models import HeroSlide, Inclusion, Testimonial, SiteSetting
from .serializers import (
    HeroSlideSerializer,
    InclusionSerializer,
    InclusionWriteSerializer,
    TestimonialSerializer,
    TestimonialWriteSerializer,
    SiteSettingSerializer,
)


class HeroSlideViewSet(viewsets.ModelViewSet):
    """Public list of active slides; full CRUD for staff."""
    serializer_class = HeroSlideSerializer
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    ordering = ["order"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = HeroSlide.objects.all().order_by("order")
        if self.action in ("list", "retrieve") and not getattr(
            self.request.user, "is_staff", False
        ):
            qs = qs.filter(active=True)
        return qs


class InclusionViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filterset_fields = ["category", "featured", "published"]
    search_fields = ["title", "description"]
    ordering = ["order", "title"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Inclusion.objects.all()
        if self.action in ("list", "retrieve") and not getattr(
            self.request.user, "is_staff", False
        ):
            qs = qs.filter(published=True)
        return qs.order_by("order", "title")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return InclusionWriteSerializer
        return InclusionSerializer


class TestimonialViewSet(viewsets.ModelViewSet):
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filterset_fields = ["featured", "published", "rating"]
    search_fields = ["name", "review", "suburb", "design"]
    ordering = ["-featured", "-created_at"]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Testimonial.objects.all()
        if self.action in ("list", "retrieve") and not getattr(
            self.request.user, "is_staff", False
        ):
            qs = qs.filter(published=True)
            if self.request.query_params.get("featured") == "true":
                qs = qs.filter(featured=True)
        return qs

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return TestimonialWriteSerializer
        return TestimonialSerializer


# Keep simple list aliases for backward compatibility
class HeroSlideListView(generics.ListAPIView):
    serializer_class = HeroSlideSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return HeroSlide.objects.filter(active=True).order_by("order")


class TestimonialListView(generics.ListAPIView):
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = Testimonial.objects.filter(published=True)
        if self.request.query_params.get("featured") == "true":
            qs = qs.filter(featured=True)
        return qs


class SiteSettingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings = SiteSetting.load()
        serializer = SiteSettingSerializer(settings, context={"request": request})
        return Response(serializer.data)

    def put(self, request):
        if not request.user.is_staff:
            return Response({"detail": "Staff access required."}, status=status.HTTP_403_FORBIDDEN)
        settings = SiteSetting.load()
        # Allow partial updates of non-file fields + optional files
        for field in ("company_name", "phone", "email", "address",
                      "instagram", "facebook", "youtube", "linkedin"):
            if field in request.data:
                setattr(settings, field, request.data.get(field) or "")
        if "logo" in request.FILES:
            settings.logo = request.FILES["logo"]
        if "footer_logo" in request.FILES:
            settings.footer_logo = request.FILES["footer_logo"]
        settings.save()
        serializer = SiteSettingSerializer(settings, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        return self.put(request)


# ── Search analytics ──────────────────────────────────────────────
import hashlib
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import SearchEvent


def _client_ip(request) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR") or "unknown"


@api_view(["POST"])
@permission_classes([AllowAny])
def search_event_create(request):
    """Record a search query or result click. Soft rate limit 60/min/IP."""
    ip = _client_ip(request)
    key = f"search_analytics:{ip}"
    hits = cache.get(key, 0)
    if hits >= 60:
        return Response({"detail": "Rate limited"}, status=status.HTTP_429_TOO_MANY_REQUESTS)
    cache.set(key, hits + 1, 60)

    data = request.data if isinstance(request.data, dict) else {}
    query = str(data.get("query") or "").strip()[:200]
    if not query:
        return Response({"detail": "query required"}, status=status.HTTP_400_BAD_REQUEST)

    event_type = data.get("event_type") or SearchEvent.EventType.QUERY
    if event_type not in (SearchEvent.EventType.QUERY, SearchEvent.EventType.CLICK):
        event_type = SearchEvent.EventType.QUERY

    ip_hash = hashlib.sha256(ip.encode()).hexdigest()[:32]
    ua = (request.META.get("HTTP_USER_AGENT") or "")[:255]

    SearchEvent.objects.create(
        event_type=event_type,
        query=query,
        result_type=str(data.get("result_type") or "")[:32],
        result_id=str(data.get("result_id") or "")[:64],
        result_label=str(data.get("result_label") or "")[:200],
        result_count=int(data.get("result_count") or 0),
        path=str(data.get("path") or "")[:200],
        ip_hash=ip_hash,
        user_agent=ua,
    )
    return Response({"ok": True}, status=status.HTTP_201_CREATED)
