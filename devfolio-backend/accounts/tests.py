from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient


User = get_user_model()


class OwnerLoginTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.owner = User.objects.create_superuser(
            username="owner",
            email="owner@example.com",
            password="TestPassword123!",
        )

        User.objects.create_user(
            username="visitor",
            email="visitor@example.com",
            password="TestPassword123!",
        )

    def test_owner_can_login(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "owner",
                "password": "TestPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_regular_user_cannot_login_as_owner(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "visitor",
                "password": "TestPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_invalid_password_is_rejected(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "owner",
                "password": "wrong-password",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)