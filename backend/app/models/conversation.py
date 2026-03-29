"""Conversation and message models."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CreateConversationRequest(BaseModel):
    """Create a new conversation."""

    title: str = Field(default="New Conversation", max_length=200)


class ConversationResponse(BaseModel):
    """Conversation data returned to the client."""

    id: UUID
    title: str
    agent_type: str = "supervisor"
    created_at: datetime
    updated_at: datetime


class SendMessageRequest(BaseModel):
    """Send a message in a conversation."""

    content: str = Field(min_length=1, max_length=10000)
    attachments: list[UUID] = Field(default_factory=list)


class MessageResponse(BaseModel):
    """Single message in a conversation."""

    id: UUID
    conversation_id: UUID
    role: str
    content: str
    agent_name: str | None = None
    tokens_used: int = 0
    model: str | None = None
    latency_ms: int | None = None
    created_at: datetime


class ConversationWithMessages(BaseModel):
    """Conversation with its full message history."""

    id: UUID
    title: str
    agent_type: str
    messages: list[MessageResponse]
    created_at: datetime
    updated_at: datetime
