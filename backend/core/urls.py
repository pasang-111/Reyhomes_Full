from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    HeroSlideListView,
    HeroSlideViewSet,
    InclusionViewSet,
    TestimonialListView,
    TestimonialViewSet,
    SiteSettingView,
    search_event_create,
)
from .auth_views import StaffLoginView, StaffMeView, StaffLogoutView
from .review_views import PublicReviewByTokenView

router = DefaultRouter()
router.register(r"inclusions", InclusionViewSet, basename="inclusion")
router.register(r"hero-slides", HeroSlideViewSet, basename="hero-slide")
router.register(r"testimonials", TestimonialViewSet, basename="testimonial")

urlpatterns = [
    path("staff/auth/login/", StaffLoginView.as_view(), name="staff-login"),
    path("staff/auth/me/", StaffMeView.as_view(), name="staff-me"),
    path("staff/auth/logout/", StaffLogoutView.as_view(), name="staff-logout"),

    # Backward-compatible public list endpoints
    path("hero/", HeroSlideListView.as_view(), name="hero-list"),
    path("testimonials/", TestimonialListView.as_view(), name="testimonial-list"),
    path("settings/", SiteSettingView.as_view(), name="site-settings"),
    path("review/<str:token>/", PublicReviewByTokenView.as_view(), name="public-review"),
    path("search-events/", search_event_create, name="search-event-create"),
    path("", include(router.urls)),
]
