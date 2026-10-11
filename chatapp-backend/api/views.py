from django.db import connection
from rest_framework import status
from .serializers import RegisterSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):

    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        cursor.fetchone()

    return Response({
        "status": "success",
        "message": "Django backend connected!",
        "database": "connected"
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):

    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid(raise_exception=True):
        user = serializer.save()

        return Response({
            "message": "Registration successful!",
            "user": {
                "id": user.id,
                "name": user.get_full_name(),
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)