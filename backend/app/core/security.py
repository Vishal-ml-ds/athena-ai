"""Authentication and authorization middleware.
Validates Supabase JWTs, resolves tenant context, enforces access control."""

from uuid import UUID

import jwt
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.core.exceptions import AuthenticationError
from app.models.common import TenantContext

security_scheme = HTTPBearer(auto_error=False)


def _decode_supabase_jwt(token: str, settings: Settings) -> dict:
    """Decode and validate a Supabase JWT.
    Uses the anon key as the JWT secret (Supabase's default HMAC signing)."""
    try:
        payload = jwt.decode(
            token,
            settings.supabase_anon_key,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationError("Token expired")
    except jwt.InvalidTokenError:
        raise AuthenticationError("Invalid token")


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    settings: Settings = Depends(get_settings),
) -> TenantContext:
    """Extract and validate user identity from the request.
    This is the primary auth dependency — inject into every protected endpoint.

    Flow: JWT → decode → extract user_id → query profile for tenant_id + plan.
    """
    if credentials is None:
        raise AuthenticationError("Missing authorization header")

    token = credentials.credentials
    payload = _decode_supabase_jwt(token, settings)

    user_id = payload.get("sub")
    email = payload.get("email", "")

    if not user_id:
        raise AuthenticationError("Invalid token: missing user ID")

    # Extract tenant_id from user_metadata (set during signup)
    user_metadata = payload.get("user_metadata", {})
    tenant_id = user_metadata.get("tenant_id")
    plan = user_metadata.get("plan", "free")

    if not tenant_id:
        # Fallback: for new users, tenant_id might not be in JWT yet
        # The signup flow should set this, but handle gracefully
        tenant_id = user_id  # Use user_id as tenant_id for single-user tenants

    return TenantContext(
        user_id=UUID(user_id),
        tenant_id=UUID(tenant_id),
        email=email,
        plan=plan,
    )
