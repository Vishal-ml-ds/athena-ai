"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./message-bubble";
import { ChatInput } from "./chat-input";
import { useConversationStore } from "@/stores/conversation-store";

export function ChatArea() {
  const {
    messages,
    activeConversationId,
    isStreaming,
    streamingContent,
    activeAgent,
    sendMessage,
    createConversation,
  } = useConversationStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleSend = async (content: string) => {
    if (!activeConversationId) {
      await createConversation("New Chat");
    }
    sendMessage(content);
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Messages Area */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="mx-auto max-w-3xl py-4">
          {messages.length === 0 && !isStreaming ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  agentName={msg.agentName}
                />
              ))}

              {/* Streaming message */}
              {isStreaming && streamingContent && (
                <MessageBubble
                  role="assistant"
                  content={streamingContent}
                  agentName={activeAgent || "general"}
                  isStreaming
                />
              )}

              {/* Agent thinking indicator */}
              {isStreaming && !streamingContent && (
                <div className="flex items-center gap-2 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600">
                    <Sparkles className="h-4 w-4 animate-pulse text-white" />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {activeAgent
                      ? `${activeAgent} is thinking...`
                      : "ATHENA is thinking..."}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput onSend={handleSend} isStreaming={isStreaming} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-20">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600/20">
        <Sparkles className="h-8 w-8 text-purple-500" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">
        Welcome to ATHENA
      </h2>
      <p className="max-w-md text-center text-sm text-muted-foreground">
        The AI Goddess of Wisdom. Ask me anything — research, scheduling,
        coding, finance, health, or just chat.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-2">
        {[
          "Research the latest AI trends",
          "Help me plan my week",
          "Explain how LangGraph works",
          "Track my expenses this month",
        ].map((suggestion) => (
          <button
            key={suggestion}
            className="rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
