"use client";

import { useRef, useState } from "react";
import { Camera, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIdentityProps {
  displayName: string;
  avatarFile: File | null;
  onDisplayNameChange: (name: string) => void;
  onAvatarChange: (file: File | null) => void;
  onContinue: () => void;
}

export function StepIdentity({
  displayName,
  avatarFile,
  onDisplayNameChange,
  onAvatarChange,
  onContinue,
}: StepIdentityProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onAvatarChange(file);
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

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
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="group relative cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              className={cn(
                "flex h-[100px] w-[100px] flex-col items-center justify-center overflow-hidden rounded-full",
                "border-2 border-dashed border-[#7c3aed] bg-[#131b2e]",
                "transition-colors duration-300 hover:bg-[#171f33] group-hover:border-[#d2bbff]"
              )}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <Camera className="mb-1 h-8 w-8 text-[#d2bbff]" />
                  <span className="font-mono text-[9px] uppercase tracking-tighter text-[#958da1]">
                    Upload
                  </span>
                </>
              )}
            </div>
            <div
              className={cn(
                "absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full",
                "border-2 border-[#0b1326] bg-[#7c3aed] text-white"
              )}
            >
              <Plus className="h-4 w-4" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="avatar-upload-input"
            />
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
          <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-[#4a4455]">
            Process secured by celestial encryption v2.0
          </p>
        </div>
      </form>
    </section>
  );
}
