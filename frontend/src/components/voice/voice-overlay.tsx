"use client";

import { useState } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  X,
} from "lucide-react";

// --- Types ---

interface TranscriptEntry {
  id: string;
  speaker: "user" | "athena";
  text: string;
  isStreaming?: boolean;
}

interface VoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- Constants ---

const MOCK_TRANSCRIPT: TranscriptEntry[] = [
  {
    id: "1",
    speaker: "user",
    text: '"ATHENA, can you summarize the latest market insights for the quantum computing sector?"',
  },
  {
    id: "2",
    speaker: "athena",
    text: "Analyzing global data streams... I've identified three key shifts in qubit stability protocols and a significant increase in venture capital flow toward fault-tolerant systems.",
  },
  {
    id: "3",
    speaker: "user",
    text: '"What about the impact on encryption..."',
    isStreaming: true,
  },
];

const WAVEFORM_BARS = [
  { height: "h-4", opacity: "opacity-60", delay: "0s" },
  { height: "h-8", opacity: "opacity-80", delay: "0.2s" },
  { height: "h-12", opacity: "", delay: "0.4s" },
  { height: "h-6", opacity: "opacity-90", delay: "0.1s" },
  { height: "h-10", opacity: "opacity-70", delay: "0.3s" },
  { height: "h-14", opacity: "", delay: "0.5s" },
  { height: "h-9", opacity: "opacity-80", delay: "0.2s" },
  { height: "h-5", opacity: "opacity-60", delay: "0.6s" },
] as const;

type VoiceMode = "hands-free" | "push-to-talk";

// --- Components ---

function WaveformBars() {
  return (
    <div className="flex items-end gap-1.5 h-16 w-64 justify-center mb-10">
      {WAVEFORM_BARS.map((bar, i) => (
        <div
          key={i}
          className={`w-1 bg-[#d2bbff] ${bar.opacity} rounded-full ${bar.height}`}
          style={{
            animation: `voice-waveform 1.2s infinite ${bar.delay}`,
          }}
        />
      ))}
    </div>
  );
}

function TranscriptArea() {
  return (
    <div className="w-full max-w-2xl h-48 overflow-y-auto flex flex-col gap-6 px-4">
      {MOCK_TRANSCRIPT.map((entry) => (
        <div
          key={entry.id}
          className={`flex flex-col ${entry.speaker === "user" ? "items-end" : "items-start"} w-full`}
        >
          <span
            className={`text-[10px] uppercase tracking-widest mb-1 px-2 ${
              entry.speaker === "user" ? "text-slate-500" : "text-[#ffb95f]"
            }`}
          >
            {entry.speaker === "user" ? "User" : "ATHENA"}
          </span>
          <div
            className={`max-w-[85%] text-lg leading-relaxed ${
              entry.speaker === "user"
                ? "text-right text-slate-400"
                : "text-left text-white bg-[#171f33]/30 backdrop-blur-md p-4 rounded-xl border border-white/5"
            } ${entry.isStreaming ? "animate-pulse italic" : ""}`}
          >
            {entry.text}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Main Component ---

export function VoiceOverlay({ isOpen, onClose }: VoiceOverlayProps) {
  const [voiceMode, setVoiceMode] = useState<VoiceMode>("hands-free");
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b1326]">
      {/* Radial nebula background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, rgba(124, 58, 237, 0.15) 0%, rgba(11, 19, 38, 1) 70%)",
        }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <pattern id="voice-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#voice-grid)" />
        </svg>
      </div>

      {/* Top header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-100 font-[family-name:'Space_Grotesk'] tracking-tight">
            ATHENA
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] border border-[#d2bbff]/20">
            VOICE_MODE
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          data-testid="voice-overlay-close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Center Content */}
      <div className="flex flex-col items-center mb-12 relative z-10">
        {/* AI Core Pulse */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-36 h-36 rounded-full bg-[#7c3aed]/20 animate-ping" />
          <div
            className="w-[120px] h-[120px] rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center relative z-10 border border-[#d2bbff]/30"
            style={{ boxShadow: "0 0 60px 10px rgba(124, 58, 237, 0.4)" }}
          >
            <Mic className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Listening Text */}
        <h1 className="font-[family-name:'Space_Grotesk'] text-3xl font-light text-white tracking-wide mb-6">
          ATHENA is listening...
        </h1>

        {/* Waveform */}
        <WaveformBars />

        {/* Transcript */}
        <TranscriptArea />
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-12 flex flex-col items-center gap-8 w-full max-w-md px-6 z-10">
        {/* Mode Toggle */}
        <div className="flex p-1 bg-[#131b2e]/60 backdrop-blur-xl rounded-full border border-[#4a4455]/10 w-full">
          <button
            onClick={() => setVoiceMode("hands-free")}
            className={`flex-1 py-3 px-6 rounded-full text-xs uppercase tracking-widest transition-all ${
              voiceMode === "hands-free"
                ? "bg-[#7c3aed] text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Hands-free
          </button>
          <button
            onClick={() => setVoiceMode("push-to-talk")}
            className={`flex-1 py-3 px-6 rounded-full text-xs uppercase tracking-widest transition-all ${
              voiceMode === "push-to-talk"
                ? "bg-[#7c3aed] text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Push to talk
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-10">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full border border-[#4a4455]/30 flex items-center justify-center text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            data-testid="voice-mute-toggle"
          >
            <MicOff className={`h-6 w-6 ${isMuted ? "text-red-400" : ""}`} />
          </button>

          <button
            onClick={onClose}
            className="w-[72px] h-[72px] rounded-full bg-[#93000a] text-[#ffdad6] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            data-testid="voice-end-call"
          >
            <PhoneOff className="h-8 w-8" />
          </button>

          <button className="w-12 h-12 rounded-full border border-[#4a4455]/30 flex items-center justify-center text-slate-300 hover:bg-white/5 hover:text-white transition-all">
            <Volume2 className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#d2bbff]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ffb95f]/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
