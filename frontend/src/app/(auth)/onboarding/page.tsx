"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { StepIdentity } from "@/components/onboarding/step-identity";
import { StepPreferences } from "@/components/onboarding/step-preferences";
import { StepInterests } from "@/components/onboarding/step-interests";
import { api } from "@/lib/api/client";

const TOTAL_STEPS = 3;
const FIRST_STEP = 1;

interface OnboardingPayload {
  displayName: string;
  avatarUrl: string | null;
  timezone: string;
  language: string;
  theme: "dark" | "light";
  voice: string;
  interests: string[];
}

const SLIDE_VARIANTS = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const TRANSITION_CONFIG = {
  x: { type: "spring" as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(FIRST_STEP);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Identity
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Step 2: Preferences
  const [preferences, setPreferences] = useState<{
    timezone: string;
    language: string;
    theme: "dark" | "light";
    voice: string;
  }>({
    timezone: "Asia/Kolkata",
    language: "en-US",
    theme: "dark",
    voice: "athena",
  });

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const goToNextStep = useCallback(() => {
    if (currentStep < TOTAL_STEPS) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleFinalSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const payload: OnboardingPayload = {
        displayName: displayName.trim(),
        avatarUrl: null,
        timezone: preferences.timezone,
        language: preferences.language,
        theme: preferences.theme,
        voice: preferences.voice,
        interests: selectedInterests,
      };

      // Upload avatar first if one was selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        try {
          const uploadResult = await api.post<{ url: string }>(
            "/api/v1/auth/avatar",
            formData
          );
          payload.avatarUrl = uploadResult.url;
        } catch {
          // Continue without avatar if upload fails
        }
      }

      await api.post("/api/v1/auth/onboarding", payload);
      router.push("/chat");
    } catch {
      setIsSubmitting(false);
    }
  }, [
    displayName,
    avatarFile,
    preferences,
    selectedInterests,
    router,
  ]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b1326] px-6 py-24">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7c3aed]/5 blur-[120px]" />

      {/* Step Indicator */}
      <div className="mb-8">
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Step Content with slide animation */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={SLIDE_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={TRANSITION_CONFIG}
          className="w-full flex justify-center"
        >
          {currentStep === 1 && (
            <StepIdentity
              displayName={displayName}
              avatarFile={avatarFile}
              onDisplayNameChange={setDisplayName}
              onAvatarChange={setAvatarFile}
              onContinue={goToNextStep}
            />
          )}

          {currentStep === 2 && (
            <StepPreferences
              preferences={preferences}
              onPreferencesChange={setPreferences}
              onContinue={goToNextStep}
            />
          )}

          {currentStep === 3 && (
            <StepInterests
              selectedInterests={selectedInterests}
              onInterestsChange={setSelectedInterests}
              onSubmit={handleFinalSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Decorative footer element */}
      <div className="pointer-events-none absolute bottom-4 right-8 flex select-none items-center gap-2 opacity-20">
        <span className="font-headline text-xs font-bold tracking-tighter text-white">
          ATHENA OS
        </span>
        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ffb95f]" />
      </div>
    </div>
  );
}
