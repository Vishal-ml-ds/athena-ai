"""Analytics endpoints — usage metrics and agent performance."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from supabase import Client

from app.core.dependencies import get_supabase_client
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext

router = APIRouter(prefix="/api/v1/analytics", tags=["analytics"])


@router.get("/usage", response_model=ApiResponse[dict])
async def get_usage(
    days: int = Query(default=30, ge=7, le=90),
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Get token usage and conversation statistics for the given time window."""
    # Fetch conversation IDs for this user within the time window
    convs_result = (
        supabase.table("conversations")
        .select("id", count="exact")
        .eq("user_id", str(ctx.user_id))
        .gte("created_at", (datetime.now(timezone.utc) - timedelta(days=days)).isoformat())
        .execute()
    )
    conversation_ids = [row["id"] for row in (convs_result.data or [])]
    conversation_count = convs_result.count or 0

    message_count = 0
    tokens_used = 0

    if conversation_ids:
        msgs_result = (
            supabase.table("messages")
            .select("tokens_used")
            .in_("conversation_id", conversation_ids)
            .execute()
        )
        rows = msgs_result.data or []
        message_count = len(rows)
        tokens_used = sum(row.get("tokens_used") or 0 for row in rows)

    return ApiResponse(success=True, data={
        "conversations": conversation_count,
        "messages": message_count,
        "tokens_used": tokens_used,
        "plan": ctx.plan,
        "days": days,
    })


@router.get("/agent-distribution", response_model=ApiResponse[list])
async def get_agent_distribution(
    days: int = Query(default=30, ge=7, le=90),
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Return message counts grouped by agent for assistant messages."""
    # Get conversation IDs for this user
    convs_result = (
        supabase.table("conversations")
        .select("id")
        .eq("user_id", str(ctx.user_id))
        .gte("created_at", (datetime.now(timezone.utc) - timedelta(days=days)).isoformat())
        .execute()
    )
    conversation_ids = [row["id"] for row in (convs_result.data or [])]

    if not conversation_ids:
        return ApiResponse(success=True, data=[])

    msgs_result = (
        supabase.table("messages")
        .select("agent_name")
        .in_("conversation_id", conversation_ids)
        .eq("role", "assistant")
        .not_.is_("agent_name", "null")
        .execute()
    )

    # Aggregate counts in Python — no RPC needed
    counts: dict[str, int] = {}
    for row in (msgs_result.data or []):
        agent = row.get("agent_name") or "unknown"
        counts[agent] = counts.get(agent, 0) + 1

    distribution = [
        {"agent": agent, "count": count}
        for agent, count in sorted(counts.items(), key=lambda x: -x[1])
    ]

    return ApiResponse(success=True, data=distribution)
