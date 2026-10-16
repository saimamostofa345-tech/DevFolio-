from rest_framework import serializers

from .models import Category, Comment, Post, PostLike, Tag


class CategorySerializer(serializers.ModelSerializer):
    """
    Blog Category serializer with published posts count.
    Complies with B-7, B-21.
    """

    posts_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "posts_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "posts_count", "created_at", "updated_at"]


class TagSerializer(serializers.ModelSerializer):
    """
    Blog Tag serializer with published posts count.
    Complies with B-8.
    """

    posts_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Tag
        fields = [
            "id",
            "name",
            "slug",
            "posts_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "posts_count", "created_at", "updated_at"]


class CommentReplySerializer(serializers.ModelSerializer):
    """
    Serializer for one-level nested replies under a parent comment.
    """

    class Meta:
        model = Comment
        fields = [
            "id",
            "name",
            "website",
            "content",
            "parent",
            "created_at",
        ]
        read_only_fields = fields


class CommentSerializer(serializers.ModelSerializer):
    """
    Comment serializer supporting creation, moderation, and one-level threading.
    Protects visitor email from public responses (S-8).
    Complies with B-11, B-21.
    """

    replies = serializers.SerializerMethodField()
    post_title = serializers.CharField(source="post.title", read_only=True)
    post_slug = serializers.CharField(source="post.slug", read_only=True)

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "post_title",
            "post_slug",
            "name",
            "email",
            "website",
            "content",
            "parent",
            "replies",
            "is_approved",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_approved", "created_at", "updated_at"]

    def get_replies(self, obj):
        # Only return approved replies
        replies = obj.replies.filter(is_approved=True)
        return CommentReplySerializer(replies, many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")

        # Security Rule S-8: Never expose visitor emails in public comment responses
        is_owner = bool(
            request
            and request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )
        if not is_owner:
            data.pop("email", None)

        return data

    def validate_name(self, value):
        text = value.strip()
        if len(text) < 2:
            raise serializers.ValidationError(
                "Name must be at least 2 characters."
            )
        return text

    def validate_content(self, value):
        text = value.strip()
        if not (5 <= len(text) <= 1000):
            raise serializers.ValidationError(
                "Comment content must be between 5 and 1000 characters."
            )
        return text

    def validate_parent(self, value):
        if value and value.parent is not None:
            raise serializers.ValidationError(
                "Only one level of replies is permitted."
            )
        return value


class RelatedPostSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for up to 3 related posts in post detail.
    """

    class Meta:
        model = Post
        fields = [
            "id",
            "title",
            "slug",
            "excerpt",
            "cover_image",
            "published_at",
            "reading_time",
        ]
        read_only_fields = fields


class PostSerializer(serializers.ModelSerializer):
    """
    Post serializer with slug, reading time calculation,
    and visitor like status check (X-Visitor-Id).
    Complies with B-9, B-21.
    """

    author_name = serializers.CharField(
        source="author.get_full_name",
        read_only=True,
    )
    category_detail = CategorySerializer(source="category", read_only=True)
    tags_detail = TagSerializer(source="tags", many=True, read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.SerializerMethodField()
    related_posts = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "author_name",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image",
            "category",
            "category_detail",
            "tags",
            "tags_detail",
            "status",
            "published_at",
            "views_count",
            "reading_time",
            "is_featured",
            "created_at",
            "updated_at",
            "likes_count",
            "comments_count",
            "is_liked",
            "related_posts",
        ]
        read_only_fields = [
            "id",
            "author",
            "slug",
            "published_at",
            "views_count",
            "reading_time",
            "created_at",
            "updated_at",
            "likes_count",
            "comments_count",
            "is_liked",
            "related_posts",
        ]

    def get_is_liked(self, obj):
        request = self.context.get("request")
        if not request:
            return False
        visitor_id = request.headers.get("X-Visitor-Id")
        if not visitor_id:
            return False
        return obj.likes.filter(visitor_id=visitor_id).exists()

    def get_related_posts(self, obj):
        if not obj.category_id:
            return []
        related = (
            Post.objects.filter(
                category=obj.category,
                status=Post.Status.PUBLISHED,
            )
            .exclude(pk=obj.pk)[:3]
        )
        return RelatedPostSerializer(related, many=True).data

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError(
                "Post title must be at least 5 characters long."
            )
        return value

    def validate_cover_image(self, value):
        if value:
            if value.size > 2 * 1024 * 1024:
                raise serializers.ValidationError(
                    "Cover image cannot exceed 2 MB."
                )
            ext = value.name.split(".")[-1].lower()
            if ext not in ["jpg", "jpeg", "png", "webp"]:
                raise serializers.ValidationError(
                    "Only .jpg, .jpeg, .png, and .webp formats are allowed."
                )
        return value

    def validate(self, attrs):
        status = attrs.get("status", getattr(self.instance, "status", Post.Status.DRAFT))
        content = attrs.get("content", getattr(self.instance, "content", ""))
        category = attrs.get("category", getattr(self.instance, "category", None))

        if status == Post.Status.PUBLISHED:
            if not category:
                raise serializers.ValidationError(
                    {"category": "A category is required to publish a post."}
                )
            if len(content.strip()) < 100:
                raise serializers.ValidationError(
                    {"content": "Content must be at least 100 characters long to publish."}
                )

        return attrs