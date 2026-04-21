"use client";

import { useCallback, useRef, useState } from "react";
import {
  Globe,
  Check,
  Lock,
  StopCircle,
  Info,
  Eye,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// --- Types ---

type StepStatus = "completed" | "active" | "pending";

interface TimelineStep {
  id: string;
  label: string;
  detail?: string;
  url?: string;
  status: StepStatus;
  time: string;
}

interface BrowserPlan {
  url: string;
  wait_selector: string | null;
  goal: string;
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

function nowHHMM(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

// --- Sub-components ---

function ActionTimeline({ steps, isRunning }: { steps: TimelineStep[]; isRunning: boolean }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">
        Automation Stream
      </h3>

      {steps.length === 0 && !isRunning && (
        <p className="text-slate-500 text-sm font-mono text-center mt-12">
          Enter a task above and click Execute to start.
        </p>
      )}

      {isRunning && steps.length === 0 && (
        <div className="flex items-center justify-center mt-12 gap-3 text-[#d2bbff]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-mono">Launching browser...</span>
        </div>
      )}

      <div className="relative space-y-6">
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
              <div className="flex flex-col min-w-0 flex-1">
                <span
                  className={`text-sm font-medium ${
                    step.status === "active"
                      ? "text-[#d2bbff] font-semibold"
                      : step.status === "pending"
                        ? "text-slate-400"
                        : "text-slate-100"
                  }`}
                >
                  {step.label}
                </span>
                {step.detail && (
                  <span className="text-[11px] text-slate-400 mt-0.5 break-words">
                    {step.detail}
                  </span>
                )}
                <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {step.time}
                </span>
                {step.url && (
                  <span className="text-[10px] font-mono text-[#d2bbff]/70 truncate max-w-[220px]">
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

function BrowserViewport({
  plan,
  screenshot,
  finalUrl,
  isRunning,
}: {
  plan: BrowserPlan | null;
  screenshot: string | null;
  finalUrl: string | null;
  isRunning: boolean;
}) {
  const displayUrl = finalUrl ?? plan?.url ?? "https://";

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
            {displayUrl}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Real Chromium
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative bg-slate-950 min-h-[420px]">
        {screenshot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Rendered page screenshot"
            className="w-full h-full object-contain object-top"
            data-testid="browser-screenshot"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center gap-3">
            {isRunning ? (
              <>
                <Loader2 className="h-8 w-8 text-[#d2bbff] animate-spin" />
                <p className="text-[#d2bbff]/70 font-mono text-xs">
                  {plan ? `navigating to ${new URL(plan.url).host}` : "planning..."}
                </p>
              </>
            ) : (
              <p className="text-slate-600 font-mono text-sm">
                Real browser viewport
              </p>
            )}
          </div>
        )}
      </div>

      {/* Meta Bar */}
      <div className="px-6 py-3 bg-[#171f33]/60 flex justify-between items-center">
        <div className="flex gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Status</span>
            <span className="text-xs text-[#dae2fd] font-mono">
              {isRunning ? "Running" : screenshot ? "Completed" : "Idle"}
            </span>
          </div>
          {plan?.goal && (
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Goal</span>
              <span
                className="text-xs text-[#dae2fd] font-mono truncate max-w-[360px]"
                title={plan.goal}
              >
                {plan.goal}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="h-4 w-4" />
          <span className="text-xs font-mono">Headless Chromium on Modal</span>
        </div>
      </div>
    </div>
  );
}

function AnswerPanel({ answer, finalUrl }: { answer: string | null; finalUrl: string | null }) {
  if (!answer) return null;
  return (
    <div className="flex gap-4 items-start px-6 py-5 bg-[#131b2e] rounded-xl border border-[#7c3aed]/20">
      <Sparkles className="h-5 w-5 text-[#d2bbff] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-mono uppercase tracking-widest text-[#d2bbff] mb-2">
          Browser agent answer
        </h4>
        <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
          {answer}
        </p>
        {finalUrl && (
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-[11px] font-mono text-[#d2bbff]/80 hover:text-[#d2bbff] underline decoration-dotted truncate max-w-full"
          >
            {finalUrl}
          </a>
        )}
      </div>
    </div>
  );
}

// --- Page ---

export default function BrowserAutomationPage() {
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [plan, setPlan] = useState<BrowserPlan | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const counterRef = useRef(0);

  const pushStep = useCallback(
    (label: string, detail?: string, url?: string) => {
      counterRef.current += 1;
      const id = String(counterRef.current);
      setSteps((prev) => {
        const finalized = prev.map((s) =>
          s.status === "active" ? { ...s, status: "completed" as StepStatus } : s,
        );
        return [
          ...finalized,
          { id, label, detail, url, status: "active" as StepStatus, time: nowHHMM() },
        ];
      });
    },
    [],
  );

  const finalizeActive = useCallback(() => {
    setSteps((prev) =>
      prev.map((s) =>
        s.status === "active" ? { ...s, status: "completed" as StepStatus } : s,
      ),
    );
  }, []);

  const handleExecute = useCallback(async () => {
    if (!task.trim() || isRunning) return;

    setSteps([]);
    setPlan(null);
    setScreenshot(null);
    setAnswer(null);
    setFinalUrl(null);
    counterRef.current = 0;
    setIsRunning(true);

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
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          switch (event.type) {
            case "start":
              pushStep("Task started", undefined);
              break;
            case "status":
              pushStep(String(event.message ?? "status"));
              break;
            case "plan": {
              const p: BrowserPlan = {
                url: String(event.url ?? ""),
                wait_selector: (event.wait_selector as string | null) ?? null,
                goal: String(event.goal ?? ""),
              };
              setPlan(p);
              pushStep("Plan locked", p.goal, p.url);
              break;
            }
            case "screenshot": {
              const png = event.png_base64 as string | undefined;
              if (png) {
                setScreenshot(png);
                pushStep("Screenshot captured", undefined);
              }
              break;
            }
            case "extract":
              setFinalUrl((event.final_url as string) ?? null);
              pushStep(
                "Text extracted",
                event.title ? `"${String(event.title).slice(0, 80)}"` : undefined,
                (event.final_url as string) ?? undefined,
              );
              break;
            case "answer":
              setAnswer(String(event.content ?? ""));
              setFinalUrl((event.final_url as string) ?? null);
              pushStep("Answer ready", undefined);
              break;
            case "error":
              toast.error("Browser step failed", {
                description: String(event.message ?? "unknown"),
              });
              break;
            case "done":
              finalizeActive();
              setIsRunning(false);
              break;
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
      finalizeActive();
    }
  }, [task, isRunning, pushStep, finalizeActive]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsRunning(false);
    finalizeActive();
    toast.info("Task stopped");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0b1326] overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <section className="w-[350px] bg-[#1E293B] flex flex-col border-r border-[#4a4455]/10 shrink-0">
          <div className="p-6 border-b border-[#4a4455]/10">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-5 w-5 text-[#d2bbff]" />
              <h1 className="text-xl font-bold font-headline tracking-tight text-white">
                Browser Agent
              </h1>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
                  Task
                </label>
                <textarea
                  className="w-full h-32 bg-[#060e20] border-none rounded-xl text-sm focus:ring-1 focus:ring-[#d2bbff]/40 text-[#dae2fd] p-4 resize-none transition-all outline-none"
                  placeholder="e.g. open https://news.ycombinator.com and tell me the top story"
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
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleExecute}
                  disabled={!task.trim()}
                  className="w-full bg-[#7c3aed] hover:bg-[#d2bbff] py-3 rounded-lg text-white font-semibold transition-all shadow-lg shadow-[#7c3aed]/20 disabled:opacity-50"
                  data-testid="browser-execute-btn"
                >
                  Run in Chromium
                </button>
              )}
            </div>
          </div>

          <ActionTimeline steps={steps} isRunning={isRunning} />
        </section>

        {/* Right Panel */}
        <section className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 min-h-0">
            <BrowserViewport
              plan={plan}
              screenshot={screenshot}
              finalUrl={finalUrl}
              isRunning={isRunning}
            />
          </div>

          <AnswerPanel answer={answer} finalUrl={finalUrl} />

          {!answer && (
            <div className="flex items-center gap-4 px-6 py-4 bg-[#131b2e] rounded-xl border border-[#4a4455]/5">
              <Info className="h-5 w-5 text-[#ffb95f] shrink-0" />
              <p className="text-sm text-slate-400 italic">
                Real headless Chromium runs on Modal, visits the page, captures a screenshot,
                and grounds its answer in the actual page text.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
