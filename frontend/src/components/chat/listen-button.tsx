"use client";

import { useRef, useState } from "react";
import { Loader2, Pause, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ListenButtonProps {
  text: string;
}

/** Per-message "Listen" button that streams text → OpenAI TTS → audio playback. */
export function ListenButton({ text }: ListenButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setState("idle");
  };

  const handleClick = async () => {
    if (state === "loading") return;
    if (state === "playing") {
      stop();
      return;
    }

    setState("loading");
    try {
      const supabase = createClient();
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;

      const res = await fetch(`${API_BASE}/api/v1/voice/synthesize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: text.slice(0, 4000), voice: "alloy" }),
      });

      const body = await res.json();
      if (!res.ok || !body.success || !body.data?.audio) {
        throw new Error(body.error?.message || "TTS failed");
      }

      const src = `data:audio/mpeg;base64,${body.data.audio}`;
      const audio = new Audio(src);
      audioRef.current = audio;

      audio.onended = () => setState("idle");
      audio.onerror = () => {
        toast.error("Audio playback failed");
        setState("idle");
      };

      await audio.play();
      setState("playing");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not play audio";
      toast.error("Listen failed", { description: message });
      setState("idle");
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#4a4455]/20 bg-[#0b1326]/50 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-[#958da1] transition-colors hover:border-[#d2bbff]/40 hover:text-[#d2bbff]"
      aria-label={state === "playing" ? "Stop audio" : "Listen to this message"}
      data-testid="chat-listen-button"
      disabled={state === "loading" || !text.trim()}
    >
      {state === "loading" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : state === "playing" ? (
        <Pause className="h-3 w-3" />
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
      {state === "playing" ? "Stop" : state === "loading" ? "Loading" : "Listen"}
    </button>
  );
}
