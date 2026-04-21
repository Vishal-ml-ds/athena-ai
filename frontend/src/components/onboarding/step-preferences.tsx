"use client";

import { Moon, Sun, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TIMEZONE_OPTIONS = [
  { value: "America/Los_Angeles", label: "UTC-08:00 (Pacific Time)" },
  { value: "America/New_York", label: "UTC-05:00 (Eastern Time)" },
  { value: "Europe/London", label: "UTC+00:00 (GMT)" },
  { value: "Europe/Berlin", label: "UTC+01:00 (Central European)" },
  { value: "Asia/Kolkata", label: "UTC+05:30 (India Standard)" },
  { value: "Asia/Tokyo", label: "UTC+09:00 (Japan Standard)" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "zh", label: "Mandarin" },
] as const;

const VOICE_OPTIONS = [
  { value: "athena", label: "Athena (Default)" },
  { value: "nova", label: "Nova" },
  { value: "onyx", label: "Onyx" },
  { value: "echo", label: "Echo" },
  { value: "solstice", label: "Solstice" },
] as const;

type ThemePreference = "dark" | "light";

interface PreferencesData {
  timezone: string;
  language: string;
  theme: ThemePreference;
  voice: string;
}

interface StepPreferencesProps {
  preferences: PreferencesData;
  onPreferencesChange: (prefs: PreferencesData) => void;
  onContinue: () => void;
}

export function StepPreferences({
  preferences,
  onPreferencesChange,
  onContinue,
}: StepPreferencesProps) {
  const updateField = <K extends keyof PreferencesData>(
    field: K,
    value: PreferencesData[K]
  ) => {
    onPreferencesChange({ ...preferences, [field]: value });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onContinue();
  };

  return (
    <section className="glass-card w-full max-w-[600px] rounded-xl border border-white/5 p-8 shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)] md:p-12">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-block rounded-full bg-[#ffb95f]/10 px-3 py-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#ffb95f]">
            Environment configuration
          </span>
        </div>
        <h1 className="font-headline text-3xl font-bold tracking-tight text-white md:text-4xl">
          Calibrating your environment
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Timezone & Language */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="timezone"
              className="ml-1 block font-mono text-[10px] uppercase tracking-wider text-[#958da1]"
            >
              Timezone
            </label>
            <select
              id="timezone"
              value={preferences.timezone}
              onChange={(e) => updateField("timezone", e.target.value)}
              data-testid="timezone-select"
              className={cn(
                "w-full appearance-none rounded-lg border-none bg-[#060e20] px-4 py-3",
                "text-sm font-medium text-[#dae2fd]",
                "transition-all focus:ring-1 focus:ring-[#d2bbff]/40",
                "bg-[length:1.5em_1.5em] bg-[position:right_0.75rem_center] bg-no-repeat",
                "bg-[url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23958da1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")]"
              )}
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="language"
              className="ml-1 block font-mono text-[10px] uppercase tracking-wider text-[#958da1]"
            >
              Language
            </label>
            <select
              id="language"
              value={preferences.language}
              onChange={(e) => updateField("language", e.target.value)}
              data-testid="language-select"
              className={cn(
                "w-full appearance-none rounded-lg border-none bg-[#060e20] px-4 py-3",
                "text-sm font-medium text-[#dae2fd]",
                "transition-all focus:ring-1 focus:ring-[#d2bbff]/40",
                "bg-[length:1.5em_1.5em] bg-[position:right_0.75rem_center] bg-no-repeat",
                "bg-[url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23958da1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")]"
              )}
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Theme & Voice */}
        <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="ml-1 block font-mono text-[10px] uppercase tracking-wider text-[#958da1]">
              Interface Theme
            </label>
            <div className="inline-flex w-full rounded-full bg-[#060e20] p-1">
              <button
                type="button"
                onClick={() => updateField("theme", "dark")}
                data-testid="theme-dark"
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  preferences.theme === "dark"
                    ? "bg-[#7c3aed] text-white shadow-lg"
                    : "text-[#958da1] hover:text-[#dae2fd]"
                )}
              >
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => updateField("theme", "light")}
                data-testid="theme-light"
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  preferences.theme === "light"
                    ? "bg-[#7c3aed] text-white shadow-lg"
                    : "text-[#958da1] hover:text-[#dae2fd]"
                )}
              >
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="voice"
              className="ml-1 block font-mono text-[10px] uppercase tracking-wider text-[#958da1]"
            >
              Preferred AI voice
            </label>
            <select
              id="voice"
              value={preferences.voice}
              onChange={(e) => updateField("voice", e.target.value)}
              data-testid="voice-select"
              className={cn(
                "w-full appearance-none rounded-lg border-none bg-[#060e20] px-4 py-3",
                "text-sm font-medium text-[#dae2fd]",
                "transition-all focus:ring-1 focus:ring-[#d2bbff]/40",
                "bg-[length:1.5em_1.5em] bg-[position:right_0.75rem_center] bg-no-repeat",
                "bg-[url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23958da1' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")]"
              )}
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-6">
          <button
            type="submit"
            data-testid="continue-step-2"
            className={cn(
              "glow-button flex w-full items-center justify-center gap-2",
              "rounded-lg py-4 font-headline font-bold text-white",
              "active:scale-95 transition-all"
            )}
          >
            <span>Continue</span>
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-6 text-center font-mono text-xs text-[#958da1]">
            <span className="text-[#ffb95f]/80">v2.0.4 - Celestial</span>{" "}
            Pulse Active
          </p>
        </div>
      </form>
    </section>
  );
}
