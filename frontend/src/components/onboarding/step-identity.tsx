"use client";

import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIdentityProps {
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onContinue: () => void;
}

export function StepIdentity({
  displayName,
  onDisplayNameChange,
  onContinue,
}: StepIdentityProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!displayName.trim()) return;
    onContinue();
  };

  return (
    <section className="glass-card w-full max-w-[600px] rounded-xl border border-[#4a4455]/10 p-10 shadow-2xl">
      <header className="mb-10 text-center">
        <span className="mb-4 block font-mono text-[10px] uppercase tracking-[0.2em] text-[#ffb95f]">
          Tell ATHENA who you are
        </span>
        <h1 className="font-headline text-4xl font-light tracking-tight text-[#dae2fd]">
          Let&apos;s initialize your neural link
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Brand icon */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "flex h-[100px] w-[100px] items-center justify-center rounded-full",
              "border border-[#7c3aed]/30 bg-[#131b2e]",
              "shadow-[0_0_40px_rgba(124,58,237,0.25)]"
            )}
          >
            <Brain className="h-12 w-12 text-[#d2bbff]" />
          </div>
        </div>

        {/* Display Name Input */}
        <div className="space-y-6">
          <div>
            <label
              htmlFor="display-name"
              className="mb-2 block px-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#ffb95f]"
            >
              What should ATHENA call you?
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="Enter your designation..."
              data-testid="display-name-input"
              className={cn(
                "w-full rounded-lg border-none bg-[#060e20] px-4 py-4",
                "font-body text-[#dae2fd] ring-1 ring-[#4a4455]/20",
                "outline-none transition-all",
                "placeholder:text-[#958da1]/40",
                "focus:bg-[#131b2e] focus:ring-[#d2bbff]/40"
              )}
            />
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!displayName.trim()}
            data-testid="continue-step-1"
            className={cn(
              "glow-button w-full rounded-lg py-5 font-headline font-bold text-white",
              "active:scale-95 transition-all duration-300",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:transform-none"
            )}
          >
            Continue to Neural Mapping
          </button>
        </div>
      </form>
    </section>
  );
}
