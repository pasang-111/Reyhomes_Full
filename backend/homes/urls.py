from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HomeDesignViewSet

router = DefaultRouter()
router.register(r"designs", HomeDesignViewSet, basename="design")

urlpatterns = [path("", include(router.urls))]
