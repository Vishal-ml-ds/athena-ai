"""ATHENA Backend — Modal Serverless Deployment."""

import modal

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("libmupdf-dev", "libfreetype-dev")
    .pip_install_from_requirements("requirements.txt")
    .add_local_python_source("app")
)

app = modal.App("athena-backend", image=image)

secrets = [modal.Secret.from_name("athena-secrets")]


@app.function(secrets=secrets, timeout=600)
@modal.concurrent(max_inputs=10)
@modal.asgi_app()
def fastapi_app():
    """Entry point — imports and returns the FastAPI application."""
    from app.main import app as fastapi_application
    return fastapi_application
