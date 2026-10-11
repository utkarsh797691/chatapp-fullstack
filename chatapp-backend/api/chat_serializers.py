from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Conversation, Message


User = get_user_model()


class UserListSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name"]

    def get_name(self, obj):
        return obj.get_full_name() or f"User {obj.id}"


class StartConversationSerializer(serializers.Serializer):

    receiver_id = serializers.IntegerField(min_value=1)

    def validate_receiver_id(self, value):
        current_user = self.context["request"].user

        if value == current_user.id:
            raise serializers.ValidationError(
                "You cannot start a conversation with yourself."
            )

        receiver_exists = User.objects.filter(
            id=value,
            is_active=True,
            is_staff=False
        ).exists()

        if not receiver_exists:
            raise serializers.ValidationError(
                "Selected user does not exist."
            )

        return value


class ConversationSerializer(serializers.ModelSerializer):

    other_user = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "other_user",
            "created_at",
        ]

    def get_other_user(self, obj):
        current_user = self.context["request"].user

        if obj.participant_1_id == current_user.id:
            other = obj.participant_2
        else:
            other = obj.participant_1

        return UserListSerializer(other).data


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message

        fields = [
            "id",
            "sender",
            "text",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "sender",
            "created_at",
        ]

    def validate_text(self, value):
        text = value.strip()

        if not text:
            raise serializers.ValidationError(
                "Message cannot be empty."
            )

        return text