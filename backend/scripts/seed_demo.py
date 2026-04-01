"""
Demo data seeder for ATHENA.

Seeds the demo account (vishalprasad2442002@gmail.com) with realistic data
so every page looks populated during demos and portfolio reviews.

Usage:
    cd backend
    python -m scripts.seed_demo

The script is idempotent — running it twice will not duplicate data.
It uses the Supabase service role key so RLS is bypassed.
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import date, timedelta
from pathlib import Path

# ── Bootstrap: load .env before importing anything else ──────────────────────
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())

from supabase import create_client, Client  # noqa: E402 (after env load)

# ── Config ────────────────────────────────────────────────────────────────────
DEMO_EMAIL = "vishalprasad2442002@gmail.com"
TODAY = date.today()


def _client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    return create_client(url, key)


# ── Resolve user + tenant IDs ─────────────────────────────────────────────────

def _resolve_ids(sb: Client) -> tuple[str, str]:
    """Return (user_id, tenant_id) for the demo account.

    Looks up the user in Supabase Auth by email.
    Requires the service role key — regular anon key cannot list users.
    """
    users = sb.auth.admin.list_users()
    demo_user = next(
        (u for u in users if u.email == DEMO_EMAIL),
        None,
    )
    if demo_user is None:
        print(f"[ERROR] Demo account '{DEMO_EMAIL}' not found in Supabase Auth.")
        print("  → Create the account first via the ATHENA signup flow.")
        sys.exit(1)

    user_id = demo_user.id

    profile = (
        sb.table("profiles")
        .select("tenant_id")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not profile.data:
        print(f"[ERROR] No profile row found for user {user_id}.")
        print("  → Complete onboarding for the demo account first.")
        sys.exit(1)

    tenant_id = profile.data["tenant_id"]
    print(f"[OK] Demo user found — user_id={user_id}, tenant_id={tenant_id}")
    return user_id, tenant_id


# ── Clear old demo data ───────────────────────────────────────────────────────

def _clear_existing(sb: Client, user_id: str) -> None:
    """Remove any previously seeded data so re-running is safe."""
    tables = [
        "habit_logs",
        "habits",
        "goals",
        "finance_entries",
        "health_logs",
        "memories",
        "knowledge_edges",
        "knowledge_nodes",
    ]
    for table in tables:
        sb.table(table).delete().eq("user_id", user_id).execute()
    print("[OK] Cleared existing demo data")


# ── Habits ────────────────────────────────────────────────────────────────────

HABITS = [
    {
        "name": "Morning Run",
        "description": "30-minute run to start the day with energy",
        "category": "health",
        "streak_current": 5,
        "streak_best": 12,
    },
    {
        "name": "Read 30 Minutes",
        "description": "Non-fiction books focused on AI, finance, and leadership",
        "category": "learning",
        "streak_current": 12,
        "streak_best": 21,
    },
    {
        "name": "Drink 3L Water",
        "description": "Stay hydrated throughout the day",
        "category": "health",
        "streak_current": 3,
        "streak_best": 9,
    },
    {
        "name": "Evening Journaling",
        "description": "Reflect on wins, lessons, and goals for tomorrow",
        "category": "productivity",
        "streak_current": 7,
        "streak_best": 14,
    },
]


def _seed_habits(sb: Client, user_id: str, tenant_id: str) -> list[str]:
    habit_ids: list[str] = []
    for h in HABITS:
        result = (
            sb.table("habits")
            .insert({
                "user_id": user_id,
                "tenant_id": tenant_id,
                "name": h["name"],
                "description": h["description"],
                "category": h["category"],
                "frequency": {"type": "daily"},
                "streak_current": h["streak_current"],
                "streak_best": h["streak_best"],
                "is_active": True,
            })
            .execute()
        )
        habit_id = result.data[0]["id"]
        habit_ids.append(habit_id)

        # Insert last N days of habit logs (N = streak_current)
        logs = []
        for days_ago in range(h["streak_current"]):
            log_date = TODAY - timedelta(days=days_ago)
            logs.append({
                "habit_id": habit_id,
                "user_id": user_id,
                "tenant_id": tenant_id,
                "completed_at": f"{log_date}T08:00:00+00:00",
            })
        if logs:
            sb.table("habit_logs").insert(logs).execute()

    print(f"[OK] Seeded {len(HABITS)} habits with logs")
    return habit_ids


# ── Goals ─────────────────────────────────────────────────────────────────────

GOALS = [
    {
        "title": "Launch ATHENA v1",
        "description": "Deploy ATHENA to production and share with 50 beta users",
        "category": "career",
        "target_date": str(TODAY + timedelta(days=30)),
        "progress": 75,
        "milestones": [
            {"title": "Core chat working", "done": True},
            {"title": "Life OS complete", "done": True},
            {"title": "Documents RAG ready", "done": True},
            {"title": "Deployed to production", "done": False},
            {"title": "50 beta signups", "done": False},
        ],
    },
    {
        "title": "Learn Spanish to B1",
        "description": "Complete Duolingo + 1 Spanish podcast per week",
        "category": "learning",
        "target_date": str(TODAY + timedelta(days=180)),
        "progress": 40,
        "milestones": [
            {"title": "Complete A1 Duolingo course", "done": True},
            {"title": "First 100 words memorized", "done": True},
            {"title": "A2 Duolingo course", "done": False},
            {"title": "Hold a 5-minute conversation", "done": False},
        ],
    },
    {
        "title": "Land 20+ LPA AI Role",
        "description": "Target AI Architect or Chief AI Engineer positions",
        "category": "career",
        "target_date": str(TODAY + timedelta(days=90)),
        "progress": 55,
        "milestones": [
            {"title": "Build ATHENA portfolio project", "done": True},
            {"title": "Complete AI Architect course", "done": True},
            {"title": "10 portfolio projects", "done": False},
            {"title": "Land interview at target company", "done": False},
        ],
    },
]


def _seed_goals(sb: Client, user_id: str, tenant_id: str) -> None:
    for g in GOALS:
        sb.table("goals").insert({
            "user_id": user_id,
            "tenant_id": tenant_id,
            "title": g["title"],
            "description": g["description"],
            "category": g["category"],
            "target_date": g["target_date"],
            "progress": g["progress"],
            "milestones": g["milestones"],
            "status": "active",
        }).execute()
    print(f"[OK] Seeded {len(GOALS)} goals")


# ── Finance ───────────────────────────────────────────────────────────────────

FINANCE_ENTRIES = [
    # Income
    {"type": "income", "amount": 50000, "category": "salary", "description": "Monthly salary — NBC/Remunance", "date": str(TODAY.replace(day=1))},
    {"type": "income", "amount": 8500, "category": "freelance", "description": "Freelance ML model review", "date": str(TODAY - timedelta(days=10))},
    # Expenses
    {"type": "expense", "amount": 12000, "category": "rent", "description": "Monthly rent — Goa", "date": str(TODAY.replace(day=1))},
    {"type": "expense", "amount": 4500, "category": "food", "description": "Groceries + eating out", "date": str(TODAY - timedelta(days=5))},
    {"type": "expense", "amount": 2200, "category": "transport", "description": "Fuel + Rapido", "date": str(TODAY - timedelta(days=8))},
    {"type": "expense", "amount": 3800, "category": "tech", "description": "Claude Pro subscription + cloud credits", "date": str(TODAY - timedelta(days=12))},
    {"type": "expense", "amount": 1500, "category": "education", "description": "Euron AI courses", "date": str(TODAY - timedelta(days=15))},
    {"type": "expense", "amount": 2000, "category": "fitness", "description": "Gym membership + supplements", "date": str(TODAY - timedelta(days=3))},
    # Savings
    {"type": "savings", "amount": 10000, "category": "emergency_fund", "description": "Monthly SIP — emergency fund", "date": str(TODAY.replace(day=5))},
    {"type": "savings", "amount": 5000, "category": "investments", "description": "Zerodha — Nifty 50 index", "date": str(TODAY.replace(day=5))},
]


def _seed_finance(sb: Client, user_id: str, tenant_id: str) -> None:
    entries = [
        {**e, "user_id": user_id, "tenant_id": tenant_id, "currency": "INR", "source": "manual"}
        for e in FINANCE_ENTRIES
    ]
    sb.table("finance_entries").insert(entries).execute()
    print(f"[OK] Seeded {len(FINANCE_ENTRIES)} finance entries")


# ── Health Logs ───────────────────────────────────────────────────────────────

HEALTH_LOGS = [
    # Sleep — last 7 days
    *[{"metric_type": "sleep", "value": round(6.5 + (i % 3) * 0.5, 1), "unit": "hours",
       "notes": "", "logged_at": f"{TODAY - timedelta(days=i)}T07:00:00+00:00"}
      for i in range(7)],
    # Weight — last 3 entries
    {"metric_type": "weight", "value": 72.5, "unit": "kg", "notes": "After morning run", "logged_at": f"{TODAY}T07:30:00+00:00"},
    {"metric_type": "weight", "value": 73.0, "unit": "kg", "notes": "", "logged_at": f"{TODAY - timedelta(days=3)}T07:30:00+00:00"},
    {"metric_type": "weight", "value": 73.2, "unit": "kg", "notes": "", "logged_at": f"{TODAY - timedelta(days=7)}T07:30:00+00:00"},
    # Steps — last 3 days
    {"metric_type": "exercise", "value": 8500, "unit": "steps", "notes": "Morning run", "logged_at": f"{TODAY}T08:30:00+00:00"},
    {"metric_type": "exercise", "value": 6200, "unit": "steps", "notes": "", "logged_at": f"{TODAY - timedelta(days=1)}T08:30:00+00:00"},
    {"metric_type": "exercise", "value": 9100, "unit": "steps", "notes": "Ran to office", "logged_at": f"{TODAY - timedelta(days=2)}T08:30:00+00:00"},
    # Water
    {"metric_type": "water", "value": 2.8, "unit": "litres", "notes": "", "logged_at": f"{TODAY}T22:00:00+00:00"},
    {"metric_type": "water", "value": 3.2, "unit": "litres", "notes": "", "logged_at": f"{TODAY - timedelta(days=1)}T22:00:00+00:00"},
]


def _seed_health(sb: Client, user_id: str, tenant_id: str) -> None:
    logs = [
        {**h, "user_id": user_id, "tenant_id": tenant_id, "source": "manual"}
        for h in HEALTH_LOGS
    ]
    sb.table("health_logs").insert(logs).execute()
    print(f"[OK] Seeded {len(HEALTH_LOGS)} health log entries")


# ── Memories ──────────────────────────────────────────────────────────────────

MEMORIES = [
    {
        "content": "My name is Vishal Prasad. I work as a Junior Software Engineer at NBC (via Remunance) in Goa.",
        "memory_type": "fact",
        "importance": 0.95,
        "source": "onboarding",
    },
    {
        "content": "I am targeting 20+ LPA AI Architect and Chief AI Engineer roles. ATHENA is my flagship portfolio project.",
        "memory_type": "goal",
        "importance": 0.9,
        "source": "onboarding",
    },
    {
        "content": "My tech stack is FastAPI + Python for backend, Next.js + TypeScript + Tailwind for frontend, and Supabase for the database.",
        "memory_type": "fact",
        "importance": 0.85,
        "source": "conversation",
    },
    {
        "content": "I learn best by seeing working code examples. I can read and understand code but cannot write complex code from scratch yet.",
        "memory_type": "preference",
        "importance": 0.8,
        "source": "conversation",
    },
    {
        "content": "I am studying Sudhanshu Kumar's AI Product Engineering and AI Architect Mastery courses on Euron to level up my skills.",
        "memory_type": "fact",
        "importance": 0.75,
        "source": "conversation",
    },
    {
        "content": "I prefer concise explanations without jargon. Daily-life analogies work best — e.g. 'a middleman' instead of 'middleware'.",
        "memory_type": "preference",
        "importance": 0.7,
        "source": "conversation",
    },
    {
        "content": "I am building ATHENA to beat a competitor product called Angelina and prove my capabilities as an AI Product Engineer.",
        "memory_type": "insight",
        "importance": 0.85,
        "source": "conversation",
    },
]


def _seed_memories(sb: Client, user_id: str, tenant_id: str) -> None:
    entries = [
        {**m, "user_id": user_id, "tenant_id": tenant_id}
        for m in MEMORIES
    ]
    # Insert without embeddings — embeddings are populated lazily when a search is run
    sb.table("memories").insert(entries).execute()
    print(f"[OK] Seeded {len(MEMORIES)} memories")


# ── Knowledge Graph ───────────────────────────────────────────────────────────

NODES = [
    {"name": "Vishal Prasad", "node_type": "person", "description": "Software engineer targeting AI Architect roles at 20+ LPA"},
    {"name": "ATHENA", "node_type": "topic", "description": "Personal AI Operating System — flagship portfolio project"},
    {"name": "FastAPI", "node_type": "skill", "description": "Python async web framework used for ATHENA backend"},
    {"name": "Next.js", "node_type": "skill", "description": "React framework for ATHENA frontend"},
    {"name": "Supabase", "node_type": "organization", "description": "PostgreSQL + Auth + Storage platform powering ATHENA"},
    {"name": "NBC", "node_type": "organization", "description": "Current employer — Junior Software Engineer role"},
    {"name": "LangGraph", "node_type": "skill", "description": "Multi-agent orchestration framework — powers ATHENA's 7-agent system"},
    {"name": "AI Architect Mastery", "node_type": "topic", "description": "Euron course by Sudhanshu Kumar — path to 20+ LPA"},
]

EDGES = [
    {"source_name": "Vishal Prasad", "target_name": "ATHENA", "relationship": "built"},
    {"source_name": "Vishal Prasad", "target_name": "NBC", "relationship": "works_at"},
    {"source_name": "Vishal Prasad", "target_name": "AI Architect Mastery", "relationship": "studying"},
    {"source_name": "ATHENA", "target_name": "FastAPI", "relationship": "uses"},
    {"source_name": "ATHENA", "target_name": "Next.js", "relationship": "uses"},
    {"source_name": "ATHENA", "target_name": "Supabase", "relationship": "uses"},
    {"source_name": "ATHENA", "target_name": "LangGraph", "relationship": "uses"},
    {"source_name": "Vishal Prasad", "target_name": "FastAPI", "relationship": "knows"},
    {"source_name": "Vishal Prasad", "target_name": "Next.js", "relationship": "knows"},
]


def _seed_knowledge_graph(sb: Client, user_id: str, tenant_id: str) -> None:
    node_entries = [
        {**n, "user_id": user_id, "tenant_id": tenant_id}
        for n in NODES
    ]
    sb.table("knowledge_nodes").insert(node_entries).execute()

    edge_entries = [
        {**e, "user_id": user_id, "tenant_id": tenant_id}
        for e in EDGES
    ]
    sb.table("knowledge_edges").insert(edge_entries).execute()
    print(f"[OK] Seeded {len(NODES)} knowledge nodes and {len(EDGES)} edges")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    print("=== ATHENA Demo Data Seeder ===")
    print(f"Target account: {DEMO_EMAIL}")
    print()

    sb = _client()
    user_id, tenant_id = _resolve_ids(sb)

    print("\nClearing old seed data...")
    _clear_existing(sb, user_id)

    print("\nSeeding demo data...")
    _seed_habits(sb, user_id, tenant_id)
    _seed_goals(sb, user_id, tenant_id)
    _seed_finance(sb, user_id, tenant_id)
    _seed_health(sb, user_id, tenant_id)
    _seed_memories(sb, user_id, tenant_id)
    _seed_knowledge_graph(sb, user_id, tenant_id)

    print()
    print("=== Seed complete ===")
    print("All demo data is live. Open the app and every page will be populated.")
    print()
    print("Summary:")
    print(f"  Habits:        {len(HABITS)} (with streak logs)")
    print(f"  Goals:         {len(GOALS)}")
    print(f"  Finance:       {len(FINANCE_ENTRIES)} entries")
    print(f"  Health logs:   {len(HEALTH_LOGS)} entries")
    print(f"  Memories:      {len(MEMORIES)}")
    print(f"  Knowledge:     {len(NODES)} nodes, {len(EDGES)} edges")


if __name__ == "__main__":
    main()
