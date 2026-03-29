"""Shared Pydantic models used across all endpoints."""

from datetime import datetime
from typing import Any, Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field

T = TypeVar("T")


class ResponseMeta(BaseModel):
    """Metadata included in every API response."""

    request_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response wrapper.
    Every endpoint returns this shape — consistent for frontend consumption."""

    success: bool
    data: T | None = None
    error: dict[str, Any] | None = None
    meta: ResponseMeta | None = None


class PaginationParams(BaseModel):
    """Standard pagination parameters."""

    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class PaginatedResponse(BaseModel, Generic[T]):
    """Response with pagination metadata."""

    items: list[T]
    total: int
    limit: int
    offset: int
    has_more: bool


class TenantContext(BaseModel):
    """Resolved tenant + user context from JWT.
    Injected into every authenticated endpoint via dependency."""

    user_id: UUID
    tenant_id: UUID
    email: str
    plan: str = "free"
