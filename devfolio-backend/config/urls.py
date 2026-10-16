"""
Root URL configuration for DevFolio backend.
Base path for all API resources is /api/.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # Django Admin (restricted to superuser/staff)
    path("admin/", admin.site.urls),

    # DevFolio REST API endpoints
    path("api/", include("portfolio.urls")),
    path("api/", include("blog.urls")),
]

# Serve media and static files in DEBUG mode (B-23)
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT,
    )
