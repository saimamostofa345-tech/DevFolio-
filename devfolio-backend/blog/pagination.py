from rest_framework.pagination import PageNumberPagination


class PostPagination(PageNumberPagination):
    """Complies with B-18: posts 6 per page."""
    page_size = 6
    page_size_query_param = "page_size"
    max_page_size = 50


class CommentPagination(PageNumberPagination):
    """Complies with B-18: comments 10 per page."""
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50
