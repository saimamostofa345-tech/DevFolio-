from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.db.models import Count, F, Q, ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from portfolio.permissions import IsOwnerOnly, IsOwnerOrReadOnly
from .models import Category, Comment, Post, PostLike, Tag
from .pagination import CommentPagination, PostPagination
from .serializers import (
    CategorySerializer,
    CommentSerializer,
    PostSerializer,
    TagSerializer,
)
from .throttles import CommentCreateThrottle, LikeToggleThrottle


class CategoryViewSet(viewsets.ModelViewSet):
    """
    GET /api/categories/ (Public, with published posts_count)
    POST, PATCH, DELETE /api/categories/ (Owner only)
    Handles on_delete=PROTECT gracefully returning 400 (B-21).
    """

    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(
            posts_count=Count(
                "posts",
                filter=Q(posts__status=Post.Status.PUBLISHED),
                distinct=True,
            )
        ).order_by("name")

    def get_serializer_class(self):
        return CategorySerializer

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "Cannot delete category because it contains associated posts. "
                        "Reassign or delete those posts first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class TagViewSet(viewsets.ModelViewSet):
    """
    GET /api/tags/ (Public, with published posts_count)
    POST, PATCH, DELETE /api/tags/ (Owner only)
    """

    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        return Tag.objects.annotate(
            posts_count=Count(
                "posts",
                filter=Q(posts__status=Post.Status.PUBLISHED),
                distinct=True,
            )
        ).order_by("name")

    def get_serializer_class(self):
        return TagSerializer


class PostViewSet(viewsets.ModelViewSet):
    """
    GET /api/posts/ (Public: PUBLISHED only for visitors; DRAFT/?status=all for owner)
    GET /api/posts/<slug>/ (Draft -> 404 for visitor, 200 for owner)
    POST, PATCH, DELETE /api/posts/ (Owner only)
    Complies with B-9, B-15, B-16, B-18, B-21.
    """

    serializer_class = PostSerializer
    pagination_class = PostPagination
    permission_classes = [IsOwnerOrReadOnly]
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "excerpt", "content"]
    ordering_fields = ["published_at", "views_count", "likes_count", "title", "created_at"]
    ordering = ["-published_at", "-created_at"]

    def get_queryset(self):
        user = self.request.user
        is_owner = bool(user and user.is_authenticated and user.is_superuser)

        queryset = (
            Post.objects.select_related("category", "author")
            .prefetch_related("tags")
            .annotate(
                annotated_likes=Count("likes", distinct=True),
                annotated_comments=Count(
                    "comments",
                    filter=Q(comments__is_approved=True),
                    distinct=True,
                ),
            )
        )

        status_param = self.request.query_params.get("status")

        if is_owner:
            if status_param == "DRAFT":
                queryset = queryset.filter(status=Post.Status.DRAFT)
            elif status_param == "all":
                pass  # return all posts
            elif status_param == "PUBLISHED":
                queryset = queryset.filter(status=Post.Status.PUBLISHED)
        else:
            # Public visitors strictly see PUBLISHED posts only
            queryset = queryset.filter(status=Post.Status.PUBLISHED)

        category_slug = self.request.query_params.get("category")
        tag_slug = self.request.query_params.get("tag")
        is_featured = self.request.query_params.get("is_featured")

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        if is_featured is not None:
            queryset = queryset.filter(
                is_featured=is_featured.lower() in ("true", "1")
            )

        # Custom ordering by annotated likes if requested
        ordering_param = self.request.query_params.get("ordering")
        if ordering_param == "-likes_count":
            queryset = queryset.order_by("-annotated_likes")
        elif ordering_param == "likes_count":
            queryset = queryset.order_by("annotated_likes")

        return queryset.distinct()

    def get_object(self):
        slug = self.kwargs.get("slug")
        user = self.request.user
        is_owner = bool(user and user.is_authenticated and user.is_superuser)

        queryset = (
            Post.objects.select_related("category", "author")
            .prefetch_related("tags")
            .annotate(
                annotated_likes=Count("likes", distinct=True),
                annotated_comments=Count(
                    "comments",
                    filter=Q(comments__is_approved=True),
                    distinct=True,
                ),
            )
        )

        post = get_object_or_404(queryset, slug=slug)

        # If draft and visitor -> strictly 404 (Security Rule S-3)
        if post.status != Post.Status.PUBLISHED and not is_owner:
            raise NotFound("Post not found.")

        # View counter increment with cooldown (B-16)
        if self.action == "retrieve" and post.status == Post.Status.PUBLISHED:
            self._increment_views_count(post)

        return post

    def _increment_views_count(self, post):
        """
        B-16: Increments post's views_count using F() expression update.
        Guarded by X-Visitor-Id (or IP) with a 1-hour cooldown cache
        to prevent double-counting on refreshes or React StrictMode.
        """
        visitor_id = (
            self.request.headers.get("X-Visitor-Id")
            or self.request.META.get("REMOTE_ADDR")
            or "anon"
        )
        cache_key = f"viewed_post_{post.id}_{visitor_id}"

        if not cache.get(cache_key):
            # Atomic database update using F() expression
            Post.objects.filter(pk=post.pk).update(views_count=F("views_count") + 1)
            # Refresh local instance value
            post.views_count += 1
            # Set 1-hour cooldown
            cache.set(cache_key, True, timeout=3600)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[AllowAny],
        throttle_classes=[LikeToggleThrottle],
        url_path="like",
    )
    def toggle_like(self, request, slug=None):
        """
        POST /api/posts/<slug>/like/
        Toggles visitor like on a post.
        Requires X-Visitor-Id header -> 400 if missing.
        Returns: {liked: bool, likes_count: int}
        Complies with B-10 and Section 6 test 6.
        """
        post = self.get_object()
        visitor_id = request.headers.get("X-Visitor-Id")

        if not visitor_id or not visitor_id.strip():
            return Response(
                {"detail": "X-Visitor-Id header is required to like a post."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        visitor_id = visitor_id.strip()
        ip_address = request.META.get("REMOTE_ADDR")

        existing_like = PostLike.objects.filter(post=post, visitor_id=visitor_id).first()

        if existing_like:
            existing_like.delete()
            liked = False
        else:
            PostLike.objects.create(
                post=post,
                visitor_id=visitor_id,
                ip_address=ip_address,
            )
            liked = True

        return Response(
            {
                "liked": liked,
                "likes_count": post.likes.count(),
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["get", "post"],
        permission_classes=[AllowAny],
        url_path="comments",
    )
    def comments(self, request, slug=None):
        """
        GET /api/posts/<slug>/comments/ -> Approved threaded comments (newest first).
        POST /api/posts/<slug>/comments/ -> Creates with is_approved=False -> 201.
        Complies with B-11, B-17.
        """
        post = self.get_object()

        if request.method == "GET":
            # Approved top-level comments only, threaded with replies
            queryset = (
                post.comments.filter(is_approved=True, parent__isnull=True)
                .prefetch_related("replies")
                .order_by("-created_at")
            )
            serializer = CommentSerializer(
                queryset,
                many=True,
                context={"request": request},
            )
            return Response(serializer.data)

        # POST: Create visitor comment
        throttle = CommentCreateThrottle()
        if not throttle.allow_request(request, self):
            return Response(
                {"detail": "Too many attempts, please try later."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        serializer = CommentSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(post=post, is_approved=False)

        return Response(
            {
                "detail": "Your comment is awaiting approval.",
                "comment": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class CommentModerationViewSet(viewsets.ModelViewSet):
    """
    GET /api/comments/ (Owner moderation list, filter ?is_approved=false, ?post=<slug>)
    PATCH, DELETE /api/comments/<id>/ (Approve/unapprove/delete)
    Complies with Section 4 comments specification.
    """

    queryset = Comment.objects.select_related("post").order_by("-created_at")
    serializer_class = CommentSerializer
    permission_classes = [IsOwnerOnly]
    pagination_class = CommentPagination
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def get_queryset(self):
        queryset = super().get_queryset()
        is_approved = self.request.query_params.get("is_approved")
        post_slug = self.request.query_params.get("post")

        if is_approved is not None:
            queryset = queryset.filter(
                is_approved=is_approved.lower() in ("true", "1")
            )
        if post_slug:
            queryset = queryset.filter(post__slug=post_slug)

        return queryset