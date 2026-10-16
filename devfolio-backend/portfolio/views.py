from datetime import timedelta
from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import AuthenticationFailed, NotFound
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from blog.models import Comment, Post, PostLike
from blog.throttles import ContactCreateThrottle

from .models import ContactMessage, Education, Experience, Profile, Project, Skill
from .pagination import ContactPagination, ProjectPagination
from .permissions import IsOwnerOnly, IsOwnerOrReadOnly
from .serializers import (
    ChangePasswordSerializer,
    ContactMessageSerializer,
    EducationSerializer,
    ExperienceSerializer,
    OwnerLoginSerializer,
    ProfileSerializer,
    ProjectSerializer,
    SkillSerializer,
)

User = get_user_model()


# -------------------------------------------------------------------------
# Authentication Views (B-14)
# -------------------------------------------------------------------------

class OwnerLoginView(APIView):
    """
    POST /api/auth/login/
    Authenticates the site owner and issues JWT tokens.
    Returns 401 on bad credentials without username leakage (B-14).
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = OwnerLoginSerializer(
            data=request.data,
            context={"request": request},
        )
        if not serializer.is_valid():
            return Response(
                {"detail": "Invalid owner credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )


class OwnerLogoutView(APIView):
    """
    POST /api/auth/logout/
    Blacklists the refresh token (B-14).
    """

    permission_classes = [IsOwnerOnly]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Logged out successfully."},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class OwnerMeView(APIView):
    """
    GET /api/auth/me/
    Returns current owner session info for frontend rehydration.
    """

    permission_classes = [IsOwnerOnly]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_owner": user.is_superuser,
            }
        )


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Updates owner password.
    """

    permission_classes = [IsOwnerOnly]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response(
                {"old_password": ["Current password does not match."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(
            {"detail": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )


def register_not_found_view(request):
    """
    B-14 requirement: Any registration request must explicitly return 404.
    """
    raise NotFound("Registration is not available on this single-owner website.")


# -------------------------------------------------------------------------
# Portfolio Domain Views
# -------------------------------------------------------------------------

class ProfileView(APIView):
    """
    GET /api/profile/ (Public singleton)
    PATCH /api/profile/ (Owner only)
    Complies with B-2.
    """

    permission_classes = [IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        profile = Profile.get_solo()
        serializer = ProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)

    def patch(self, request):
        profile = Profile.get_solo()
        serializer = ProfileSerializer(
            profile,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SkillViewSet(viewsets.ModelViewSet):
    """
    GET /api/skills/ (Public)
    POST, PATCH, DELETE /api/skills/ (Owner only)
    Filtering: ?category=, ?is_featured=; Search: ?search=; Ordering: ?ordering=display_order,-proficiency
    Complies with B-3, B-15.
    """

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsOwnerOrReadOnly]
    pagination_class = None
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "category"]
    ordering_fields = ["display_order", "proficiency", "name"]
    ordering = ["display_order", "-proficiency"]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category")
        is_featured = self.request.query_params.get("is_featured")

        if category:
            queryset = queryset.filter(category__iexact=category)
        if is_featured is not None:
            queryset = queryset.filter(
                is_featured=is_featured.lower() in ("true", "1")
            )
        return queryset


class ExperienceViewSet(viewsets.ModelViewSet):
    """
    GET /api/experiences/ (Public, ordered by -start_date)
    POST, PATCH, DELETE /api/experiences/ (Owner only)
    Complies with B-4.
    """

    queryset = Experience.objects.all().order_by("-start_date", "display_order")
    serializer_class = ExperienceSerializer
    permission_classes = [IsOwnerOrReadOnly]
    pagination_class = None


class EducationViewSet(viewsets.ModelViewSet):
    """
    GET /api/education/ (Public)
    POST, PATCH, DELETE /api/education/ (Owner only)
    Complies with B-5.
    """

    queryset = Education.objects.all().order_by("-start_year")
    serializer_class = EducationSerializer
    permission_classes = [IsOwnerOrReadOnly]
    pagination_class = None


class ProjectViewSet(viewsets.ModelViewSet):
    """
    GET /api/projects/ (Public, paginated 9/page)
    GET /api/projects/<slug>/ (Lookup by slug)
    POST, PATCH, DELETE /api/projects/ (Owner only)
    Complies with B-6, B-18.
    """

    queryset = (
        Project.objects.all()
        .prefetch_related("tech_stack")
        .order_by("-is_featured", "display_order", "-created_at")
    )
    serializer_class = ProjectSerializer
    permission_classes = [IsOwnerOrReadOnly]
    pagination_class = ProjectPagination
    lookup_field = "slug"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "summary", "description"]
    ordering_fields = ["completed_date", "display_order", "created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category")
        is_featured = self.request.query_params.get("is_featured")
        tech = self.request.query_params.get("tech")

        if category:
            queryset = queryset.filter(category__iexact=category)
        if is_featured is not None:
            queryset = queryset.filter(
                is_featured=is_featured.lower() in ("true", "1")
            )
        if tech:
            if tech.isdigit():
                queryset = queryset.filter(tech_stack__id=int(tech))
            else:
                queryset = queryset.filter(tech_stack__name__icontains=tech)

        return queryset.distinct()


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    POST /api/contact/ (Public, throttled 3/hour per IP)
    GET, PATCH, DELETE /api/contact/ (Owner only, pagination 10)
    Complies with B-12, B-17, B-18.
    """

    queryset = ContactMessage.objects.all().order_by("-created_at")
    serializer_class = ContactMessageSerializer
    pagination_class = ContactPagination

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsOwnerOnly()]

    def get_throttles(self):
        if self.action == "create":
            return [ContactCreateThrottle()]
        return []

    def get_queryset(self):
        queryset = super().get_queryset()
        is_read = self.request.query_params.get("is_read")
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() in ("true", "1"))
        return queryset


class DashboardStatsView(APIView):
    """
    GET /api/dashboard/stats/
    Computes dashboard analytics with ORM aggregation in a single query.
    Complies with DevFolio requirement B-14 / section 4 dashboard spec.
    """

    permission_classes = [IsOwnerOnly]

    def get(self, request):
        now = timezone.now()
        six_months_ago = now - timedelta(days=180)

        # 1. Post stats aggregation
        post_stats = Post.objects.aggregate(
            total_posts=Count("id"),
            published_posts=Count(
                "id", filter=Q(status=Post.Status.PUBLISHED)
            ),
            draft_posts=Count("id", filter=Q(status=Post.Status.DRAFT)),
            total_views=Sum("views_count"),
        )

        total_posts = post_stats["total_posts"] or 0
        published_posts = post_stats["published_posts"] or 0
        draft_posts = post_stats["draft_posts"] or 0
        total_views = post_stats["total_views"] or 0

        # 2. Portfolio counts
        total_projects = Project.objects.count()
        total_skills = Skill.objects.count()

        # 3. Comment stats
        comment_stats = Comment.objects.aggregate(
            total_comments=Count("id"),
            pending_comments=Count("id", filter=Q(is_approved=False)),
        )
        total_comments = comment_stats["total_comments"] or 0
        pending_comments = comment_stats["pending_comments"] or 0

        # 4. Likes & unread messages
        total_likes = PostLike.objects.count()
        unread_messages = ContactMessage.objects.filter(is_read=False).count()

        # 5. Top 5 posts by views
        top_posts_qs = (
            Post.objects.filter(status=Post.Status.PUBLISHED)
            .annotate(annotated_likes=Count("likes"))
            .order_by("-views_count")[:5]
        )
        top_posts = [
            {
                "title": p.title,
                "slug": p.slug,
                "views": p.views_count,
                "likes": p.annotated_likes,
            }
            for p in top_posts_qs
        ]

        # 6. Recent comments (latest 5)
        recent_comments_qs = Comment.objects.select_related("post").order_by(
            "-created_at"
        )[:5]
        recent_comments = [
            {
                "id": c.id,
                "post_title": c.post.title,
                "post_slug": c.post.slug,
                "name": c.name,
                "content": c.content[:80] + ("..." if len(c.content) > 80 else ""),
                "is_approved": c.is_approved,
                "created_at": c.created_at,
            }
            for c in recent_comments_qs
        ]

        # 7. Posts per month (last 6 months) using ORM TruncMonth
        monthly_posts_qs = (
            Post.objects.filter(
                status=Post.Status.PUBLISHED,
                published_at__gte=six_months_ago,
            )
            .annotate(month=TruncMonth("published_at"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )

        posts_per_month = [
            {
                "month": item["month"].strftime("%b %Y")
                if item["month"]
                else "Unknown",
                "count": item["count"],
            }
            for item in monthly_posts_qs
        ]

        return Response(
            {
                "total_posts": total_posts,
                "published_posts": published_posts,
                "draft_posts": draft_posts,
                "total_projects": total_projects,
                "total_skills": total_skills,
                "total_comments": total_comments,
                "pending_comments": pending_comments,
                "total_likes": total_likes,
                "total_views": total_views,
                "unread_messages": unread_messages,
                "top_posts": top_posts,
                "recent_comments": recent_comments,
                "posts_per_month": posts_per_month,
            }
        )