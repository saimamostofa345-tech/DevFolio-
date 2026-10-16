"""
Custom permission classes enforcing single-owner security.
Meets DevFolio requirements B-1, B-13, and S-1.
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow the site owner (superuser) to edit or delete content.
    Public visitors and unauthenticated users are restricted to safe methods (GET, HEAD, OPTIONS).
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


class IsOwnerOnly(permissions.BasePermission):
    """
    Permission that restricts access exclusively to the authenticated site owner (superuser).
    Used for dashboard statistics, moderation queues, contact message reading, and profile updates.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )

    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )
