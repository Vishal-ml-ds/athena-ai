"use client";

import {
  Code,
  Brain,
  Banknote,
  Heart,
  Zap,
  GraduationCap,
  Rocket,
  Palette,
  Megaphone,
  PenLine,
  Music,
  Compass,
} from "lucide-react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const INTEREST_OPTIONS = [
  { id: "coding", label: "Coding", icon: Code },
  { id: "ai-ml", label: "AI/ML", icon: Brain },
  { id: "finance", label: "Finance", icon: Banknote },
  { id: "health", label: "Health", icon: Heart },
  { id: "productivity", label: "Productivity", icon: Zap },
  { id: "learning", label: "Learning", icon: GraduationCap },
  { id: "startups", label: "Startups", icon: Rocket },
  { id: "design", label: "Design", icon: Palette },
  { id: "marketing", label: "Marketing", icon: Megaphone },
  { id: "writing", label: "Writing", icon: PenLine },
  { id: "music", label: "Music", icon: Music },
  { id: "travel", label: "Travel", icon: Compass },
] as const;

const MIN_SELECTIONS = 1;

interface StepInterestsProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function StepInterests({
  selectedInterests,
  onInterestsChange,
  onSubmit,
  isSubmitting,
}: StepInterestsProps) {
  const toggleInterest = (interestId: string) => {
    const isSelected = selectedInterests.includes(interestId);
    if (isSelected) {
      onInterestsChange(selectedInterests.filter((id) => id !== interestId));
    } else {
      onInterestsChange([...selectedInterests, interestId]);
    }
  };

  const hasEnoughSelections = selectedInterests.length >= MIN_SELECTIONS;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!hasEnoughSelections || isSubmitting) return;
    onSubmit();
  };

  return (
    <section className="glass-card w-full max-w-[600px] rounded-xl border border-white/5 p-8 shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)] md:p-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-4 font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
          What should ATHENA focus on?
        </h1>
        <p className="mx-auto max-w-sm text-sm text-[#ccc3d8] opacity-80">
          Select the domains where you want the AI to exhibit maximum expertise
          and proactive insight.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Interests Grid */}
        <div className="mb-12 grid grid-cols-2 gap-3 md:grid-cols-3">
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = selectedInterests.includes(interest.id);
            const Icon = interest.icon;

            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                data-testid={`interest-${interest.id}`}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full px-4 py-2.5",
                  "text-sm font-medium transition-all duration-200",
                  "border border-[#4a4455]/30",
                  isSelected
                    ? "bg-[#7c3aed] text-white border-transparent"
                    : "bg-[#060e20] text-[#ccc3d8] hover:bg-[#222a3d]"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {interest.label}
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-center gap-6">
          <button
            type="submit"
            disabled={!hasEnoughSelections || isSubmitting}
            data-testid="initialize-athena"
            className={cn(
              "glow-button flex w-full items-center justify-center gap-3",
              "rounded-lg py-4 font-headline text-lg font-bold tracking-wide text-white",
              "active:scale-95 transition-all",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            )}
          >
            {isSubmitting ? "Initializing..." : "Initialize ATHENA"}
            <Sparkles className="h-5 w-5" />
          </button>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#958da1]">
            You can always change these in Settings
          </p>
        </div>
      </form>
    </section>
  );
}
