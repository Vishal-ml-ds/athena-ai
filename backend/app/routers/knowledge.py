"""Knowledge graph endpoints."""

from fastapi import APIRouter, Depends
from supabase import Client

from app.core.dependencies import get_supabase_client
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext
from app.services.knowledge_service import get_knowledge_graph

router = APIRouter(prefix="/api/v1/knowledge", tags=["knowledge"])


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
