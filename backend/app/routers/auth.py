"""Auth endpoints — signup, login, refresh, onboarding."""

import uuid

from fastapi import APIRouter, Depends
from supabase import Client

from app.core.dependencies import get_supabase_client
from app.core.exceptions import AuthenticationError, ValidationError
from app.core.security import get_current_user
from app.models.auth import (
    AuthResponse,
    LoginRequest,
    OnboardingRequest,
    RefreshRequest,
    SignupRequest,
)
from app.models.common import ApiResponse, TenantContext

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/signup", response_model=ApiResponse[AuthResponse], status_code=201)
async def signup(
    body: SignupRequest,
    supabase: Client = Depends(get_supabase_client),
):
    """Create a new account.
    Flow: create auth user → create tenant → create profile → return tokens."""
    try:
        # 1. Create auth user in Supabase
        tenant_id = str(uuid.uuid4())
        auth_response = supabase.auth.sign_up(
            {
                "email": body.email,
                "password": body.password,
                "options": {
                    "data": {
                        "display_name": body.display_name,
                        "tenant_id": tenant_id,
                        "plan": "free",
                    }
                },
            }
        )

        if not auth_response.user:
            raise ValidationError("Failed to create account. Email may already be registered.")

        user_id = auth_response.user.id

        # 2. Create tenant
        supabase.table("tenants").insert(
            {
                "id": tenant_id,
                "name": f"{body.display_name}'s Workspace",
                "plan": "free",
                "settings": {},
            }
        ).execute()

        # 3. Create profile
        supabase.table("profiles").insert(
            {
                "id": user_id,
                "tenant_id": tenant_id,
                "display_name": body.display_name,
                "preferences": {"timezone": "UTC", "language": "en", "theme": "dark"},
                "onboarding_completed": False,
            }
        ).execute()

        return ApiResponse(
            success=True,
            data=AuthResponse(
                user_id=user_id,
                tenant_id=tenant_id,
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
            ),
        )

    except ValidationError:
        raise
    except Exception as e:
        raise ValidationError(f"Signup failed: {str(e)}")


@router.post("/login", response_model=ApiResponse[AuthResponse])
async def login(
    body: LoginRequest,
    supabase: Client = Depends(get_supabase_client),
):
    """Log in with email and password."""
    try:
        auth_response = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )

        if not auth_response.user or not auth_response.session:
            raise AuthenticationError("Invalid email or password")

        user_metadata = auth_response.user.user_metadata or {}
        tenant_id = user_metadata.get("tenant_id", auth_response.user.id)

        return ApiResponse(
            success=True,
            data=AuthResponse(
                user_id=auth_response.user.id,
                tenant_id=tenant_id,
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
            ),
        )

    except AuthenticationError:
        raise
    except Exception:
        raise AuthenticationError("Invalid email or password")


@router.post("/refresh", response_model=ApiResponse[AuthResponse])
async def refresh_token(
    body: RefreshRequest,
    supabase: Client = Depends(get_supabase_client),
):
    """Refresh an expired access token."""
    try:
        auth_response = supabase.auth.refresh_session(body.refresh_token)

        if not auth_response.user or not auth_response.session:
            raise AuthenticationError("Invalid refresh token")

        user_metadata = auth_response.user.user_metadata or {}
        tenant_id = user_metadata.get("tenant_id", auth_response.user.id)

        return ApiResponse(
            success=True,
            data=AuthResponse(
                user_id=auth_response.user.id,
                tenant_id=tenant_id,
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
            ),
        )

    except Exception:
        raise AuthenticationError("Invalid or expired refresh token")


@router.post("/onboarding", response_model=ApiResponse[dict])
async def complete_onboarding(
    body: OnboardingRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Complete the onboarding flow — sets display name, timezone, interests."""
    supabase.table("profiles").update(
        {
            "display_name": body.display_name,
            "preferences": {
                "timezone": body.timezone,
                "interests": body.interests,
                "language": "en",
                "theme": "dark",
            },
            "onboarding_completed": True,
        }
    ).eq("id", str(ctx.user_id)).execute()

    return ApiResponse(success=True, data={"message": "Onboarding complete"})
