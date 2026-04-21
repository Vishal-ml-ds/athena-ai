"use client";

import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListenButton } from "./listen-button";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentName?: string;
  isStreaming?: boolean;
}

const AGENT_BADGE_STYLES: Record<string, string> = {
  general: "text-[#d2bbff] border-[#d2bbff]/10",
  researcher: "text-[#d2bbff] border-[#d2bbff]/10",
  scheduler: "text-[#ffb95f] border-[#ffb95f]/10",
  life_coach: "text-[#ffb95f] border-[#ffb95f]/10",
  coder: "text-[#d2bbff] border-[#d2bbff]/10",
  browser: "text-[#ffb95f] border-[#ffb95f]/10",
  finance: "text-[#ffb95f] border-[#ffb95f]/10",
  analytics: "text-[#ffb95f] border-[#ffb95f]/10",
};

export function MessageBubble({
  role,
  content,
  agentName,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === "user";

  if (isUser) {
    return <UserMessage content={content} />;
  }

  return (
    <AssistantMessage
      content={content}
      agentName={agentName}
      isStreaming={isStreaming}
    />
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex flex-col items-end space-y-2">
      <div className="mb-1 flex items-center gap-2 px-2">
        <span className="font-mono text-[10px] uppercase tracking-tighter text-[#958da1]">
          You
        </span>
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-3xl rounded-tr-none px-6 py-4",
          "bg-[#7c3aed] text-white",
          "shadow-lg shadow-[#7c3aed]/10"
        )}
      >
        <p className="leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  content: string;
  agentName?: string;
  isStreaming: boolean;
}

function AssistantMessage({
  content,
  agentName,
  isStreaming,
}: AssistantMessageProps) {
  const badgeStyle =
    AGENT_BADGE_STYLES[agentName ?? "general"] ??
    AGENT_BADGE_STYLES.general;

  return (
    <div className="flex flex-col items-start space-y-4">
      {/* Role Label + Agent Badge */}
      <div className="mb-1 flex items-center gap-3">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            "border border-[#d2bbff]/30 bg-[#171f33]",
            "shadow-[0_0_15px_rgba(124,58,237,0.2)]"
          )}
        >
          <Brain className="h-4 w-4 text-[#d2bbff]" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ffb95f]">
            ATHENA AI
          </span>
          {agentName && (
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded border bg-[#2d3449] px-2 py-0.5",
                  "font-mono text-[9px] uppercase",
                  badgeStyle
                )}
              >
                {agentName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Editorial Content -- NOT a chat bubble */}
      <div
        className={cn(
          "glass-panel max-w-[90%] rounded-3xl rounded-tl-none px-7 py-6",
          "border border-[#4a4455]/5 bg-[#171f33]",
          "shadow-xl"
        )}
      >
        <div className="space-y-4 text-lg font-light leading-relaxed text-[#dae2fd]">
          <div className="whitespace-pre-wrap">{content}</div>
          {isStreaming && (
            <span className="ml-1 inline-block h-5 w-1 animate-pulse rounded-full bg-[#d2bbff]" />
          )}
        </div>
        {!isStreaming && content.trim().length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <ListenButton text={content} />
          </div>
        )}
      </div>
    </div>
  );
}
