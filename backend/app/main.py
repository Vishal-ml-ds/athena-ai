"""ATHENA Backend — FastAPI Application Entry Point.

Modular monolith: single app with strict module boundaries.
Every request passes through: CORS → tracking → rate limiting → auth → handler."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.dependencies import close_redis
from app.core.exceptions import AthenaError, athena_error_handler
from app.core.middleware import RequestTrackingMiddleware
from app.routers import auth, conversations, life, memories, users, voice


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events.
    Validates required config at startup — fail fast if anything is missing."""
    settings = get_settings()
    print(f"ATHENA Backend starting in {settings.environment} mode")
    print(f"Frontend URL: {settings.frontend_url}")
    yield
    # Cleanup
    await close_redis()
    print("ATHENA Backend shutting down")


app = FastAPI(
    title="ATHENA API",
    description="Personal AI Operating System — Backend API",
    version="0.1.0",
    lifespan=lifespan,
)

# --- Middleware Stack (order matters: first added = outermost) ---

# CORS — allow frontend to make requests
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:3002", "http://localhost:3003"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-Request-ID",
        "X-Response-Time",
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
    ],
)

# Request tracking — adds request_id and timing
app.add_middleware(RequestTrackingMiddleware)

# --- Exception Handlers ---
app.add_exception_handler(AthenaError, athena_error_handler)

# --- Routers ---
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(conversations.router)
app.include_router(memories.router)
app.include_router(life.router)
app.include_router(voice.router)


# --- Health Check ---
@app.get("/health")
async def health_check():
    """Health check endpoint — no auth required."""
    return {
        "status": "healthy",
        "service": "athena-api",
        "version": "0.1.0",
    }
