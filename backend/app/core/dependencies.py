"""Dependency injection — database clients, Redis, and shared resources.
All external connections are created here and injected into routers/services."""

from functools import lru_cache

import redis.asyncio as aioredis
from supabase import Client, create_client

from app.core.config import Settings, get_settings


@lru_cache()
def get_supabase_client() -> Client:
    """Supabase client using service role key for server-side operations.
    Service role bypasses RLS — use carefully, always filter by tenant_id."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def get_supabase_admin() -> Client:
    """Fresh service-role client — NOT cached.
    Use for auth flows (sign_up, admin.create_user) where supabase-py mutates the
    client's Authorization header and would poison a singleton for subsequent requests.
    """
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


@lru_cache()
def get_supabase_anon_client() -> Client:
    """Supabase client using anon key — respects RLS policies.
    Use this when the JWT is passed through for user-scoped queries."""
    settings = get_settings()
    return create_client(settings.supabase_url, settings.supabase_anon_key)


_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis:
    """Async Redis client — singleton, reused across requests.
    Used for rate limiting, caching, and session storage."""
    global _redis_client
    if _redis_client is None:
        settings = get_settings()
        try:
            _redis_client = aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
            )
            # Quick ping to verify connection works
            await _redis_client.ping()
        except Exception:
            _redis_client = None
            raise
    return _redis_client


async def close_redis() -> None:
    """Cleanup Redis connection on shutdown."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None
