from django.urls import path
from .views import OwnerLoginView

urlpatterns = [
    path("login/", OwnerLoginView.as_view(), name="owner-login"),
]


path("api/auth/", include("apps.accounts.urls")),