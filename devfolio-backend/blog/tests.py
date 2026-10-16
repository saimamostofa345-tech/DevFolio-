from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from .models import Category, Comment, Post, PostLike

User = get_user_model()


class BlogAcceptanceTests(TestCase):
    """
    Acceptance tests for DevFolio Blog satisfying Section 6 tests 4, 5, and 6.
    """

    def setUp(self):
        self.client = APIClient()

        # Site owner (superuser)
        self.owner = User.objects.create_superuser(
            username="owner",
            email="saimamostofa345@gmail.com",
            password="StrongOwnerPassword123!",
        )

        self.category = Category.objects.create(name="UI/UX Design")

        # Published post
        self.published_post = Post.objects.create(
            author=self.owner,
            category=self.category,
            title="Design Systems in Figma",
            content="This is a comprehensive guide to building modular design tokens and components in Figma for production applications." * 3,
            status=Post.Status.PUBLISHED,
        )

        # Draft post
        self.draft_post = Post.objects.create(
            author=self.owner,
            category=self.category,
            title="Secret Upcoming Draft Post",
            content="This is work in progress content that should not be visible to any public visitor.",
            status=Post.Status.DRAFT,
        )

        # Comments on published post
        self.approved_comment = Comment.objects.create(
            post=self.published_post,
            name="Alice",
            email="alice@example.com",
            content="Great article on design systems!",
            is_approved=True,
        )
        self.unapproved_comment = Comment.objects.create(
            post=self.published_post,
            name="Spam Bot",
            email="spam@example.com",
            content="Check this link for free prizes!",
            is_approved=False,
        )

    # Acceptance Test 4: Drafts are invisible to visitors
    def test_draft_post_detail_returns_404_for_visitor(self):
        response = self.client.get(f"/api/posts/{self.draft_post.slug}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_draft_post_not_in_public_posts_list(self):
        response = self.client.get("/api/posts/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        slugs = [p["slug"] for p in results]
        self.assertIn(self.published_post.slug, slugs)
        self.assertNotIn(self.draft_post.slug, slugs)

    def test_owner_can_see_drafts_with_filter(self):
        self.client.force_authenticate(user=self.owner)
        response = self.client.get("/api/posts/?status=DRAFT")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        slugs = [p["slug"] for p in results]
        self.assertIn(self.draft_post.slug, slugs)

    # Acceptance Test 5: Unapproved comments are invisible
    def test_unapproved_comments_are_invisible_publicly(self):
        response = self.client.get(f"/api/posts/{self.published_post.slug}/comments/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        comment_names = [c["name"] for c in response.data]
        self.assertIn("Alice", comment_names)
        self.assertNotIn("Spam Bot", comment_names)

    # Acceptance Test 6: Like is a toggle and is idempotent per visitor
    def test_like_toggle_behavior(self):
        visitor_headers = {"HTTP_X_VISITOR_ID": "visitor-uuid-12345"}
        like_url = f"/api/posts/{self.published_post.slug}/like/"

        # 1. First toggle -> liked: True, likes_count: 1
        res1 = self.client.post(like_url, **visitor_headers)
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertTrue(res1.data["liked"])
        self.assertEqual(res1.data["likes_count"], 1)

        # 2. Second toggle -> liked: False, likes_count: 0
        res2 = self.client.post(like_url, **visitor_headers)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data["liked"])
        self.assertEqual(res2.data["likes_count"], 0)

    def test_like_missing_visitor_id_returns_400(self):
        like_url = f"/api/posts/{self.published_post.slug}/like/"
        response = self.client.post(like_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)