from django.core.cache import cache
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import EnquiryCreateSerializer
from .email_service import send_enquiry_emails


def _client_ip(request) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


class EnquiryCreateView(generics.CreateAPIView):
    serializer_class = EnquiryCreateSerializer

    def create(self, request, *args, **kwargs):
        # Soft anti-spam: 8 submissions / minute / IP
        ip = _client_ip(request)
        cache_key = f"enquiry_rate:{ip}"
        hits = cache.get(cache_key, 0)
        if hits >= 8:
            return Response(
                {"detail": "Too many enquiries. Please try again shortly."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )
        cache.set(cache_key, hits + 1, 60)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        enquiry = serializer.instance
        send_enquiry_emails(enquiry)
        return Response(
            {"success": True, "message": "Enquiry submitted successfully."},
            status=status.HTTP_201_CREATED,
        )
