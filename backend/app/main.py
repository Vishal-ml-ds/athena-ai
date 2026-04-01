"""ATHENA Backend — FastAPI Application Entry Point.

Modular monolith: single app with strict module boundaries.
Every request passes through: CORS → tracking → rate limiting → auth → handler."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.dependencies import close_redis
from app.core.exceptions import AthenaError, athena_error_handler
from app.core.middleware import RateLimitMiddleware, RequestTrackingMiddleware
from app.routers import analytics, auth, browser, conversations, documents, knowledge, life, memories, reports, users, voice

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events.
    Validates required config at startup — fail fast if anything is missing."""
    settings = get_settings()
    logger.info("ATHENA Backend starting in %s mode", settings.environment)
    logger.info("Frontend URL: %s", settings.frontend_url)
    yield
    # Cleanup
    await close_redis()
    logger.info("ATHENA Backend shutting down")


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
    allow_origins=settings.cors_origins.split(","),
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

# Rate limiting — Redis-backed sliding window (fails open if Redis is down)
app.add_middleware(RateLimitMiddleware)

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
app.include_router(knowledge.router)
app.include_router(analytics.router)
app.include_router(documents.router)
app.include_router(browser.router)
app.include_router(reports.router)


# --- Health Check ---
@app.get("/health")
async def health_check():
    """Health check endpoint — no auth required."""
    return {
        "status": "healthy",
        "service": "athena-api",
        "version": "0.1.0",
    }
