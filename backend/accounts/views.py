from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from homes.models import HomeDesign
from land.models import HomeLandPackage

from .models import UserProfile, WishlistItem
from .serializers import (
    AdminClientSerializer,
    AdminUserSerializer,
    WishlistCreateSerializer,
    WishlistItemSerializer,
)


class WishlistViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related(
            "home_design", "land_package"
        )
        serializer = WishlistItemSerializer(items, many=True, context={"request": request})
        return Response(serializer.data)

    def create(self, request):
        serializer = WishlistCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        design_id = serializer.validated_data.get("home_design_id")
        package_id = serializer.validated_data.get("land_package_id")

        if design_id:
            design = HomeDesign.objects.filter(id=design_id, published=True).first()
            if not design:
                return Response({"detail": "Design not found."}, status=status.HTTP_404_NOT_FOUND)
            item, _ = WishlistItem.objects.get_or_create(
                user=request.user, home_design=design, defaults={"land_package": None}
            )
        else:
            package = HomeLandPackage.objects.filter(id=package_id, published=True).first()
            if not package:
                return Response({"detail": "Package not found."}, status=status.HTTP_404_NOT_FOUND)
            item, _ = WishlistItem.objects.get_or_create(
                user=request.user, land_package=package, defaults={"home_design": None}
            )

        out = WishlistItemSerializer(item, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        item = WishlistItem.objects.filter(user=request.user, pk=pk).first()
        if not item:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminClientViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    def list(self, request):
        profiles = UserProfile.objects.select_related("user", "assigned_agent").order_by(
            "-updated_at"
        )
        return Response(AdminClientSerializer(profiles, many=True).data)

    def partial_update(self, request, pk=None):
        profile = UserProfile.objects.filter(user_id=pk).select_related("user").first()
        if not profile:
            return Response({"detail": "Client not found."}, status=status.HTTP_404_NOT_FOUND)

        for field in ("phone", "is_client", "marketing_opt_in"):
            if field in request.data:
                setattr(profile, field, request.data[field])

        # ReyHomes Pro is only meaningful for an approved Client.
        # Staff/admins may enable or disable it, but it can never be enabled
        # for a normal registered user. Removing Client status also removes Pro.
        if "is_reypro" in request.data:
            requested_reypro = bool(request.data["is_reypro"])
            if requested_reypro and not profile.is_client:
                return Response(
                    {"detail": "Only Clients can be given ReyHomes Pro access."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            profile.is_reypro = requested_reypro

        if "assigned_agent" in request.data:
            agent_id = request.data["assigned_agent"]
            if agent_id:
                agent = User.objects.filter(id=agent_id, is_staff=True).first()
                if not agent:
                    return Response(
                        {"detail": "Invalid agent."}, status=status.HTTP_400_BAD_REQUEST
                    )
                profile.assigned_agent = agent
            else:
                profile.assigned_agent = None

        if not profile.is_client:
            profile.is_reypro = False

        profile.save()
        return Response(AdminClientSerializer(profile).data)


class StaffAgentListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        agents = User.objects.filter(is_staff=True).order_by("first_name", "username")
        return Response(
            [
                {
                    "id": u.id,
                    "name": u.get_full_name() or u.username,
                    "email": u.email,
                }
                for u in agents
            ]
        )


class AdminUserPagination(PageNumberPagination):
    """Same default page size as the rest of the API, but lets the admin
    Users screen ask for a bigger/smaller page explicitly."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 200


ROLE_FILTERS = {
    "admin": Q(is_superuser=True),
    "staff": Q(is_staff=True, is_superuser=False),
    "client": Q(is_staff=False, is_superuser=False, profile__is_client=True),
    "user": Q(is_staff=False, is_superuser=False, profile__is_client=False),
}


class AdminUserListView(generics.ListAPIView):
    """
    Single source of truth for "who has access to what" in the admin
    dashboard. Every account is classified into exactly one of the four
    business-defined levels (README.md §3: Normal user / Staff / Superuser /
    Client — Pro is a separate flag on Client) via `?role=admin|staff|client|user`,
    is paginated (never dumps the whole user table in one response — see
    QA_REPORT.md item 6), and is searchable by name/email so it stays usable
    as the user base grows.
    """

    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    pagination_class = AdminUserPagination
    search_fields = ["email", "first_name", "last_name", "username"]
    ordering_fields = ["date_joined", "last_login", "email", "first_name"]

    def get_queryset(self):
        qs = (
            User.objects.select_related("profile", "profile__assigned_agent")
            .order_by("-date_joined")
        )
        role = self.request.query_params.get("role")
        if role in ROLE_FILTERS:
            qs = qs.filter(ROLE_FILTERS[role])
        return qs


class AdminUserStatsView(APIView):
    """Live counts for the admin dashboard's summary tiles — replaces the
    flat, static tile grid with real numbers so the dashboard reflects the
    actual state of the business instead of just linking to sub-pages."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        return Response(
            {
                "total": users.count(),
                "admins": users.filter(is_superuser=True).count(),
                "staff": users.filter(is_staff=True, is_superuser=False).count(),
                "clients": users.filter(
                    is_staff=False, is_superuser=False, profile__is_client=True
                ).count(),
                "pro_clients": users.filter(
                    is_staff=False, is_superuser=False, profile__is_reypro=True
                ).count(),
                "normal_users": users.filter(
                    is_staff=False, is_superuser=False, profile__is_client=False
                ).count(),
                "new_last_30_days": users.filter(
                    date_joined__gte=timezone.now() - timedelta(days=30)
                ).count(),
            }
        )
