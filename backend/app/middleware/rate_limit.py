from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Stub rate-limiting middleware. Replace with redis-backed implementation."""

    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def dispatch(self, request: Request, call_next):
        # TODO: Implement per-IP rate limiting via Redis
        response = await call_next(request)
        return response
