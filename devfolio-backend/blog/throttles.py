"""
DRF Scoped Throttles complying with DevFolio requirement B-17.
- anonymous: 20/min global
- comment creation: 5/hour per IP
- contact form: 3/hour per IP
- like toggle: 30/min per IP/Visitor
"""

from rest_framework.throttling import ScopedRateThrottle, SimpleRateThrottle


class CommentCreateThrottle(ScopedRateThrottle):
    scope = "comment_create"


class LikeToggleThrottle(SimpleRateThrottle):
    scope = "like_toggle"

    def get_cache_key(self, request, view):
        # Throttle by X-Visitor-Id header if present, otherwise by IP
        visitor_id = request.headers.get("X-Visitor-Id")
        if visitor_id:
            return f"throttle_like_{visitor_id}"
        return self.get_ident(request)


class ContactCreateThrottle(ScopedRateThrottle):
    scope = "contact_create"