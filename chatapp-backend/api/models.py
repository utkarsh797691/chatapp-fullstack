
from django.conf import settings
from django.db import models
from django.db.models import F, Q


class Conversation(models.Model):

    participant_1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations_as_first"
    )

    participant_2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations_as_second"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["participant_1", "participant_2"],
                name="unique_chat_pair"
            ),
            models.CheckConstraint(
                condition=Q(
                    participant_1_id__lt=F("participant_2_id")
                ),
                name="ordered_chat_pair"
            ),
        ]

    def __str__(self):
        return (
            f"{self.participant_1.username} - "
            f"{self.participant_2.username}"
        )


class Message(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages"
    )

    text = models.CharField(
        max_length=2000
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["created_at", "id"]

    def __str__(self):
        return f"{self.sender.username}: {self.text[:30]}"