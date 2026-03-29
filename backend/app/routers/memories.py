"""Memory CRUD + search endpoints."""

from fastapi import APIRouter, Depends, Query
from supabase import Client

from app.core.dependencies import get_supabase_client
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext
from app.services.memory_service import (
    delete_memory,
    get_all_memories,
    search_memories,
)

router = APIRouter(prefix="/api/v1/memories", tags=["memories"])


@router.get("", response_model=ApiResponse[dict])
async def list_memories(
    memory_type: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """List all memories for the current user."""
    memories, total = await get_all_memories(
        user_id=str(ctx.user_id),
        supabase=supabase,
        memory_type=memory_type,
        limit=limit,
        offset=offset,
    )

    return ApiResponse(
        success=True,
        data={
            "items": memories,
            "total": total,
            "limit": limit,
            "offset": offset,
        },
    )


@router.post("/search", response_model=ApiResponse[list])
async def search_user_memories(
    body: dict,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Search memories by text query."""
    query = body.get("query", "")
    if not query:
        return ApiResponse(success=True, data=[])

    results = await search_memories(
        query=query,
        user_id=str(ctx.user_id),
        supabase=supabase,
        limit=body.get("limit", 10),
    )

    return ApiResponse(success=True, data=results)


@router.delete("/{memory_id}", response_model=ApiResponse[dict])
async def remove_memory(
    memory_id: str,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Delete a specific memory."""
    deleted = await delete_memory(
        memory_id=memory_id,
        user_id=str(ctx.user_id),
        supabase=supabase,
    )

    if not deleted:
        return ApiResponse(success=False, error={"code": "NOT_FOUND", "message": "Memory not found"})

    return ApiResponse(success=True, data={"message": "Memory deleted"})
