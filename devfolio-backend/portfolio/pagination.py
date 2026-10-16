from rest_framework.pagination import PageNumberPagination


class ProjectPagination(PageNumberPagination):
    """Complies with B-18: projects 9 per page."""
    page_size = 9
    page_size_query_param = "page_size"
    max_page_size = 50


class ContactPagination(PageNumberPagination):
    """Complies with B-18: messages 10 per page."""
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50
