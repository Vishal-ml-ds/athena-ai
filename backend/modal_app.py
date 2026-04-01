"""ATHENA Backend — Modal Serverless Deployment.

Deploy: modal deploy backend/modal_app.py
Serves the FastAPI app as an ASGI endpoint on Modal's infrastructure."""

import modal

# --- Image definition ---
# Build a Debian-based image with all Python dependencies installed.
# Modal rebuilds this layer only when requirements.txt changes.

image = (
    modal.Image.debian_slim(python_version="3.11")
    # Install system libs needed by pymupdf first
    .apt_install("libmupdf-dev", "libfreetype-dev")
    # Then install Python packages — Modal resolves this relative to CWD at deploy time
    .pip_install_from_requirements("requirements.txt")
)

app = modal.App("athena-backend", image=image)

# --- Secrets ---
# Create a Modal secret named "athena-secrets" with these keys:
#   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
#   DATABASE_URL, EURI_API_KEY, REDIS_URL, CORS_ORIGINS, FRONTEND_URL,
#   BACKEND_URL, ENVIRONMENT
secrets = [modal.Secret.from_name("athena-secrets")]


# --- ASGI endpoint ---

@app.function(
    secrets=secrets,
    # Keep 1 container warm to eliminate cold starts during demos
    keep_warm=1,
    # Allow up to 10 concurrent requests per container
    allow_concurrent_inputs=10,
    # Timeout per request (10 min for long streaming responses)
    timeout=600,
)
@modal.asgi_app()
def fastapi_app():
    """Entry point — imports and returns the FastAPI application."""
    from app.main import app as fastapi_application
    return fastapi_application
