from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Project, ProjectGallery
from core.media_urls import absolute_media_url
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectWriteSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["status", "featured", "category", "published"]
    search_fields = ["title", "location", "description", "slug"]
    ordering_fields = ["created_at", "title", "status"]
    ordering = ["-featured", "-created_at"]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_permissions(self):
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = Project.objects.prefetch_related("gallery_images", "features")
        if self.action in ("list", "retrieve") and not getattr(
            self.request.user, "is_staff", False
        ):
            qs = qs.filter(published=True)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ProjectListSerializer
        if self.action in ("create", "update", "partial_update"):
            return ProjectWriteSerializer
        return ProjectDetailSerializer

    @action(detail=True, methods=["post"], permission_classes=[IsAdminUser])
    def upload_gallery(self, request, slug=None):
        project = self.get_object()
        files = request.FILES.getlist("images") or (
            [request.FILES["image"]] if "image" in request.FILES else []
        )
        if not files:
            return Response({"detail": "No images provided."}, status=status.HTTP_400_BAD_REQUEST)
        created = []
        base_order = project.gallery_images.count()
        for i, f in enumerate(files):
            obj = ProjectGallery.objects.create(
                project=project,
                image=f,
                alt_text=request.data.get("alt_text", ""),
                order=base_order + i,
            )
            created.append({
                "id": obj.id,
                "image_url": absolute_media_url(request, obj.image.url),
                "order": obj.order,
            })
        return Response(created, status=status.HTTP_201_CREATED)
