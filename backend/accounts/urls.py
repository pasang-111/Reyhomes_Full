from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import (
    MemberLoginView,
    MemberMeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
)
from .views import (
    AdminClientViewSet,
    AdminUserListView,
    AdminUserStatsView,
    StaffAgentListView,
    WishlistViewSet,
)

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="member-register"),
    path("auth/login/", MemberLoginView.as_view(), name="member-login"),
    path("auth/me/", MemberMeView.as_view(), name="member-me"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="member-refresh"),
    path("auth/password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("wishlist/", WishlistViewSet.as_view({"get": "list", "post": "create"}), name="wishlist"),
    path(
        "wishlist/<int:pk>/",
        WishlistViewSet.as_view({"delete": "destroy"}),
        name="wishlist-detail",
    ),
    # Legacy client-only endpoints — kept for backwards compatibility with
    # any existing integration. New admin UI uses admin/users/ below.
    path("admin/clients/", AdminClientViewSet.as_view({"get": "list"}), name="admin-clients"),
    path(
        "admin/clients/<int:pk>/",
        AdminClientViewSet.as_view({"patch": "partial_update"}),
        name="admin-client-detail",
    ),
    path("admin/agents/", StaffAgentListView.as_view(), name="admin-agents"),
    # Unified, role-segmented, paginated, searchable user directory.
    path("admin/users/", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/stats/", AdminUserStatsView.as_view(), name="admin-users-stats"),
]
