from django.urls import path
from .chat_views import (
    get_users,
    conversations_view,
    conversation_messages,
)

from .views import health_check
from .auth_views import (
    csrf_cookie,
    secure_registration,
    login_user,
    current_user,
    logout_user,
)

urlpatterns = [
    path("health/", health_check),
    path("csrf/", csrf_cookie),
    path("register/", secure_registration),
    path("login/", login_user),
    path("me/", current_user),
    path("logout/", logout_user),
    path("users/", get_users, name="users"),

    path(
        "conversations/",
        conversations_view,
        name="conversations"
    ),

    path(
        "conversations/<int:conversation_id>/messages/",
        conversation_messages,
        name="conversation-messages"
    ),
]
