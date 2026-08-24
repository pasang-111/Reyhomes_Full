from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import UserProfile
from .models import BuildProject, Contract, Message, MessageThread, Notification, ClientInclusion
from .serializers import (
    AdminClientSerializer,
    BuildProjectSerializer,
    ClientInclusionSerializer,
    MessageThreadSerializer,
    NotificationSerializer,
    SendMessageSerializer,
)

User = get_user_model()


def _profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    return profile


def _pro_gate(request):
    profile = _profile(request)
    if not profile.is_reypro:
        return Response({"detail": "ReyHomes Pro access is not enabled for this account."}, status=status.HTTP_403_FORBIDDEN)
    return None


class ProDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        blocked = _pro_gate(request)
        if blocked:
            return blocked
        build = (
            BuildProject.objects.filter(contract__client=request.user, contract__status__in=["signed", "active", "completed"])
            .select_related("contract", "contract__home_design", "contract__land_package")
            .prefetch_related("milestones")
            .order_by("-updated_at")
            .first()
        )
        return Response({
            "user": {"id": request.user.id, "name": request.user.get_full_name() or request.user.email, "email": request.user.email},
            "build": BuildProjectSerializer(build, context={"request": request}).data if build else None,
            "notifications": NotificationSerializer(request.user.notifications.all()[:8], many=True).data,
        })


class MyThreadsView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageThreadSerializer

    def get_queryset(self):
        return MessageThread.objects.filter(client=self.request.user).prefetch_related("messages", "agent")

    def create(self, request, *args, **kwargs):
        blocked = _pro_gate(request)
        if blocked:
            return blocked
        build = BuildProject.objects.filter(contract__client=request.user).order_by("-updated_at").first()
        if not build:
            return Response({"detail": "No active build is connected to this account."}, status=status.HTTP_400_BAD_REQUEST)
        agent = _profile(request).assigned_agent or User.objects.filter(is_staff=True).order_by("id").first()
        if not agent:
            return Response({"detail": "No real estate agent is assigned yet."}, status=status.HTTP_409_CONFLICT)
        subject = request.data.get("subject") or "Build enquiry"
        thread = MessageThread.objects.create(build=build, client=request.user, agent=agent, subject=subject)
        body = request.data.get("body")
        if body:
            Message.objects.create(thread=thread, sender=request.user, body=str(body).strip())
            Notification.objects.create(user=agent, title="New ReyHomes Pro message", message=f"{request.user.get_full_name() or request.user.email} sent a new message.", notification_type="message", link=f"/pro/messages/{thread.id}")
        return Response(MessageThreadSerializer(thread, context={"request": request}).data, status=status.HTTP_201_CREATED)


class ThreadMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        blocked = _pro_gate(request)
        if blocked:
            return blocked
        thread = MessageThread.objects.filter(id=pk, client=request.user).first()
        if not thread:
            return Response({"detail": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
        data = SendMessageSerializer(data=request.data)
        data.is_valid(raise_exception=True)
        msg = Message.objects.create(thread=thread, sender=request.user, body=data.validated_data["body"].strip())
        thread.updated_at = timezone.now()
        thread.save(update_fields=["updated_at"])
        Notification.objects.create(user=thread.agent, title="New ReyHomes Pro message", message=f"New message from {request.user.get_full_name() or request.user.email}.", notification_type="message", link=f"/pro/messages/{thread.id}")
        return Response({"id": msg.id, "created_at": msg.created_at})


class MyInclusionsView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientInclusionSerializer

    def get_queryset(self):
        return ClientInclusion.objects.filter(client=self.request.user).order_by("category", "title")

    def create(self, request, *args, **kwargs):
        blocked = _pro_gate(request)
        if blocked:
            return blocked
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save(client=request.user, build=BuildProject.objects.filter(contract__client=request.user).order_by("-updated_at").first())
        return Response(self.get_serializer(obj).data, status=status.HTTP_201_CREATED)


class MyInclusionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientInclusionSerializer

    def get_queryset(self):
        return ClientInclusion.objects.filter(client=self.request.user)

    def perform_update(self, serializer):
        blocked = _pro_gate(self.request)
        if blocked:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(str(blocked.data.get("detail")))
        serializer.save()


class MyNotificationsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        note = Notification.objects.filter(id=pk, user=request.user).first()
        if not note:
            return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
        note.read = True
        note.save(update_fields=["read"])
        return Response(NotificationSerializer(note).data)


class AdminClientsView(generics.ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminClientSerializer
    queryset = UserProfile.objects.select_related("user", "assigned_agent").order_by("user__first_name", "user__last_name", "user__email")


class AdminClientDetailView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def patch(self, request, pk):
        profile = UserProfile.objects.select_related("user").filter(user_id=pk).first()
        if not profile:
            return Response({"detail": "Client not found."}, status=status.HTTP_404_NOT_FOUND)
        requested_client = request.data.get("is_client") if "is_client" in request.data else profile.is_client
        requested_reypro = request.data.get("is_reypro") if "is_reypro" in request.data else profile.is_reypro

        # ReyHomes Pro is a privilege of an explicitly approved Client.
        if bool(requested_reypro) and not bool(requested_client):
            return Response(
                {"detail": "A user must be marked as a client before ReyHomes Pro can be enabled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "is_client" in request.data and not bool(requested_client) and profile.is_reypro:
            # Removing Client status also removes Pro access.
            requested_reypro = False

        changed_reypro = bool(requested_reypro) != profile.is_reypro
        if "phone" in request.data:
            profile.phone = request.data["phone"]
        if "is_client" in request.data:
            profile.is_client = bool(requested_client)
        if "is_reypro" in request.data or ("is_client" in request.data and not bool(requested_client)):
            profile.is_reypro = bool(requested_reypro)
        if "marketing_opt_in" in request.data:
            profile.marketing_opt_in = bool(request.data["marketing_opt_in"])
        if "assigned_agent" in request.data:
            agent_id = request.data["assigned_agent"]
            profile.assigned_agent = User.objects.filter(id=agent_id, is_staff=True).first() if agent_id else None
            if agent_id and not profile.assigned_agent:
                return Response({"detail": "Invalid agent."}, status=status.HTTP_400_BAD_REQUEST)
        profile.save()
        if changed_reypro:
            Notification.objects.create(
                user=profile.user,
                title="ReyHomes Pro access updated",
                message="Your ReyHomes Pro access has been enabled." if profile.is_reypro else "Your ReyHomes Pro access has been disabled.",
                notification_type="system",
                link="/pro",
            )
        return Response(AdminClientSerializer(profile).data)


class AdminContractStatusView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def patch(self, request, pk):
        contract = Contract.objects.select_related("client", "client__profile").filter(pk=pk).first()
        if not contract:
            return Response({"detail": "Contract not found."}, status=status.HTTP_404_NOT_FOUND)
        new_status = request.data.get("status")
        valid = dict(Contract.STATUS_CHOICES)
        if new_status not in valid:
            return Response({"detail": "Invalid contract status."}, status=status.HTTP_400_BAD_REQUEST)
        contract.status = new_status
        if new_status in {"signed", "active", "completed"}:
            contract.signed_date = contract.signed_date or timezone.localdate()
        contract.save(update_fields=["status", "signed_date", "updated_at"])
        return Response({"id": contract.id, "status": contract.status, "is_client": contract.client.profile.is_client})
