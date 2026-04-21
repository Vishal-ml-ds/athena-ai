"""Life OS endpoints — habits, goals, finance, health."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field, field_validator
from supabase import Client

from app.core.dependencies import get_supabase_client
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext

router = APIRouter(prefix="/api/v1/life", tags=["life"])


# ── Request Models ───────────────────────────────────────────

class CreateHabitRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str = Field(default="", max_length=500)
    category: str = Field(default="productivity", max_length=50)
    frequency: dict = Field(default_factory=lambda: {"type": "daily"})


class LogHabitRequest(BaseModel):
    value: float | None = None
    notes: str = Field(default="", max_length=500)


class CreateGoalRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)
    category: str = Field(default="personal", max_length=50)
    target_date: str | None = None
    milestones: list = Field(default_factory=list)

    @field_validator("target_date")
    @classmethod
    def validate_date(cls, v: str | None) -> str | None:
        if v is None:
            return v
        try:
            datetime.fromisoformat(v)
        except ValueError as exc:
            raise ValueError("target_date must be ISO format (YYYY-MM-DD)") from exc
        return v


class UpdateGoalProgressRequest(BaseModel):
    progress: float = Field(..., ge=0, le=100)


class AddFinanceRequest(BaseModel):
    type: Literal["income", "expense", "savings"]
    amount: float = Field(..., gt=0)
    currency: str = Field(default="INR", max_length=3)
    category: str = Field(..., min_length=1, max_length=50)
    description: str = Field(default="", max_length=500)
    date: str | None = None

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str | None) -> str | None:
        if v is None:
            return v
        try:
            datetime.fromisoformat(v)
        except ValueError as exc:
            raise ValueError("date must be ISO format (YYYY-MM-DD)") from exc
        return v


class LogHealthRequest(BaseModel):
    metric_type: str = Field(..., min_length=1, max_length=50)
    value: float = Field(..., ge=0)
    unit: str = Field(..., min_length=1, max_length=20)
    notes: str = Field(default="", max_length=500)


# ── HABITS ──────────────────────────────────────────

@router.post("/habits", response_model=ApiResponse[dict], status_code=201)
async def create_habit(
    body: CreateHabitRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = supabase.table("habits").insert({
        "id": str(uuid.uuid4()),
        "user_id": str(ctx.user_id),
        "tenant_id": str(ctx.tenant_id),
        "name": body.name,
        "description": body.description,
        "category": body.category,
        "frequency": body.frequency,
    }).execute()
    return ApiResponse(success=True, data=result.data[0])


@router.get("/habits", response_model=ApiResponse[list])
async def list_habits(
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = (
        supabase.table("habits")
        .select("*")
        .eq("user_id", str(ctx.user_id))
        .eq("is_active", True)
        .execute()
    )
    return ApiResponse(success=True, data=result.data)


@router.post("/habits/{habit_id}/log", response_model=ApiResponse[dict])
async def log_habit(
    habit_id: str,
    body: LogHabitRequest = LogHabitRequest(),
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = supabase.table("habit_logs").insert({
        "habit_id": habit_id,
        "user_id": str(ctx.user_id),
        "tenant_id": str(ctx.tenant_id),
        "value": body.value,
        "notes": body.notes,
    }).execute()

    # Update streak — non-critical, habit log already saved above
    try:
        supabase.rpc("increment_streak", {
            "habit_id_param": habit_id,
            "user_id_param": str(ctx.user_id),
        }).execute()
    except Exception:
        pass  # Streak update is non-critical

    return ApiResponse(success=True, data=result.data[0] if result.data else {})


@router.delete("/habits/{habit_id}", response_model=ApiResponse[dict])
async def delete_habit(
    habit_id: str,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    supabase.table("habits").update({"is_active": False}).eq("id", habit_id).eq("user_id", str(ctx.user_id)).execute()
    return ApiResponse(success=True, data={"message": "Habit deactivated"})


# ── GOALS ───────────────────────────────────────────

@router.post("/goals", response_model=ApiResponse[dict], status_code=201)
async def create_goal(
    body: CreateGoalRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = supabase.table("goals").insert({
        "id": str(uuid.uuid4()),
        "user_id": str(ctx.user_id),
        "tenant_id": str(ctx.tenant_id),
        "title": body.title,
        "description": body.description,
        "category": body.category,
        "target_date": body.target_date,
        "milestones": body.milestones,
    }).execute()
    return ApiResponse(success=True, data=result.data[0])


@router.get("/goals", response_model=ApiResponse[list])
async def list_goals(
    status: str = Query("active"),
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = (
        supabase.table("goals")
        .select("*")
        .eq("user_id", str(ctx.user_id))
        .eq("status", status)
        .execute()
    )
    return ApiResponse(success=True, data=result.data)


@router.patch("/goals/{goal_id}/progress", response_model=ApiResponse[dict])
async def update_goal_progress(
    goal_id: str,
    body: UpdateGoalProgressRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    updates: dict = {"progress": body.progress}
    if body.progress >= 100:
        updates["status"] = "completed"

    supabase.table("goals").update(updates).eq("id", goal_id).eq("user_id", str(ctx.user_id)).execute()
    return ApiResponse(success=True, data={"message": "Progress updated"})


# ── FINANCE ─────────────────────────────────────────

@router.post("/finance", response_model=ApiResponse[dict], status_code=201)
async def add_finance_entry(
    body: AddFinanceRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = supabase.table("finance_entries").insert({
        "id": str(uuid.uuid4()),
        "user_id": str(ctx.user_id),
        "tenant_id": str(ctx.tenant_id),
        "type": body.type,
        "amount": body.amount,
        "currency": body.currency,
        "category": body.category,
        "description": body.description,
        "date": body.date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
    }).execute()
    return ApiResponse(success=True, data=result.data[0])


@router.get("/finance", response_model=ApiResponse[list])
async def list_finance(
    limit: int = Query(50, ge=1, le=100),
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = (
        supabase.table("finance_entries")
        .select("*")
        .eq("user_id", str(ctx.user_id))
        .order("date", desc=True)
        .limit(limit)
        .execute()
    )
    return ApiResponse(success=True, data=result.data)


@router.get("/finance/summary", response_model=ApiResponse[dict])
async def finance_summary(
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = (
        supabase.table("finance_entries")
        .select("type, amount, category")
        .eq("user_id", str(ctx.user_id))
        .execute()
    )

    income = sum(float(e["amount"]) for e in result.data if e["type"] == "income")
    expenses = sum(float(e["amount"]) for e in result.data if e["type"] == "expense")
    savings = sum(float(e["amount"]) for e in result.data if e["type"] == "savings")

    categories: dict[str, float] = {}
    for e in result.data:
        if e["type"] == "expense":
            cat = e["category"]
            categories[cat] = categories.get(cat, 0) + float(e["amount"])

    return ApiResponse(success=True, data={
        "income": income,
        "expenses": expenses,
        "savings": savings,
        "net": income - expenses,
        "by_category": categories,
    })


# ── HEALTH ──────────────────────────────────────────

@router.post("/health", response_model=ApiResponse[dict], status_code=201)
async def log_health(
    body: LogHealthRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = supabase.table("health_logs").insert({
        "id": str(uuid.uuid4()),
        "user_id": str(ctx.user_id),
        "tenant_id": str(ctx.tenant_id),
        "metric_type": body.metric_type,
        "value": body.value,
        "unit": body.unit,
        "notes": body.notes,
    }).execute()
    return ApiResponse(success=True, data=result.data[0])


@router.get("/health", response_model=ApiResponse[list])
async def list_health(
    metric_type: str | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    query = supabase.table("health_logs").select("*").eq("user_id", str(ctx.user_id))
    if metric_type:
        query = query.eq("metric_type", metric_type)
    result = query.order("logged_at", desc=True).limit(limit).execute()
    return ApiResponse(success=True, data=result.data)


@router.get("/health/trends", response_model=ApiResponse[dict])
async def health_trends(
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    result = (
        supabase.table("health_logs")
        .select("metric_type, value, unit, logged_at")
        .eq("user_id", str(ctx.user_id))
        .order("logged_at", desc=True)
        .limit(100)
        .execute()
    )

    trends: dict[str, list] = {}
    for log in result.data:
        mt = log["metric_type"]
        if mt not in trends:
            trends[mt] = []
        trends[mt].append({
            "value": log["value"],
            "unit": log["unit"],
            "date": log["logged_at"],
        })

    return ApiResponse(success=True, data=trends)
