from django.urls import path
from .views import (
    ProDashboardView,
    MyThreadsView,
    ThreadMessagesView,
    MyInclusionsView,
    MyInclusionDetailView,
    MyNotificationsView,
    MarkNotificationReadView,
    AdminClientsView,
    AdminClientDetailView,
    AdminContractStatusView,
)

urlpatterns = [
    path("dashboard/", ProDashboardView.as_view()),
    path("threads/", MyThreadsView.as_view()),
    path("threads/<int:pk>/messages/", ThreadMessagesView.as_view()),
    path("inclusions/", MyInclusionsView.as_view()),
    path("inclusions/<int:pk>/", MyInclusionDetailView.as_view()),
    path("notifications/", MyNotificationsView.as_view()),
    path("notifications/<int:pk>/read/", MarkNotificationReadView.as_view()),
    path("admin/clients/", AdminClientsView.as_view()),
    path("admin/clients/<int:pk>/", AdminClientDetailView.as_view()),
    path("admin/contracts/<int:pk>/status/", AdminContractStatusView.as_view()),
]
