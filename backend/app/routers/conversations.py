"""Conversation and message endpoints.
Handles CRUD for conversations and SSE streaming for agent responses."""

import json
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from supabase import Client

from app.agents.supervisor import run_agent
from app.core.dependencies import get_supabase_client
from app.core.exceptions import NotFoundError
from app.core.security import get_current_user
from app.models.common import ApiResponse, PaginationParams, TenantContext
from app.models.conversation import (
    ConversationResponse,
    ConversationWithMessages,
    CreateConversationRequest,
    MessageResponse,
    SendMessageRequest,
)

router = APIRouter(prefix="/api/v1/conversations", tags=["conversations"])


@router.post("", response_model=ApiResponse[ConversationResponse], status_code=201)
async def create_conversation(
    body: CreateConversationRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Create a new conversation."""
    now = datetime.now(timezone.utc).isoformat()
    conversation_id = str(uuid.uuid4())

    result = (
        supabase.table("conversations")
        .insert(
            {
                "id": conversation_id,
                "user_id": str(ctx.user_id),
                "tenant_id": str(ctx.tenant_id),
                "title": body.title,
                "agent_type": "supervisor",
                "metadata": {},
                "created_at": now,
                "updated_at": now,
            }
        )
        .execute()
    )

    conv = result.data[0]
    return ApiResponse(
        success=True,
        data=ConversationResponse(
            id=conv["id"],
            title=conv["title"],
            agent_type=conv["agent_type"],
            created_at=conv["created_at"],
            updated_at=conv["updated_at"],
        ),
    )


@router.get("", response_model=ApiResponse[list[ConversationResponse]])
async def list_conversations(
    pagination: PaginationParams = Depends(),
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """List conversations for the current user, newest first."""
    result = (
        supabase.table("conversations")
        .select("*")
        .eq("user_id", str(ctx.user_id))
        .eq("tenant_id", str(ctx.tenant_id))
        .order("updated_at", desc=True)
        .range(pagination.offset, pagination.offset + pagination.limit - 1)
        .execute()
    )

    conversations = [
        ConversationResponse(
            id=c["id"],
            title=c["title"],
            agent_type=c["agent_type"],
            created_at=c["created_at"],
            updated_at=c["updated_at"],
        )
        for c in result.data
    ]

    return ApiResponse(success=True, data=conversations)


@router.get("/{conversation_id}", response_model=ApiResponse[ConversationWithMessages])
async def get_conversation(
    conversation_id: str,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Get a conversation with all its messages."""
    # Fetch conversation (tenant-scoped)
    conv_result = (
        supabase.table("conversations")
        .select("*")
        .eq("id", conversation_id)
        .eq("user_id", str(ctx.user_id))
        .single()
        .execute()
    )

    if not conv_result.data:
        raise NotFoundError("Conversation")

    conv = conv_result.data

    # Fetch messages
    msg_result = (
        supabase.table("messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .execute()
    )

    messages = [
        MessageResponse(
            id=m["id"],
            conversation_id=m["conversation_id"],
            role=m["role"],
            content=m["content"],
            agent_name=m.get("agent_name"),
            tokens_used=m.get("tokens_used", 0),
            model=m.get("model"),
            latency_ms=m.get("latency_ms"),
            created_at=m["created_at"],
        )
        for m in msg_result.data
    ]

    return ApiResponse(
        success=True,
        data=ConversationWithMessages(
            id=conv["id"],
            title=conv["title"],
            agent_type=conv["agent_type"],
            messages=messages,
            created_at=conv["created_at"],
            updated_at=conv["updated_at"],
        ),
    )


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    body: SendMessageRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Send a message and receive a streamed agent response via SSE.

    Returns: text/event-stream with JSON events:
    - agent_start: which agent is responding
    - token: incremental response text
    - agent_end: agent finished with metrics
    - done: full response with message_id
    """
    # Verify conversation belongs to user
    conv_result = (
        supabase.table("conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", str(ctx.user_id))
        .single()
        .execute()
    )

    if not conv_result.data:
        raise NotFoundError("Conversation")

    # Save user message
    user_message_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    supabase.table("messages").insert(
        {
            "id": user_message_id,
            "conversation_id": conversation_id,
            "role": "user",
            "content": body.content,
            "created_at": now,
        }
    ).execute()

    # Fetch conversation history for context
    history_result = (
        supabase.table("messages")
        .select("role, content")
        .eq("conversation_id", conversation_id)
        .order("created_at", desc=False)
        .limit(20)  # Last 20 messages for context window
        .execute()
    )

    conversation_history = history_result.data

    async def event_stream():
        """Generate SSE events from the agent's streaming response."""
        assistant_message_id = str(uuid.uuid4())
        full_content = ""
        agent_name = "general"
        model_used = ""
        tokens_used = 0
        latency_ms = 0

        async for event in run_agent(
            message=body.content,
            user_id=str(ctx.user_id),
            tenant_id=str(ctx.tenant_id),
            conversation_history=conversation_history,
        ):
            event_type = event["type"]

            if event_type == "done":
                full_content = event["full_content"]
                agent_name = event.get("agent_name", "general")
                model_used = event.get("model", "")
                tokens_used = event.get("tokens_used", 0)
                latency_ms = event.get("latency_ms", 0)

                # Save assistant message to database
                msg_now = datetime.now(timezone.utc).isoformat()
                supabase.table("messages").insert(
                    {
                        "id": assistant_message_id,
                        "conversation_id": conversation_id,
                        "role": "assistant",
                        "content": full_content,
                        "agent_name": agent_name,
                        "model": model_used,
                        "tokens_used": tokens_used,
                        "latency_ms": latency_ms,
                        "created_at": msg_now,
                    }
                ).execute()

                # Update conversation's updated_at
                supabase.table("conversations").update(
                    {"updated_at": msg_now}
                ).eq("id", conversation_id).execute()

                yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_message_id, 'total_tokens': tokens_used})}\n\n"
            else:
                yield f"data: {json.dumps(event)}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.delete("/{conversation_id}", response_model=ApiResponse[dict])
async def delete_conversation(
    conversation_id: str,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Delete a conversation and all its messages."""
    # Verify ownership
    conv_result = (
        supabase.table("conversations")
        .select("id")
        .eq("id", conversation_id)
        .eq("user_id", str(ctx.user_id))
        .single()
        .execute()
    )

    if not conv_result.data:
        raise NotFoundError("Conversation")

    # Delete messages first (FK constraint)
    supabase.table("messages").delete().eq(
        "conversation_id", conversation_id
    ).execute()

    # Delete conversation
    supabase.table("conversations").delete().eq("id", conversation_id).execute()

    return ApiResponse(success=True, data={"message": "Conversation deleted"})
