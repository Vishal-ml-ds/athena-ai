"use client";

import { useCallback, useRef, useState } from "react";
import {
  Globe,
  Check,
  Lock,
  Bot,
  StopCircle,
  Info,
  MousePointer2,
  Eye,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// --- Types ---

type StepStatus = "completed" | "active" | "pending";

interface TimelineStep {
  id: string;
  action: string;
  description: string;
  url?: string;
  status: StepStatus;
  time: string;
}

// --- Constants ---

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STATUS_STYLES: Record<StepStatus, { ring: string; inner: React.ReactNode }> = {
  completed: {
    ring: "bg-emerald-500/20 border border-emerald-500/40",
    inner: <Check className="h-3 w-3 text-emerald-400" />,
  },
  active: {
    ring: "bg-[#d2bbff]/20 border border-[#d2bbff]/40 relative",
    inner: (
      <>
        <div className="absolute inset-0 rounded-full bg-[#d2bbff] animate-pulse opacity-20" />
        <div className="w-2 h-2 rounded-full bg-[#d2bbff]" />
      </>
    ),
  },
  pending: {
    ring: "bg-slate-800 border border-slate-700",
    inner: null,
  },
};

// --- Helpers ---

async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

// --- Sub-components ---

function PreviewBanner() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#ffb95f]/10 border border-[#ffb95f]/20 rounded-xl mb-6">
      <AlertTriangle className="h-4 w-4 text-[#ffb95f] shrink-0" />
      <p className="text-sm text-[#ffb95f] font-medium">
        AI Task Planner — Generates intelligent browser task execution plans
      </p>
    </div>
  );
}

function ActionTimeline({ steps, isRunning }: { steps: TimelineStep[]; isRunning: boolean }) {
  const emptySteps = steps.length === 0;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">
        Automation Stream
      </h3>

      {emptySteps && !isRunning && (
        <p className="text-slate-500 text-sm font-mono text-center mt-12">
          Enter a task above and click Execute to start.
        </p>
      )}

      {isRunning && emptySteps && (
        <div className="flex items-center justify-center mt-12 gap-3 text-[#d2bbff]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-mono">Generating plan...</span>
        </div>
      )}

      <div className="relative space-y-8">
        {steps.length > 0 && (
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-700/50" />
        )}

        {steps.map((step, index) => {
          const style = STATUS_STYLES[step.status];
          return (
            <div
              key={step.id}
              className={`relative flex gap-4 items-start ${step.status === "pending" ? "opacity-40" : ""}`}
            >
              <div
                className={`z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.ring}`}
              >
                {step.status === "pending" ? (
                  <span className="text-[10px] font-mono text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                ) : (
                  style.inner
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    step.status === "active"
                      ? "text-[#d2bbff] font-semibold"
                      : step.status === "pending"
                        ? "text-slate-400"
                        : "text-slate-100"
                  }`}
                >
                  {step.description}
                </span>
                <span className="text-[10px] font-mono text-slate-500 capitalize">
                  {step.action} · {step.time}
                </span>
                {step.url && (
                  <span className="text-[10px] font-mono text-[#d2bbff]/60 truncate max-w-[220px]">
                    {step.url}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrowserViewport({ activeStep }: { activeStep: TimelineStep | null }) {
  const [isAiMode, setIsAiMode] = useState(true);

  return (
    <div className="flex flex-col h-full bg-[rgba(23,31,51,0.6)] backdrop-blur-xl rounded-2xl border border-[#4a4455]/10 overflow-hidden shadow-2xl">
      {/* URL Bar */}
      <div className="p-4 bg-[#171f33]/40 flex items-center gap-4">
        <div className="flex gap-2 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/40" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
        </div>
        <div className="flex-1 flex items-center bg-[#060e20] px-4 py-2 rounded-lg gap-3">
          <Lock className="h-3 w-3 text-slate-500 shrink-0" />
          <span className="text-slate-300 text-sm font-mono flex-1 truncate">
            {activeStep?.url ?? "https://"}
          </span>
        </div>
        <button
          onClick={() => setIsAiMode(!isAiMode)}
          className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all flex items-center gap-2 ${isAiMode ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-[#d2bbff]/40 text-[#d2bbff] hover:bg-[#d2bbff]/10"}`}
          data-testid="ai-mode-toggle"
        >
          <Bot className="h-3 w-3" />
          AI-Powered Mode
        </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative bg-slate-900 min-h-[300px]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          {activeStep ? (
            <p className="text-[#d2bbff]/60 font-mono text-sm text-center px-8">
              {activeStep.description}
            </p>
          ) : (
            <p className="text-slate-600 font-mono text-sm">AI Task Planner</p>
          )}
        </div>

        {/* AI Cursor — only show when there's an active step */}
        {activeStep && (
          <div className="absolute top-[40%] left-[60%] flex flex-col items-center pointer-events-none -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 rounded-full border-2 border-[#d2bbff] animate-ping absolute opacity-40" />
            <MousePointer2 className="h-8 w-8 text-[#d2bbff] drop-shadow-lg" />
            <div className="mt-2 bg-[#d2bbff] px-2 py-1 rounded text-[10px] text-[#3f008e] font-bold shadow-xl">
              {activeStep.action.toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Meta Bar */}
      <div className="px-6 py-3 bg-[#171f33]/60 flex justify-between items-center">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Status</span>
            <span className="text-xs text-[#dae2fd] font-mono">
              {activeStep ? "Running" : "Idle"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="h-4 w-4" />
          <span className="text-xs font-mono">AI Planner Mode</span>
        </div>
      </div>
    </div>
  );
}

// --- Page ---

export default function BrowserAutomationPage() {
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const activeStep = steps.find((s) => s.status === "active") ?? null;

  const handleExecute = useCallback(async () => {
    if (!task.trim() || isRunning) return;

    // Reset state
    setSteps([]);
    setIsRunning(true);

    // Cancel any previous stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_BASE}/api/v1/browser/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ task }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to start task: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let totalSteps = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "start") {
              totalSteps = event.total_steps;
            } else if (event.type === "step") {
              const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
              setSteps((prev) => {
                // Mark previous active as completed
                const updated = prev.map((s) =>
                  s.status === "active" ? { ...s, status: "completed" as StepStatus } : s
                );
                const isLast = event.step_index === totalSteps - 1;
                return [
                  ...updated,
                  {
                    id: String(event.step_index),
                    action: event.action || "step",
                    description: event.description || "Processing...",
                    url: event.url,
                    status: isLast ? "completed" : "active",
                    time: now,
                  },
                ];
              });
            } else if (event.type === "done") {
              setSteps((prev) =>
                prev.map((s) =>
                  s.status === "active" ? { ...s, status: "completed" as StepStatus } : s
                )
              );
              setIsRunning(false);
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        toast.error("Task execution failed", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    } finally {
      setIsRunning(false);
    }
  }, [task, isRunning]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsRunning(false);
    setSteps((prev) =>
      prev.map((s) => (s.status === "active" ? { ...s, status: "completed" as StepStatus } : s))
    );
    toast.info("Task stopped");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b1326] overflow-hidden">
      {/* Preview Banner */}
      <div className="px-8 pt-6">
        <PreviewBanner />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <section className="w-[350px] bg-[#1E293B] flex flex-col border-r border-[#4a4455]/10 shrink-0">
          {/* Task Input */}
          <div className="p-6 border-b border-[#4a4455]/10">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-5 w-5 text-[#d2bbff]" />
              <h1 className="text-xl font-bold font-headline tracking-tight text-white">
                AI Task Planner
              </h1>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
                  Instructions
                </label>
                <textarea
                  className="w-full h-32 bg-[#060e20] border-none rounded-xl text-sm focus:ring-1 focus:ring-[#d2bbff]/40 text-[#dae2fd] p-4 resize-none transition-all outline-none"
                  placeholder="What should ATHENA do on the web?"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  data-testid="browser-task-input"
                  disabled={isRunning}
                />
              </div>
              {isRunning ? (
                <button
                  onClick={handleStop}
                  className="w-full bg-red-600 hover:bg-red-500 py-3 rounded-lg text-white font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                  data-testid="browser-stop-btn"
                >
                  <StopCircle className="h-4 w-4" />
                  Stop Automation
                </button>
              ) : (
                <button
                  onClick={handleExecute}
                  disabled={!task.trim()}
                  className="w-full bg-[#7c3aed] hover:bg-[#d2bbff] py-3 rounded-lg text-white font-semibold transition-all shadow-lg shadow-[#7c3aed]/20 disabled:opacity-50"
                  data-testid="browser-execute-btn"
                >
                  Execute Task
                </button>
              )}
            </div>
          </div>

          <ActionTimeline steps={steps} isRunning={isRunning} />
        </section>

        {/* Right Panel */}
        <section className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
          <BrowserViewport activeStep={activeStep} />

          {/* Context Hint */}
          <div className="flex items-center gap-4 px-6 py-4 bg-[#131b2e] rounded-xl border border-[#4a4455]/5">
            <Info className="h-5 w-5 text-[#ffb95f] shrink-0" />
            <p className="text-sm text-slate-400 italic">
              ATHENA generates intelligent step-by-step plans for browser tasks. For live web browsing, use the Browser agent in Chat.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
