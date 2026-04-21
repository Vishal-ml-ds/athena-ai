"""Auth endpoints — signup, login, refresh, onboarding."""

import uuid

from fastapi import APIRouter, Depends
from supabase import Client

from app.core.dependencies import get_supabase_admin, get_supabase_client
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
async def signup(body: SignupRequest):
    """Create a new account.
    Flow: admin-create auth user (email auto-confirmed) → create tenant → create profile
    → sign in to issue tokens.

    Uses two isolated clients:
      - `admin` (service role) for DB writes — never has its auth state mutated.
      - `sign_in` (service role, separate instance) for password sign-in to get tokens.
    This avoids the supabase-py singleton auth-state pollution that previously caused
    tenant/profile INSERTs to run under the new user's JWT and fail RLS.
    """
    admin = get_supabase_admin()
    sign_in = get_supabase_admin()
    tenant_id = str(uuid.uuid4())

    try:
        created = admin.auth.admin.create_user(
            {
                "email": body.email,
                "password": body.password,
                "email_confirm": True,
                "user_metadata": {
                    "display_name": body.display_name,
                    "tenant_id": tenant_id,
                    "plan": "free",
                },
            }
        )

        if not created.user:
            raise ValidationError("Failed to create account. Email may already be registered.")

        user_id = created.user.id

        admin.table("tenants").insert(
            {
                "id": tenant_id,
                "name": f"{body.display_name}'s Workspace",
                "plan": "free",
                "settings": {},
            }
        ).execute()

        admin.table("profiles").insert(
            {
                "id": user_id,
                "tenant_id": tenant_id,
                "display_name": body.display_name,
                "preferences": {"timezone": "UTC", "language": "en", "theme": "dark"},
                "onboarding_completed": False,
            }
        ).execute()

        session = sign_in.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
        if not session.session:
            raise ValidationError("Account created but sign-in failed. Try logging in manually.")

        return ApiResponse(
            success=True,
            data=AuthResponse(
                user_id=user_id,
                tenant_id=tenant_id,
                access_token=session.session.access_token,
                refresh_token=session.session.refresh_token,
            ),
        )

    except ValidationError:
        raise
    except Exception as e:
        raise ValidationError(f"Signup failed: {str(e)}")


@router.post("/login", response_model=ApiResponse[AuthResponse])
async def login(body: LoginRequest):
    """Log in with email and password."""
    supabase = get_supabase_admin()
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
async def refresh_token(body: RefreshRequest):
    """Refresh an expired access token."""
    supabase = get_supabase_admin()
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
    """Complete the onboarding flow — sets display name, timezone, interests, and all preferences."""
    update_data: dict = {
        "display_name": body.display_name,
        "preferences": {
            "timezone": body.timezone,
            "interests": body.interests,
            "language": body.language,
            "theme": body.theme,
            "voice": body.voice,
        },
        "onboarding_completed": True,
    }

    if body.avatar_url:
        update_data["avatar_url"] = body.avatar_url

    supabase.table("profiles").update(update_data).eq("id", str(ctx.user_id)).execute()

    return ApiResponse(success=True, data={"message": "Onboarding complete"})
