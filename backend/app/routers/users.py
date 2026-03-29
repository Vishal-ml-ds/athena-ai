"""User profile endpoints."""

from fastapi import APIRouter, Depends
from supabase import Client

from app.core.dependencies import get_supabase_client
from app.core.exceptions import NotFoundError
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext

router = APIRouter(prefix="/api/v1/users", tags=["users"])


@router.get("/me", response_model=ApiResponse[dict])
async def get_current_profile(
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Get the current user's profile with tenant info."""
    result = (
        supabase.table("profiles")
        .select("*, tenants(plan, name)")
        .eq("id", str(ctx.user_id))
        .single()
        .execute()
    )

    if not result.data:
        raise NotFoundError("Profile")

    profile = result.data
    tenant = profile.pop("tenants", {}) or {}

    return ApiResponse(
        success=True,
        data={
            "id": profile["id"],
            "tenant_id": profile["tenant_id"],
            "email": ctx.email,
            "display_name": profile["display_name"],
            "avatar_url": profile.get("avatar_url"),
            "preferences": profile.get("preferences", {}),
            "plan": tenant.get("plan", "free"),
            "onboarding_completed": profile.get("onboarding_completed", False),
        },
    )


@router.patch("/me", response_model=ApiResponse[dict])
async def update_profile(
    updates: dict,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Update profile fields. Only allows safe fields to be updated."""
    allowed_fields = {"display_name", "avatar_url", "preferences"}
    safe_updates = {k: v for k, v in updates.items() if k in allowed_fields}

    if not safe_updates:
        return ApiResponse(success=True, data={"message": "No valid fields to update"})

    supabase.table("profiles").update(safe_updates).eq(
        "id", str(ctx.user_id)
    ).execute()

    return ApiResponse(success=True, data={"message": "Profile updated"})
