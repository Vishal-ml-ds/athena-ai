"""Authentication and authorization middleware.
Validates Supabase JWTs via Supabase's own auth API — no local decoding needed."""

from uuid import UUID

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.core.dependencies import get_supabase_client
from app.core.exceptions import AuthenticationError
from app.models.common import TenantContext

security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    settings: Settings = Depends(get_settings),
) -> TenantContext:
    """Validate token via Supabase auth API and extract user context."""
    if credentials is None:
        raise AuthenticationError("Missing authorization header")

    token = credentials.credentials

    try:
        supabase = get_supabase_client()
        user_response = supabase.auth.get_user(token)
        user = user_response.user

        if not user:
            raise AuthenticationError("Invalid token")

        user_id = user.id
        email = user.email or ""
        user_metadata = user.user_metadata or {}

        tenant_id = user_metadata.get("tenant_id", str(user_id))
        plan = user_metadata.get("plan", "free")

        return TenantContext(
            user_id=UUID(str(user_id)),
            tenant_id=UUID(tenant_id),
            email=email,
            plan=plan,
        )

    except AuthenticationError:
        raise
    except Exception:
        raise AuthenticationError("Invalid or expired token")
