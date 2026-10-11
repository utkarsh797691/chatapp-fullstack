from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Conversation, Message
from .chat_serializers import (
    UserListSerializer,
    StartConversationSerializer,
    ConversationSerializer,
    MessageSerializer,
)

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_users(request):

    users = User.objects.filter(
        is_active=True,
        is_staff=False
    ).exclude(
        id=request.user.id
    ).order_by("id")

    serializer = UserListSerializer(users, many=True)

    return Response({
        "users": serializer.data
    })

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def conversations_view(request):

    # GET: List my conversations
    if request.method == "GET":

        conversations = Conversation.objects.filter(
            Q(participant_1=request.user) |
            Q(participant_2=request.user)
        ).select_related(
            "participant_1",
            "participant_2"
        ).order_by("-created_at", "-id")

        serializer = ConversationSerializer(
            conversations,
            many=True,
            context={"request": request}
        )

        return Response({
            "conversations": serializer.data
        })

    # POST: Start a conversation
    serializer = StartConversationSerializer(
        data=request.data,
        context={"request": request}
    )

    serializer.is_valid(raise_exception=True)

    receiver_id = serializer.validated_data["receiver_id"]
    current_user_id = request.user.id

    # Always store IDs in ascending order
    first_id = min(current_user_id, receiver_id)
    second_id = max(current_user_id, receiver_id)

    conversation, created = Conversation.objects.get_or_create(
        participant_1_id=first_id,
        participant_2_id=second_id
    )

    result = ConversationSerializer(
        conversation,
        context={"request": request}
    )

    return Response(
        {
            "conversation": result.data,
            "created": created
        },
        status=(
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        )
    )

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def conversation_messages(request, conversation_id):

    # Verify the logged-in user belongs to this conversation
    conversation = get_object_or_404(
        Conversation,
        Q(participant_1=request.user) |
        Q(participant_2=request.user),
        pk=conversation_id
    )

    # GET: Retrieve messages
    if request.method == "GET":

        messages = Message.objects.filter(
            conversation=conversation
        ).order_by("created_at", "id")

        serializer = MessageSerializer(
            messages,
            many=True
        )

        return Response({
            "messages": serializer.data
        })

    # POST: Send a new message
    serializer = MessageSerializer(data=request.data)

    serializer.is_valid(raise_exception=True)

    message = serializer.save(
        conversation=conversation,
        sender=request.user
    )

    return Response(
        {
            "message": MessageSerializer(message).data
        },
        status=status.HTTP_201_CREATED
    )