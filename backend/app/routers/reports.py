"""Reports router — generate and retrieve weekly AI reports."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from supabase import Client

from app.core.dependencies import get_supabase_client
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext
from app.services.report_service import generate_weekly_report

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])


@router.get("/weekly", response_model=ApiResponse[dict])
async def get_weekly_report(
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Generate a fresh weekly report with AI insights.

    Aggregates habits, goals, finance, and health data from the last 7 days.
    Uses LLM to generate personalized insights and actionable nudges."""

    report = await generate_weekly_report(
        user_id=str(ctx.user_id),
        supabase=supabase,
    )

    return ApiResponse(success=True, data=report)


@router.get("/history", response_model=ApiResponse[list])
async def get_report_history(
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Get past weekly reports."""
    result = (
        supabase.table("reports")
        .select("id, report_type, period_start, period_end, created_at")
        .eq("user_id", str(ctx.user_id))
        .order("created_at", desc=True)
        .limit(12)
        .execute()
    )

    return ApiResponse(success=True, data=result.data or [])
