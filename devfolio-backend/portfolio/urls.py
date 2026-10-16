from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    ContactMessageViewSet,
    DashboardStatsView,
    EducationViewSet,
    ExperienceViewSet,
    OwnerLoginView,
    OwnerLogoutView,
    OwnerMeView,
    ProfileView,
    ProjectViewSet,
    SkillViewSet,
    register_not_found_view,
)

router = DefaultRouter()
router.register("skills", SkillViewSet, basename="skill")
router.register("experiences", ExperienceViewSet, basename="experience")
router.register("education", EducationViewSet, basename="education")
router.register("projects", ProjectViewSet, basename="project")
router.register("contact", ContactMessageViewSet, basename="contact")

urlpatterns = [
    # Auth endpoints (B-14)
    path("auth/login/", OwnerLoginView.as_view(), name="auth-login"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("auth/logout/", OwnerLogoutView.as_view(), name="auth-logout"),
    path("auth/me/", OwnerMeView.as_view(), name="auth-me"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
    path("auth/register/", register_not_found_view, name="auth-register-block"),

    # Profile singleton endpoint (B-2)
    path("profile/", ProfileView.as_view(), name="profile"),

    # Dashboard aggregated statistics (B-14 / Wireframe 3)
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),

    # Router endpoints (skills, experiences, education, projects, contact)
    path("", include(router.urls)),
]