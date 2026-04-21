"""Knowledge graph endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import Client

from app.core.dependencies import get_supabase_client
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext
from app.services.knowledge_service import get_knowledge_graph

router = APIRouter(prefix="/api/v1/knowledge", tags=["knowledge"])


class UpdateNodeRequest(BaseModel):
    name: str | None = None
    description: str | None = None


@router.get("/graph", response_model=ApiResponse[dict])
async def get_graph(
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Get the user's full knowledge graph (nodes + edges)."""
    graph = await get_knowledge_graph(
        user_id=str(ctx.user_id),
        supabase=supabase,
    )
    return ApiResponse(success=True, data=graph)


@router.patch("/nodes/{node_id}", response_model=ApiResponse[dict])
async def update_node(
    node_id: str,
    body: UpdateNodeRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Update a knowledge node's name or description."""
    # Verify ownership
    existing = (
        supabase.table("knowledge_nodes")
        .select("id")
        .eq("id", node_id)
        .eq("user_id", str(ctx.user_id))
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")

    updates: dict = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.description is not None:
        updates["description"] = body.description

    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    result = (
        supabase.table("knowledge_nodes")
        .update(updates)
        .eq("id", node_id)
        .execute()
    )
    return ApiResponse(success=True, data=result.data[0] if result.data else {})


@router.delete("/nodes/{node_id}", response_model=ApiResponse[dict])
async def delete_node(
    node_id: str,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Delete a knowledge node and all its connected edges."""
    # Verify ownership
    existing = (
        supabase.table("knowledge_nodes")
        .select("id, name")
        .eq("id", node_id)
        .eq("user_id", str(ctx.user_id))
        .single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")

    node_name = existing.data["name"]

    # Delete edges connected to this node (by name — schema uses names not IDs for edges)
    supabase.table("knowledge_edges").delete().eq("user_id", str(ctx.user_id)).or_(
        f"source_name.eq.{node_name},target_name.eq.{node_name}"
    ).execute()

    # Delete the node
    supabase.table("knowledge_nodes").delete().eq("id", node_id).execute()

    return ApiResponse(success=True, data={"message": "Node and connected edges deleted"})
