"""Shared test fixtures for ATHENA backend tests."""

from __future__ import annotations

import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# Set dummy env vars BEFORE importing app modules so pydantic-settings doesn't fail
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-key")
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test")
os.environ.setdefault("EURI_API_KEY", "euri-test-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")


@pytest.fixture
def mock_supabase():
    """Mock Supabase client — prevents any real DB calls."""
    mock = MagicMock()
    # Chain builder returns itself so .select().eq().execute() works
    mock.table.return_value = mock
    mock.select.return_value = mock
    mock.insert.return_value = mock
    mock.update.return_value = mock
    mock.delete.return_value = mock
    mock.upsert.return_value = mock
    mock.eq.return_value = mock
    mock.neq.return_value = mock
    mock.in_.return_value = mock
    mock.gte.return_value = mock
    mock.lte.return_value = mock
    mock.order.return_value = mock
    mock.limit.return_value = mock
    mock.not_.return_value = mock
    mock.or_.return_value = mock
    mock.single.return_value = mock
    mock.rpc.return_value = mock
    mock.execute.return_value = MagicMock(data=[], count=0)
    return mock


@pytest.fixture
def mock_tenant_context():
    """Mock authenticated user context."""
    import uuid
    from app.models.common import TenantContext
    return TenantContext(
        user_id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
        tenant_id=uuid.UUID("00000000-0000-0000-0000-000000000002"),
        plan="free",
        email="test@example.com",
    )
