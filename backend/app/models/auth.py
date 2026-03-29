"""Auth request/response models."""

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    """New user registration."""

    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    display_name: str = Field(min_length=1, max_length=100)


class LoginRequest(BaseModel):
    """User login."""

    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Token refresh."""

    refresh_token: str


class AuthResponse(BaseModel):
    """Auth tokens returned after login/signup."""

    user_id: str
    tenant_id: str
    access_token: str
    refresh_token: str


class OnboardingRequest(BaseModel):
    """Complete onboarding — sets user preferences."""

    display_name: str = Field(min_length=1, max_length=100)
    timezone: str = Field(default="UTC", max_length=50)
    interests: list[str] = Field(default_factory=list, max_length=10)
