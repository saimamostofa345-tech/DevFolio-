from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    CommentModerationViewSet,
    PostViewSet,
    TagViewSet,
)

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("tags", TagViewSet, basename="tag")
router.register("posts", PostViewSet, basename="post")
router.register("comments", CommentModerationViewSet, basename="comment")

urlpatterns = [
    path("", include(router.urls)),
]