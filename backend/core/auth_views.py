from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

class StaffLoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = (request.data.get("username") or request.data.get("email") or "").strip()
        password = request.data.get("password") or ""
        if not username or not password:
            return Response({"detail": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_staff:
            return Response({"detail": "Staff access required."}, status=status.HTTP_403_FORBIDDEN)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "token": token.key,
            "user": {
                "id": user.id, "username": user.username, "email": user.email,
                "is_staff": user.is_staff, "is_superuser": user.is_superuser,
            },
        })

class StaffMeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        u = request.user
        if not u.is_staff:
            return Response({"detail": "Staff access required."}, status=status.HTTP_403_FORBIDDEN)
        return Response({
            "id": u.id, "username": u.username, "email": u.email,
            "is_staff": u.is_staff, "is_superuser": u.is_superuser,
        })

class StaffLogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response({"detail": "Logged out."})
