from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from .models import Conversation, Message


User = get_user_model()


class ChatAPITests(APITestCase):

    def setUp(self):
        # Create three test users
        self.alice = User.objects.create_user(
            username="alice@example.com",
            email="alice@example.com",
            password="TestPassword123!",
            first_name="Alice"
        )

        self.bob = User.objects.create_user(
            username="bob@example.com",
            email="bob@example.com",
            password="TestPassword123!",
            first_name="Bob"
        )

        self.charlie = User.objects.create_user(
            username="charlie@example.com",
            email="charlie@example.com",
            password="TestPassword123!",
            first_name="Charlie"
        )

        # Conversation between Alice and Bob
        self.conversation = Conversation.objects.create(
            participant_1=self.alice,
            participant_2=self.bob
        )

        self.url = (
            f"/api/conversations/{self.conversation.id}/messages/"
        )

    def test_users_require_login(self):
        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 403)

    def test_alice_can_find_bob(self):
        self.client.force_login(self.alice)

        response = self.client.get("/api/users/")

        self.assertEqual(response.status_code, 200)

        user_ids = {
            user["id"] for user in response.data["users"]
        }

        self.assertIn(self.bob.id, user_ids)
        self.assertNotIn(self.alice.id, user_ids)

    def test_alice_can_send_message(self):
        self.client.force_login(self.alice)

        response = self.client.post(
            self.url,
            {"text": "Hello Bob!"},
            format="json"
        )

        self.assertEqual(response.status_code, 201)

        message = Message.objects.get(
            id=response.data["message"]["id"]
        )

        self.assertEqual(message.sender, self.alice)
        self.assertEqual(message.text, "Hello Bob!")

    def test_bob_can_read_alice_message(self):
        Message.objects.create(
            conversation=self.conversation,
            sender=self.alice,
            text="Hello Bob!"
        )

        self.client.force_login(self.bob)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data["messages"][0]["text"],
            "Hello Bob!"
        )

    def test_charlie_cannot_read_private_chat(self):
        self.client.force_login(self.charlie)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 404)

    def test_charlie_cannot_send_to_private_chat(self):
        self.client.force_login(self.charlie)

        response = self.client.post(
            self.url,
            {"text": "Unauthorized message"},
            format="json"
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(Message.objects.count(), 0)

    def test_sender_cannot_be_spoofed(self):
        self.client.force_login(self.alice)

        response = self.client.post(
            self.url,
            {
                "text": "Hello!",
                "sender": self.bob.id
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)

        message = Message.objects.get(
            id=response.data["message"]["id"]
        )

        self.assertEqual(message.sender, self.alice)

    def test_empty_message_rejected(self):
        self.client.force_login(self.alice)

        response = self.client.post(
            self.url,
            {"text": "   "},
            format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_duplicate_conversation_prevented(self):
        self.client.force_login(self.bob)

        response = self.client.post(
            "/api/conversations/",
            {"receiver_id": self.alice.id},
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["created"])
        self.assertEqual(Conversation.objects.count(), 1)