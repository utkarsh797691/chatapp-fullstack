import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import (
    csrf_protect,
    ensure_csrf_cookie,
)
from django.views.decorators.http import require_GET, require_POST

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .views import register_user


def user_data(user):
    return {
        "id": user.id,
        "name": user.get_full_name() or user.username,
        "email": user.email,
    }


# STEP 1: Give React a CSRF cookie
@ensure_csrf_cookie
@require_GET
def csrf_cookie(request):
    return JsonResponse({
        "message": "CSRF cookie ready"
    })


# STEP 2: Protect our existing DRF registration endpoint
@csrf_protect
@require_POST
def secure_registration(request):
    return register_user(request)


# STEP 3: Real Login
@csrf_protect
@require_POST
def login_user(request):
    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"detail": "Invalid JSON data."},
            status=400
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"detail": "Invalid request body."},
            status=400
        )

    email = data.get("email")
    password = data.get("password")
    remember = data.get("remember", False)

    if not isinstance(email, str) or not isinstance(password, str):
        return JsonResponse(
            {"detail": "Email and password are required."},
            status=400
        )

    email = email.strip().lower()

    user = authenticate(
        request,
        username=email,
        password=password
    )

    if user is None:
        return JsonResponse(
            {"detail": "Invalid email or password."},
            status=400
        )

    login(request, user)

    # Remember Me behavior
    if remember is True:
        request.session.set_expiry(1209600)  # 14 days
    else:
        request.session.set_expiry(0)  # Browser session

    return JsonResponse({
        "message": "Login successful!",
        "user": user_data(user)
    })


# STEP 4: Get currently logged-in user
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        "user": user_data(request.user)
    })


# STEP 5: Real Logout
@csrf_protect
@require_POST
def logout_user(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"detail": "Not authenticated."},
            status=403
        )

    logout(request)

    return JsonResponse({
        "message": "Logout successful!"
    })