import logging
import time

logger = logging.getLogger("devfolio.middleware")


class ResponseTimeLoggingMiddleware:
    """
    Middleware that logs: METHOD /path -> status (xx ms)
    and attaches an X-Response-Time header to the HTTP response.
    Complies with DevFolio requirement B-19.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.perf_counter()

        response = self.get_response(request)

        duration_ms = (time.perf_counter() - start_time) * 1000
        duration_formatted = f"{duration_ms:.2f}ms"

        # Attach custom header
        response["X-Response-Time"] = duration_formatted

        # Log request summary
        log_message = (
            f"{request.method} {request.get_full_path()} -> "
            f"{response.status_code} ({duration_formatted})"
        )
        logger.info(log_message)
        print(log_message)

        return response
