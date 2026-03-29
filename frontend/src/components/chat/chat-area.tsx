"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  CalendarDays,
  Terminal,
  Wallet,
  Brain,
} from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { useConversationStore } from "@/stores/conversation-store";
import { cn } from "@/lib/utils";

const SUGGESTION_CARDS = [
  {
    icon: TrendingUp,
    iconColor: "text-[#d2bbff]",
    title: "Research trends",
    description: "Analyze the latest developments in large language models.",
  },
  {
    icon: CalendarDays,
    iconColor: "text-[#ffb95f]",
    title: "Plan my week",
    description: "Optimize my schedule for deep work and celestial focus.",
  },
  {
    icon: Terminal,
    iconColor: "text-[#d2bbff]",
    title: "Explain LangGraph",
    description:
      "Break down complex multi-agent workflows into simple concepts.",
  },
  {
    icon: Wallet,
    iconColor: "text-[#ffb95f]",
    title: "Track expenses",
    description: "Categorize my digital asset transactions for this month.",
  },
] as const;

export function ChatArea() {
  const {
    messages,
    activeConversationId,
    isStreaming,
    streamingContent,
    activeAgent,
    memoriesUsed,
    sendMessage,
    createConversation,
  } = useConversationStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!activeConversationId) {
        await createConversation("New Chat");
      }
      sendMessage(content);
    },
    [activeConversationId, createConversation, sendMessage]
  );

  const handleSuggestionClick = useCallback(
    (title: string) => {
      handleSend(title);
    },
    [handleSend]
  );

  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div className="relative flex h-full flex-1 flex-col bg-[#0b1326]">
      {/* Scrollable Content */}
      <section ref={scrollRef} className="flex-1 overflow-y-auto px-6 pb-32">
        {!hasMessages ? (
          <EmptyState onSuggestionClick={handleSuggestionClick} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-12 py-12">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                agentName={msg.agentName}
              />
            ))}

            {/* Memory indicator */}
            {isStreaming && memoriesUsed.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-[#ffb95f]/10 px-4 py-2">
                <Brain className="h-4 w-4 text-[#ffb95f]" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#ffb95f]">
                  ATHENA remembered: {memoriesUsed[0]}
                </span>
              </div>
            )}

            {/* Streaming message */}
            {isStreaming && streamingContent && (
              <MessageBubble
                role="assistant"
                content={streamingContent}
                agentName={activeAgent ?? "general"}
                isStreaming
              />
            )}

            {/* Thinking indicator */}
            {isStreaming && !streamingContent && (
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    "border border-[#d2bbff]/30 bg-[#171f33]",
                    "shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                  )}
                >
                  <Brain className="h-4 w-4 animate-pulse text-[#d2bbff]" />
                </div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#ffb95f]">
                  {activeAgent
                    ? `${activeAgent} is thinking...`
                    : "ATHENA is thinking..."}
                </span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Bottom Input Bar */}
      <ChatInput onSend={handleSend} isStreaming={isStreaming} />
    </div>
  );
}

interface EmptyStateProps {
  onSuggestionClick: (title: string) => void;
}

function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col items-center justify-center space-y-8 py-12 text-center">
      {/* Sparkle Icon with Glow */}
      <div className="relative">
        <div className="absolute inset-0 bg-[#d2bbff] opacity-20 blur-[80px]" />
        <div
          className={cn(
            "ai-pulse relative z-10",
            "flex h-24 w-24 items-center justify-center rounded-full",
            "border border-[#d2bbff]/20 bg-[#222a3d]"
          )}
        >
          <Sparkles className="h-12 w-12 text-[#d2bbff]" />
        </div>
      </div>

      {/* Headline */}
      <div className="space-y-2">
        <h2 className="font-headline text-4xl font-light tracking-tight text-white md:text-5xl">
          Welcome to{" "}
          <span className="font-bold text-[#d2bbff]">ATHENA</span>
        </h2>
        <p className="font-mono text-sm uppercase tracking-widest text-[#ccc3d8]">
          The AI Goddess of Wisdom
        </p>
      </div>

      {/* Suggestion Cards */}
      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        {SUGGESTION_CARDS.map((card) => (
          <button
            key={card.title}
            onClick={() => onSuggestionClick(card.title)}
            data-testid={`suggestion-${card.title}`}
            className={cn(
              "flex flex-col items-start rounded-2xl p-5 text-left",
              "border border-[#4a4455]/10 bg-[#131b2e]",
              "transition-all duration-300 hover:bg-[#222a3d]",
              "group"
            )}
          >
            <card.icon className={cn("mb-3 h-5 w-5", card.iconColor)} />
            <span className="mb-1 text-sm font-medium text-[#dae2fd]">
              {card.title}
            </span>
            <span className="text-xs leading-relaxed text-[#ccc3d8]">
              {card.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
