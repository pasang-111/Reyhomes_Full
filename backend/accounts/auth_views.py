from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.cache import cache
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile
from .serializers import ApiUserSerializer, RegisterSerializer


def _tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": ApiUserSerializer(user).data,
    }


def _client_ip(request) -> str:
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "unknown")


def _rate_limit(request, key_prefix: str, limit: int = 20, window: int = 60):
    """
    Per-IP rate limit for auth endpoints.
    Returns a Response on exceed, else None.
    """
    ip = _client_ip(request)
    cache_key = f"{key_prefix}:{ip}"
    hits = cache.get(cache_key, 0)
    if hits >= limit:
        return Response(
            {"detail": "Too many attempts. Please try again shortly."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    cache.set(cache_key, hits + 1, window)
    return None


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        limited = _rate_limit(request, "auth_register_rate", limit=10, window=60)
        if limited is not None:
            return limited
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Tokens returned for API consumers; the public site clears them and
        # requires an explicit sign-in after register.
        return Response(_tokens_for_user(user), status=status.HTTP_201_CREATED)


class MemberLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        limited = _rate_limit(request, "auth_login_rate", limit=20, window=60)
        if limited is not None:
            return limited

        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""
        if not email or not password:
            return Response(
                {"detail": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.check_password(password):
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"detail": "This account is disabled. Contact ReyHomes for help."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user.is_staff:
            return Response(
                {"detail": "Use the staff admin login for staff accounts."},
                status=status.HTTP_403_FORBIDDEN,
            )
        UserProfile.objects.get_or_create(user=user)
        return Response(_tokens_for_user(user))


class MemberMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_active:
            return Response(
                {"detail": "This account is disabled."},
                status=status.HTTP_403_FORBIDDEN,
            )
        UserProfile.objects.get_or_create(user=request.user)
        return Response(ApiUserSerializer(request.user).data)


class PasswordResetRequestView(APIView):
    """
    Always returns 200 with a generic message so we never reveal whether
    an email is registered. Sends a reset link when the account exists
    and is a non-staff member.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        limited = _rate_limit(request, "auth_reset_rate", limit=5, window=60)
        if limited is not None:
            return limited

        email = (request.data.get("email") or "").strip().lower()
        generic = {
            "detail": "If an account exists for that email, a reset link is on its way."
        }
        if not email:
            return Response(generic, status=status.HTTP_200_OK)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response(generic, status=status.HTTP_200_OK)

        if not user.is_active or user.is_staff:
            return Response(generic, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        frontend = getattr(settings, "FRONTEND_URL", "") or "http://localhost:3000"
        frontend = frontend.rstrip("/")
        reset_url = f"{frontend}/forgot-password?uid={uid}&token={token}"

        subject = "Reset your ReyHomes password"
        body = (
            f"Hi {user.first_name or 'there'},\n\n"
            f"We received a request to reset the password for your ReyHomes account.\n\n"
            f"Open this link to choose a new password:\n{reset_url}\n\n"
            f"If you did not request this, you can ignore this email.\n\n"
            f"— ReyHomes"
        )
        try:
            send_mail(
                subject,
                body,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=True,
            )
        except Exception:
            # Still return generic success — do not leak mail-backend failures.
            pass
        return Response(generic, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """Validate uid+token and set a new password."""

    permission_classes = [AllowAny]

    def post(self, request):
        limited = _rate_limit(request, "auth_reset_confirm_rate", limit=10, window=60)
        if limited is not None:
            return limited

        uid = (request.data.get("uid") or "").strip()
        token = (request.data.get("token") or "").strip()
        password = request.data.get("password") or ""
        password_confirm = request.data.get("password_confirm") or password

        if not uid or not token or not password:
            return Response(
                {"detail": "uid, token and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if password != password_confirm:
            return Response(
                {"password_confirm": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            validate_password(password)
        except Exception as exc:
            messages = getattr(exc, "messages", None) or [str(exc)]
            return Response(
                {"password": list(messages)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_staff or not user.is_active:
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.save(update_fields=["password"])
        return Response(
            {"detail": "Password updated. You can sign in with your new password."},
            status=status.HTTP_200_OK,
        )
