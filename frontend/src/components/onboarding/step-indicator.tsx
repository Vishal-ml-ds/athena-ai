"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Identity" },
  { number: 2, label: "Preferences" },
  { number: 3, label: "Interests" },
] as const;

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex w-full max-w-[600px] items-center justify-between px-4">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const isUpcoming = currentStep < step.number;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ring-4 ring-[#0b1326] transition-all duration-300",
                  isActive &&
                    "bg-[#7c3aed] text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]",
                  isCompleted &&
                    "border border-[#d2bbff]/40 bg-[#7c3aed]/20 text-[#d2bbff]",
                  isUpcoming &&
                    "bg-[#2d3449] text-[#dae2fd] opacity-40"
                )}
              >
                {isCompleted ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-widest transition-all duration-300",
                  isActive && "font-bold text-[#d2bbff]",
                  isCompleted && "text-[#d2bbff]/60",
                  isUpcoming && "text-[#958da1] opacity-40"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line between steps */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-4 mb-6 h-[2px] w-16 transition-all duration-300",
                  currentStep > step.number
                    ? "bg-[#7c3aed]"
                    : "bg-[#2d3449]"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
