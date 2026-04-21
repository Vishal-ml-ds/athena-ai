"""Documents router — upload, process, delete, and RAG query user documents."""

from __future__ import annotations

import uuid
from typing import Any

import httpx
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from supabase import Client

from app.core.config import get_settings
from app.core.dependencies import get_supabase_client
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext
from app.services.memory_service import _generate_embedding

router = APIRouter(prefix="/api/v1/documents", tags=["documents"])

# --- Constants ---

CHUNK_SIZE = 500          # tokens approx (~2500 chars)
CHUNK_OVERLAP = 50        # overlap in chars
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/json",
}


# --- Pydantic Models ---

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


# --- Helpers ---

def _chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks by character count (~4 chars per token)."""
    char_limit = chunk_size * 4
    overlap_chars = overlap * 4
    chunks: list[str] = []
    start = 0

    while start < len(text):
        end = start + char_limit
        chunks.append(text[start:end])
        start = end - overlap_chars
        if start >= len(text):
            break

    return [c.strip() for c in chunks if c.strip()]


def _extract_text(file_bytes: bytes, mime_type: str) -> str:
    """Extract plain text from a file based on its MIME type."""
    if mime_type == "application/pdf":
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            return "\n".join(page.get_text() for page in doc)
        except Exception:
            return ""

    # text/* and application/json — just decode
    try:
        return file_bytes.decode("utf-8", errors="replace")
    except Exception:
        return ""


async def _process_document(
    document_id: str,
    user_id: str,
    tenant_id: str,
    file_bytes: bytes,
    mime_type: str,
    supabase: Client,
) -> None:
    """Background task: extract text → chunk → embed → store.

    Called via asyncio.create_task() so the upload endpoint returns immediately.
    Updates the document status on success or failure."""
    try:
        text = _extract_text(file_bytes, mime_type)

        if not text.strip():
            supabase.table("documents").update({
                "status": "failed",
                "metadata": {"error": "No extractable text found"},
            }).eq("id", document_id).execute()
            return

        chunks = _chunk_text(text)

        # Embed and insert chunks
        inserted = 0
        for i, chunk in enumerate(chunks):
            embedding = await _generate_embedding(chunk)
            row: dict[str, Any] = {
                "id": str(uuid.uuid4()),
                "document_id": document_id,
                "user_id": user_id,
                "tenant_id": tenant_id,
                "content": chunk,
                "chunk_index": i,
                "metadata": {"char_start": i * (CHUNK_SIZE * 4)},
            }
            if embedding:
                row["embedding"] = embedding
            supabase.table("document_chunks").insert(row).execute()
            inserted += 1

        # Mark ready
        supabase.table("documents").update({
            "status": "ready",
            "chunk_count": inserted,
            "processed_at": "now()",
        }).eq("id", document_id).execute()

    except Exception as exc:
        supabase.table("documents").update({
            "status": "failed",
            "metadata": {"error": str(exc)[:500]},
        }).eq("id", document_id).execute()


# --- Endpoints ---

@router.post("", response_model=ApiResponse[dict], status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Upload a document and kick off background processing.

    Returns 202 Accepted immediately — status becomes 'ready' once processed."""
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Allowed: PDF, TXT, MD, CSV, JSON",
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 50 MB.",
        )

    document_id = str(uuid.uuid4())

    # Upload raw file to Supabase Storage
    storage_path = f"{ctx.user_id}/{document_id}/{file.filename}"
    try:
        supabase.storage.from_("documents").upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": file.content_type or "application/octet-stream"},
        )
    except Exception:
        storage_path = None  # Storage failed — continue without it

    # Insert document row
    supabase.table("documents").insert({
        "id": document_id,
        "user_id": str(ctx.user_id),
        "tenant_id": str(ctx.tenant_id),
        "filename": file.filename or "unnamed",
        "mime_type": file.content_type or "application/octet-stream",
        "file_size": len(file_bytes),
        "storage_path": storage_path,
        "status": "processing",
        "metadata": {},
    }).execute()

    # Process synchronously — asyncio.create_task silently dies on Modal serverless
    await _process_document(
        document_id=document_id,
        user_id=str(ctx.user_id),
        tenant_id=str(ctx.tenant_id),
        file_bytes=file_bytes,
        mime_type=file.content_type or "",
        supabase=supabase,
    )

    return ApiResponse(success=True, data={
        "id": document_id,
        "filename": file.filename,
        "status": "ready",
        "message": "Document uploaded and processed.",
    })


@router.get("", response_model=ApiResponse[list])
async def list_documents(
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """List all documents for the current user."""
    result = (
        supabase.table("documents")
        .select("id, filename, mime_type, file_size, status, chunk_count, created_at, processed_at")
        .eq("user_id", str(ctx.user_id))
        .order("created_at", desc=True)
        .limit(50)
        .execute()
    )
    return ApiResponse(success=True, data=result.data or [])


@router.delete("/{document_id}", response_model=ApiResponse[dict])
async def delete_document(
    document_id: str,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Delete a document and all its chunks."""
    # Verify ownership
    doc = (
        supabase.table("documents")
        .select("id, storage_path")
        .eq("id", document_id)
        .eq("user_id", str(ctx.user_id))
        .single()
        .execute()
    )
    if not doc.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    # Delete from Storage if path exists
    storage_path = doc.data.get("storage_path")
    if storage_path:
        try:
            supabase.storage.from_("documents").remove([storage_path])
        except Exception:
            pass

    # Chunks are deleted by CASCADE via FK; delete the document row
    supabase.table("documents").delete().eq("id", document_id).execute()

    return ApiResponse(success=True, data={"message": "Document deleted"})


@router.post("/query", response_model=ApiResponse[dict])
async def query_documents(
    body: QueryRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Semantic search over the user's documents, with LLM-synthesized answer."""
    if not body.query.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Query cannot be empty")

    settings = get_settings()

    # Embed the query
    embedding = await _generate_embedding(body.query)
    if not embedding:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Embedding service unavailable",
        )

    # Retrieve top-k chunks via pgvector RPC
    chunks_result = supabase.rpc("match_document_chunks", {
        "query_embedding": embedding,
        "match_user_id": str(ctx.user_id),
        "match_count": body.top_k,
        "match_threshold": 0.1,
    }).execute()

    chunks = chunks_result.data or []

    if not chunks:
        return ApiResponse(success=True, data={
            "answer": "No relevant content found in your documents for this query.",
            "sources": [],
        })

    # Build context from retrieved chunks
    context = "\n\n---\n\n".join(c["content"] for c in chunks[:5])

    # Synthesize answer with LLM
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{settings.euri_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.euri_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.default_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "Answer the user's question using ONLY the provided document context. "
                                       "Be concise and cite which part of the context supports your answer. "
                                       "If the context doesn't contain the answer, say so clearly.",
                        },
                        {
                            "role": "user",
                            "content": f"Context:\n{context}\n\nQuestion: {body.query}",
                        },
                    ],
                    "temperature": 0.1,
                    "max_tokens": 600,
                },
            )

            answer = "Could not synthesize answer."
            if response.status_code == 200:
                answer = response.json()["choices"][0]["message"]["content"]

    except Exception:
        answer = context[:500] + "..."  # Fall back to raw context

    # Fetch filenames for cited sources
    doc_ids = list({c["document_id"] for c in chunks})
    docs_result = (
        supabase.table("documents")
        .select("id, filename")
        .in_("id", doc_ids)
        .execute()
    )
    doc_names = {d["id"]: d["filename"] for d in (docs_result.data or [])}

    sources = [
        {
            "document_id": c["document_id"],
            "filename": doc_names.get(c["document_id"], "Unknown"),
            "chunk_index": c["chunk_index"],
            "similarity": round(c["similarity"], 3),
        }
        for c in chunks
    ]

    return ApiResponse(success=True, data={"answer": answer, "sources": sources})
