"""Middleware stack — rate limiting, audit logging, request tracking.
Every request passes through these layers before reaching the endpoint."""

import time
import uuid
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.dependencies import get_redis


class RequestTrackingMiddleware(BaseHTTPMiddleware):
    """Adds a unique request_id to every request for tracing.
    The request_id is included in all responses and log entries."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        request.state.start_time = time.time()

        response = await call_next(request)

        # Add tracking headers
        duration_ms = int((time.time() - request.state.start_time) * 1000)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Redis-backed sliding window rate limiter.
    Limits are per-tenant, per-minute, based on subscription plan."""

    PLAN_LIMITS = {
        "free": 30,
        "pro": 120,
        "ultra": 300,
        "developer": 600,
    }

    # Paths that skip rate limiting
    EXEMPT_PATHS = {"/health", "/api/v1/auth/login", "/api/v1/auth/signup"}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for exempt paths
        if request.url.path in self.EXEMPT_PATHS:
            return await call_next(request)

        # Skip for non-authenticated requests (auth middleware handles rejection)
        tenant_context = getattr(request.state, "tenant_context", None)
        if tenant_context is None:
            return await call_next(request)

        try:
            redis_client = await get_redis()
            plan = tenant_context.plan
            limit = self.PLAN_LIMITS.get(plan, self.PLAN_LIMITS["free"])
            tenant_id = str(tenant_context.tenant_id)

            # Sliding window: count requests in current minute
            window_key = f"rate:{tenant_id}:{int(time.time()) // 60}"
            current_count = await redis_client.incr(window_key)

            if current_count == 1:
                await redis_client.expire(window_key, 60)

            # Add rate limit headers
            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(max(0, limit - current_count))
            response.headers["X-RateLimit-Reset"] = str(
                ((int(time.time()) // 60) + 1) * 60
            )

            if current_count > limit:
                from fastapi.responses import JSONResponse

                return JSONResponse(
                    status_code=429,
                    content={
                        "success": False,
                        "data": None,
                        "error": {
                            "code": "RATE_LIMIT_EXCEEDED",
                            "message": f"Rate limit exceeded ({limit}/min for {plan} plan). Upgrade for higher limits.",
                        },
                    },
                    headers={
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                        "Retry-After": "60",
                    },
                )

            return response
        except Exception:
            # If Redis is down, don't block requests — fail open
            return await call_next(request)
