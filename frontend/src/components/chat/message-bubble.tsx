"use client";

import { Brain, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentName?: string;
  isStreaming?: boolean;
}

const AGENT_COLORS: Record<string, string> = {
  general: "bg-purple-500/20 text-purple-400",
  researcher: "bg-blue-500/20 text-blue-400",
  scheduler: "bg-green-500/20 text-green-400",
  life_coach: "bg-amber-500/20 text-amber-400",
  coder: "bg-cyan-500/20 text-cyan-400",
  browser: "bg-orange-500/20 text-orange-400",
  finance: "bg-emerald-500/20 text-emerald-400",
};

export function MessageBubble({
  role,
  content,
  agentName,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser ? "justify-end" : "")}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600">
          <Brain className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Message Content */}
      <div className={cn("max-w-[80%] space-y-1", isUser ? "items-end" : "")}>
        {/* Agent Badge */}
        {agentName && !isUser && (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-normal",
              AGENT_COLORS[agentName] || AGENT_COLORS.general
            )}
          >
            {agentName}
          </Badge>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-purple-600 text-white"
              : "bg-muted text-foreground"
          )}
        >
          <div className="whitespace-pre-wrap">{content}</div>
          {isStreaming && (
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-purple-400" />
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
