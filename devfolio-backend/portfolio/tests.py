from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Experience, Profile, Project, Skill

User = get_user_model()


class DevFolioPortfolioAndSecurityTests(TestCase):
    """
    Acceptance and unit tests for DevFolio portfolio, auth, and security.
    Validates Section 6 acceptance tests 1, 2, 3 and owner permissions.
    """

    def setUp(self):
        self.client = APIClient()

        # Site owner (superuser)
        self.owner = User.objects.create_superuser(
            username="owner",
            email="saimamostofa345@gmail.com",
            password="StrongOwnerPassword123!",
        )

        # Normal visitor user (non-superuser)
        self.visitor_user = User.objects.create_user(
            username="visitor_user",
            email="visitor@example.com",
            password="VisitorPassword123!",
        )

    # Acceptance Test 1: A visitor cannot write -> 401
    def test_unauthenticated_visitor_cannot_write(self):
        response = self.client.post(
            "/api/skills/",
            {"name": "React", "category": "FRONTEND", "proficiency": 90},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # Acceptance Test 2: A normal (non-superuser) user's token cannot write -> 403
    def test_normal_user_token_cannot_write(self):
        self.client.force_authenticate(user=self.visitor_user)
        response = self.client.post(
            "/api/skills/",
            {"name": "Django", "category": "BACKEND", "proficiency": 85},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # Acceptance Test 3: Registration does not exist -> 404
    def test_registration_endpoint_returns_404(self):
        response = self.client.post(
            "/api/auth/register/",
            {"username": "hacker", "password": "Password123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # Auth: Owner login succeeds
    def test_owner_login_success(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "owner", "password": "StrongOwnerPassword123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["username"], "owner")

    # Auth: Wrong password returns 401 and does not reveal username existence
    def test_owner_login_invalid_password_returns_401(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "owner", "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["detail"], "Invalid owner credentials.")

    # Auth: Non-superuser cannot login as owner
    def test_non_superuser_login_rejected_with_401(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "visitor_user", "password": "VisitorPassword123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # Owner can create skills
    def test_owner_can_create_skill(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.post(
            "/api/skills/",
            {"name": "Figma", "category": "TOOLS", "proficiency": 95},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Skill.objects.count(), 1)

    # Profile singleton behavior
    def test_profile_singleton_access(self):
        response = self.client.get("/api/profile/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["full_name"], "Saima Mostofa Moni")