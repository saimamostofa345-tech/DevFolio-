import math
import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Category(models.Model):
    """
    Blog categories. Deleting a category with active posts is protected.
    Complies with DevFolio requirement B-7.
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Tag(models.Model):
    """
    Blog tags for post discovery.
    Complies with DevFolio requirement B-8.
    """

    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name) or str(uuid.uuid4())[:8]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Post(models.Model):
    """
    Blog article with draft/published state, automatic reading time,
    and protected categories.
    Complies with DevFolio requirement B-9.
    """

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"

    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=270, unique=True, blank=True)
    excerpt = models.CharField(max_length=300, blank=True)
    content = models.TextField(
        help_text="Article body in Markdown format."
    )
    cover_image = models.ImageField(
        upload_to="blog/",
        blank=True,
        null=True,
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="posts",
        null=True,
        blank=True,
    )
    tags = models.ManyToManyField(
        Tag,
        blank=True,
        related_name="posts",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blog_posts",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    published_at = models.DateTimeField(null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    reading_time = models.PositiveIntegerField(
        default=1,
        help_text="Estimated reading time in minutes (~200 words/minute).",
    )
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            models.Index(fields=["status", "-published_at"]),
        ]

    def clean(self):
        if len(self.title.strip()) < 5:
            raise ValidationError(
                {"title": "Title must be at least 5 characters long."}
            )

        if self.status == self.Status.PUBLISHED:
            if not self.category:
                raise ValidationError(
                    {"category": "A category is required to publish a post."}
                )
            if len(self.content.strip()) < 100:
                raise ValidationError(
                    {"content": "Content must be at least 100 characters to be published."}
                )

    def save(self, *args, **kwargs):
        # Auto slug generation
        if not self.slug:
            base_slug = slugify(self.title) or str(uuid.uuid4())[:8]
            candidate = base_slug
            number = 1
            while Post.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                candidate = f"{base_slug}-{number}"
                number += 1
            self.slug = candidate

        # Automatic reading time: ~200 words per minute (min 1 min)
        words = len(self.content.split()) if self.content else 0
        self.reading_time = max(1, math.ceil(words / 200))

        # published_at set on first transition from DRAFT to PUBLISHED; never overwritten
        if self.status == self.Status.PUBLISHED and self.published_at is None:
            self.published_at = timezone.now()

        super().save(*args, **kwargs)

    @property
    def likes_count(self):
        return self.likes.count()

    @property
    def comments_count(self):
        return self.comments.filter(is_approved=True).count()

    def __str__(self):
        return self.title


class PostLike(models.Model):
    """
    Tracks visitor likes per post using a client-side visitor UUID (X-Visitor-Id).
    Enforces that one visitor can only like a post once.
    Complies with DevFolio requirement B-10.
    """

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="likes",
    )
    visitor_id = models.CharField(
        max_length=64,
        help_text="Unique client-generated visitor identifier.",
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["post", "visitor_id"],
                name="unique_visitor_like_per_post",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Like on '{self.post.title}' by {self.visitor_id[:8]}"


class Comment(models.Model):
    """
    Public visitor comments with moderation queue and one-level reply threading.
    Complies with DevFolio requirement B-11.
    """

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    name = models.CharField(max_length=100)
    email = models.EmailField(
        help_text="Stored for moderation; never returned in public API."
    )
    website = models.URLField(blank=True)
    content = models.TextField(
        max_length=1000,
        help_text="Comment text between 5 and 1000 characters.",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="replies",
        help_text="One-level threaded reply to parent comment.",
    )
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["post", "is_approved", "-created_at"]),
        ]

    def clean(self):
        if len(self.name.strip()) < 2:
            raise ValidationError(
                {"name": "Name must be at least 2 characters."}
            )
        if not (5 <= len(self.content.strip()) <= 1000):
            raise ValidationError(
                {"content": "Comment content must be between 5 and 1000 characters."}
            )
        if self.parent and self.parent.parent is not None:
            raise ValidationError(
                {"parent": "Only one level of comment replies is supported."}
            )

    def __str__(self):
        status_text = "Approved" if self.is_approved else "Pending"
        return f"Comment by {self.name} on '{self.post.title}' [{status_text}]"