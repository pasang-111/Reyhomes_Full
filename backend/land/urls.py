from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EstateViewSet, HomeLandPackageViewSet

router = DefaultRouter()
router.register(r"estates", EstateViewSet, basename="estate")
router.register(r"packages", HomeLandPackageViewSet, basename="package")

urlpatterns = [path("", include(router.urls))]
