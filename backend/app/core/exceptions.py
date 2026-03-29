"""Custom exceptions and error handlers for ATHENA API."""

from fastapi import Request, status
from fastapi.responses import JSONResponse


class AthenaError(Exception):
    """Base exception for all ATHENA errors."""

    def __init__(self, message: str, code: str, status_code: int = 500):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


class AuthenticationError(AthenaError):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, "AUTHENTICATION_ERROR", status.HTTP_401_UNAUTHORIZED)


class AuthorizationError(AthenaError):
    """Raised when user lacks permission."""

    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, "AUTHORIZATION_ERROR", status.HTTP_403_FORBIDDEN)


class NotFoundError(AthenaError):
    """Raised when a resource is not found."""

    def __init__(self, resource: str = "Resource"):
        super().__init__(f"{resource} not found", "NOT_FOUND", status.HTTP_404_NOT_FOUND)


class ValidationError(AthenaError):
    """Raised when input validation fails."""

    def __init__(self, message: str = "Invalid input"):
        super().__init__(message, "VALIDATION_ERROR", status.HTTP_422_UNPROCESSABLE_ENTITY)


class RateLimitError(AthenaError):
    """Raised when rate limit is exceeded."""

    def __init__(self, message: str = "Rate limit exceeded. Please try again later."):
        super().__init__(message, "RATE_LIMIT_EXCEEDED", status.HTTP_429_TOO_MANY_REQUESTS)


class ExternalServiceError(AthenaError):
    """Raised when an external service (OpenAI, etc.) fails."""

    def __init__(self, service: str, message: str = "Service unavailable"):
        super().__init__(
            f"{service}: {message}",
            "EXTERNAL_SERVICE_ERROR",
            status.HTTP_502_BAD_GATEWAY,
        )


async def athena_error_handler(_request: Request, exc: AthenaError) -> JSONResponse:
    """Global error handler — returns consistent JSON error responses.
    Never exposes stack traces or internal details to users."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": exc.code,
                "message": exc.message,
            },
        },
    )
