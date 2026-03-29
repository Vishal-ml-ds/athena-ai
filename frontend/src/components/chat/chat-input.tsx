"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  isStreaming: boolean;
}

export function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
  }, [input, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const hasInput = input.trim().length > 0;

  return (
    <footer className="absolute bottom-0 left-0 z-40 w-full bg-gradient-to-t from-[#0b1326] via-[#0b1326] to-transparent p-6">
      <div className="mx-auto max-w-3xl">
        <div
          className={cn(
            "glass-panel relative flex items-end gap-3",
            "rounded-2xl border border-[#4a4455]/10 bg-[#131b2e] p-2 pl-4",
            "shadow-2xl transition-all duration-300",
            "focus-within:border-[#d2bbff]/30"
          )}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Athena..."
            disabled={isStreaming}
            rows={1}
            data-testid="chat-input"
            className={cn(
              "max-h-48 flex-1 resize-none border-none bg-transparent py-3",
              "text-sm text-[#dae2fd] placeholder:text-[#958da1]",
              "scrollbar-hide focus:outline-none focus:ring-0"
            )}
          />

          {/* Action Buttons */}
          <div className="mb-1 flex items-center gap-1 pr-1">
            {/* Mic button -- disabled, Sprint 4 */}
            <button
              disabled
              title="Voice coming in Sprint 4"
              className="p-2 text-[#958da1] transition-colors"
              aria-label="Voice input (disabled)"
            >
              <MicOff className="h-5 w-5" />
            </button>

            {/* Send button */}
            <button
              onClick={handleSubmit}
              disabled={!hasInput || isStreaming}
              data-testid="send-button"
              aria-label="Send message"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                "bg-[#7c3aed] text-white shadow-lg",
                "transition-all hover:brightness-110 active:scale-95",
                "disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-[#958da1]/50">
          Athena may hallucinate celestial coordinates. Verify important data.
        </p>
      </div>
    </footer>
  );
}
