"""Memory service — ATHENA's long-term memory system.

Extracts facts from conversations, stores with embeddings,
and retrieves relevant memories for context injection."""

import json
from uuid import UUID

import httpx
from supabase import Client

from app.core.config import get_settings


async def extract_memories(
    conversation_messages: list[dict],
    user_id: str,
    tenant_id: str,
    supabase: Client,
) -> list[dict]:
    """Extract memorable facts from a conversation and store them.

    Runs after each assistant response. Uses the LLM to identify
    facts, preferences, events worth remembering."""

    settings = get_settings()

    # Only extract from the last exchange (user + assistant)
    recent = conversation_messages[-4:] if len(conversation_messages) > 4 else conversation_messages
    conversation_text = "\n".join(
        f"{m['role'].upper()}: {m['content'][:500]}" for m in recent
    )

    extraction_prompt = f"""Analyze this conversation and extract any facts, preferences, or events worth remembering about the user.

Conversation:
{conversation_text}

Extract 0-3 memories. Each memory should be a single, clear fact.
Respond in JSON array format:
[{{"content": "User prefers morning workouts", "type": "preference", "importance": 0.7}},
 {{"content": "User has a meeting with Sarah on Monday", "type": "event", "importance": 0.8}}]

Types: fact, preference, event, relationship, insight
Importance: 0.0 (trivial) to 1.0 (critical)

If nothing worth remembering, return: []"""

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                f"{settings.euri_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.euri_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "Extract memories from conversations. Respond only in valid JSON array."},
                        {"role": "user", "content": extraction_prompt},
                    ],
                    "temperature": 0.1,
                    "max_tokens": 300,
                },
            )

            if response.status_code != 200:
                return []

            content = response.json()["choices"][0]["message"]["content"]
            content = content.strip().removeprefix("```json").removesuffix("```").strip()
            memories = json.loads(content)

            if not isinstance(memories, list) or len(memories) == 0:
                return []

            # Generate embeddings and store each memory
            stored = []
            for mem in memories[:3]:  # Max 3 per extraction
                embedding = await _generate_embedding(mem["content"])

                supabase.table("memories").insert({
                    "user_id": user_id,
                    "tenant_id": tenant_id,
                    "content": mem["content"],
                    "embedding": embedding,
                    "memory_type": mem.get("type", "fact"),
                    "importance": mem.get("importance", 0.5),
                    "source": "conversation",
                    "metadata": {},
                }).execute()

                stored.append(mem)

            return stored

    except Exception:
        return []


async def retrieve_memories(
    query: str,
    user_id: str,
    supabase: Client,
    limit: int = 5,
) -> list[dict]:
    """Retrieve relevant memories for a given query using semantic search.

    Uses pgvector cosine similarity to find the most relevant memories."""

    embedding = await _generate_embedding(query)

    if not embedding:
        return []

    try:
        # pgvector similarity search via Supabase RPC
        result = supabase.rpc(
            "match_memories",
            {
                "query_embedding": embedding,
                "match_user_id": user_id,
                "match_count": limit,
                "match_threshold": 0.3,
            },
        ).execute()

        return result.data if result.data else []

    except Exception:
        # Fallback: fetch recent memories without semantic search
        try:
            result = (
                supabase.table("memories")
                .select("id, content, memory_type, importance, created_at")
                .eq("user_id", user_id)
                .order("importance", desc=True)
                .limit(limit)
                .execute()
            )
            return result.data if result.data else []
        except Exception:
            return []


async def get_all_memories(
    user_id: str,
    supabase: Client,
    memory_type: str | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[dict], int]:
    """Get all memories for a user with optional type filter."""

    query = (
        supabase.table("memories")
        .select("id, content, memory_type, importance, source, created_at, last_accessed", count="exact")
        .eq("user_id", user_id)
    )

    if memory_type:
        query = query.eq("memory_type", memory_type)

    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    result = query.execute()

    return result.data or [], result.count or 0


async def delete_memory(memory_id: str, user_id: str, supabase: Client) -> bool:
    """Delete a specific memory. Users control their own data."""
    try:
        supabase.table("memories").delete().eq("id", memory_id).eq("user_id", user_id).execute()
        return True
    except Exception:
        return False


async def search_memories(
    query: str,
    user_id: str,
    supabase: Client,
    limit: int = 10,
) -> list[dict]:
    """Text search across memories (fallback when embeddings aren't available)."""
    try:
        result = (
            supabase.table("memories")
            .select("id, content, memory_type, importance, created_at")
            .eq("user_id", user_id)
            .ilike("content", f"%{query}%")
            .order("importance", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data or []
    except Exception:
        return []


async def _generate_embedding(text: str) -> list[float] | None:
    """Generate a 1536-dim embedding.

    Prefers OpenAI native (text-embedding-3-small) because the Euri gateway's
    embedding endpoint returned very low-quality vectors in practice — identical
    semantic queries scored below 0.1 similarity against the stored chunks.

    Falls back to the Euri gateway if OPENAI_API_KEY is not configured, so the
    feature still functions (just with worse recall) on setups that don't have
    the OpenAI key.
    """
    settings = get_settings()

    if settings.openai_api_key:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    f"{settings.openai_base_url}/embeddings",
                    headers={
                        "Authorization": f"Bearer {settings.openai_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.embedding_model,
                        "input": text[:8000],
                    },
                )
                if response.status_code == 200:
                    return response.json()["data"][0]["embedding"]
        except Exception:
            pass

    # Fallback: Euri gateway
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{settings.euri_base_url}/embeddings",
                headers={
                    "Authorization": f"Bearer {settings.euri_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.embedding_model,
                    "input": text[:8000],
                },
            )
            if response.status_code == 200:
                return response.json()["data"][0]["embedding"]
    except Exception:
        pass

    return None
