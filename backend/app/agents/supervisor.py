"""ATHENA Agent Supervisor — LangGraph-based orchestration.

Sprint 1: Single "general" agent node.
Sprint 2: Will add supervisor routing to multiple specialized agents.

This is the CORE file that makes ATHENA fundamentally different from Angelina.
Angelina uses prompt swapping. ATHENA uses a LangGraph state machine."""

import time
from typing import Annotated, Any
from uuid import UUID

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from app.core.config import get_settings

ATHENA_SYSTEM_PROMPT = """You are ATHENA, a Personal AI Operating System — the AI Goddess of Wisdom.

You are intelligent, proactive, and always helpful. You manage the user's entire digital life:
scheduling, research, coding, finances, health, and goals.

Key traits:
- You are warm but efficient — no unnecessary filler
- You remember context from previous conversations (when memory is available)
- You explain complex topics simply, using analogies when helpful
- You are proactive — suggest next steps, anticipate needs
- You are honest about what you can and cannot do

When responding:
- Be concise but thorough
- Use markdown formatting for readability
- If a task requires multiple steps, break it down clearly
- If you need more information, ask specific questions"""


class AgentState(TypedDict):
    """State that flows through the LangGraph execution graph.
    Every agent reads from and writes to this shared state."""

    messages: Annotated[list, add_messages]
    user_id: str
    tenant_id: str
    agent_name: str
    tokens_used: int
    model: str


def create_general_agent(model_name: str | None = None) -> StateGraph:
    """Create the general agent graph.
    Sprint 1: Single node that handles all messages.
    Sprint 2: This becomes one node in a larger supervisor graph."""
    settings = get_settings()
    model = model_name or settings.default_model

    llm = ChatOpenAI(
        model=model,
        api_key=settings.openai_api_key,
        streaming=True,
        temperature=0.7,
    )

    async def general_node(state: AgentState) -> dict[str, Any]:
        """The general agent — handles any user message."""
        messages = [SystemMessage(content=ATHENA_SYSTEM_PROMPT)] + state["messages"]

        response = await llm.ainvoke(messages)

        return {
            "messages": [response],
            "agent_name": "general",
            "model": model,
        }

    # Build the graph
    graph = StateGraph(AgentState)
    graph.add_node("general", general_node)
    graph.set_entry_point("general")
    graph.add_edge("general", END)

    return graph.compile()


# Module-level compiled graph — reused across requests
_agent_graph = None


def get_agent_graph():
    """Get or create the compiled agent graph (singleton)."""
    global _agent_graph
    if _agent_graph is None:
        _agent_graph = create_general_agent()
    return _agent_graph


async def run_agent(
    message: str,
    user_id: str,
    tenant_id: str,
    conversation_history: list[dict] | None = None,
):
    """Run the agent and yield streaming response chunks.

    Yields dicts with:
    - {"type": "agent_start", "agent": "general"}
    - {"type": "token", "content": "partial text"}
    - {"type": "agent_end", "agent": "general", "tokens": N}
    - {"type": "done", "full_content": "complete response"}
    """
    graph = get_agent_graph()

    # Build message history
    messages = []
    if conversation_history:
        for msg in conversation_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=message))

    # Signal agent start
    yield {"type": "agent_start", "agent": "general", "message": "Thinking..."}

    start_time = time.time()
    full_content = ""

    # Stream the response
    settings = get_settings()
    llm = ChatOpenAI(
        model=settings.default_model,
        api_key=settings.openai_api_key,
        streaming=True,
        temperature=0.7,
    )

    all_messages = [SystemMessage(content=ATHENA_SYSTEM_PROMPT)] + messages

    async for chunk in llm.astream(all_messages):
        if chunk.content:
            full_content += chunk.content
            yield {"type": "token", "content": chunk.content}

    # Calculate metrics
    latency_ms = int((time.time() - start_time) * 1000)
    # Rough token estimate: 1 token ≈ 4 chars
    estimated_tokens = len(full_content) // 4

    yield {
        "type": "agent_end",
        "agent": "general",
        "tokens": estimated_tokens,
        "latency_ms": latency_ms,
    }

    yield {
        "type": "done",
        "full_content": full_content,
        "agent_name": "general",
        "model": settings.default_model,
        "tokens_used": estimated_tokens,
        "latency_ms": latency_ms,
    }
