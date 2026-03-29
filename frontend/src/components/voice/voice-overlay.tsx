"use client";

import { useState, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

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

type RecordingState = "idle" | "recording" | "processing";
type VoiceMode = "hands-free" | "push-to-talk";

// --- Constants ---

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

const IDLE_BARS = [
  { height: "h-1", opacity: "opacity-30" },
  { height: "h-2", opacity: "opacity-30" },
  { height: "h-1", opacity: "opacity-30" },
  { height: "h-2", opacity: "opacity-30" },
  { height: "h-1", opacity: "opacity-30" },
  { height: "h-2", opacity: "opacity-30" },
  { height: "h-1", opacity: "opacity-30" },
  { height: "h-2", opacity: "opacity-30" },
] as const;

// --- Sub-Components ---

function WaveformBars({ isRecording }: { isRecording: boolean }) {
  const bars = isRecording ? WAVEFORM_BARS : IDLE_BARS;

  return (
    <div className="flex items-end gap-1.5 h-16 w-64 justify-center mb-10">
      {bars.map((bar, i) => (
        <div
          key={i}
          className={`w-1 bg-[#d2bbff] ${bar.opacity} rounded-full ${bar.height}`}
          style={
            isRecording
              ? { animation: `voice-waveform 1.2s infinite ${"delay" in bar ? bar.delay : "0s"}` }
              : undefined
          }
        />
      ))}
    </div>
  );
}

function TranscriptArea({ entries }: { entries: TranscriptEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="w-full max-w-2xl h-48 flex items-center justify-center px-4">
        <p className="text-slate-500 text-sm font-mono text-center">
          Tap the microphone to start recording. Your transcript will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl h-48 overflow-y-auto flex flex-col gap-6 px-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={`flex flex-col ${entry.speaker === "user" ? "items-end" : "items-start"} w-full`}
        >
          <span
            className={`text-[10px] uppercase tracking-widest mb-1 px-2 ${
              entry.speaker === "user" ? "text-slate-500" : "text-[#ffb95f]"
            }`}
          >
            {entry.speaker === "user" ? "You" : "ATHENA"}
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
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const entryCountRef = useRef(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        if (chunksRef.current.length === 0) return;

        setRecordingState("processing");
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });

        // For MVP: transcription API not wired yet
        // Show the recorded audio info and a coming soon message
        entryCountRef.current += 1;
        const newEntry: TranscriptEntry = {
          id: String(entryCountRef.current),
          speaker: "user",
          text: `[Recorded ${(blob.size / 1024).toFixed(1)} KB of audio]`,
        };

        entryCountRef.current += 1;
        const athenaReply: TranscriptEntry = {
          id: String(entryCountRef.current),
          speaker: "athena",
          text: "Voice transcription requires an OpenAI API key. Coming soon!",
        };

        setTranscript((prev) => [...prev, newEntry, athenaReply]);
        setRecordingState("idle");

        toast.info("Voice transcription coming soon", {
          description: "Audio was captured successfully. Whisper integration is in progress.",
        });
      };

      mediaRecorder.start();
      setRecordingState("recording");
    } catch {
      toast.error("Microphone access denied", {
        description: "Please allow microphone access in your browser settings.",
      });
      setRecordingState("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleMicClick = useCallback(() => {
    if (recordingState === "recording") {
      stopRecording();
    } else if (recordingState === "idle") {
      startRecording();
    }
  }, [recordingState, startRecording, stopRecording]);

  const handleClose = useCallback(() => {
    // Stop recording if active before closing
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current.stop();
    }
    setRecordingState("idle");
    setTranscript([]);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const isRecording = recordingState === "recording";
  const isProcessing = recordingState === "processing";

  const statusText = isRecording
    ? "ATHENA is listening..."
    : isProcessing
      ? "Processing audio..."
      : "Tap the orb to speak";

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
          <span className="text-xl font-bold text-slate-100 font-headline tracking-tight">
            ATHENA
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#d2bbff] border border-[#d2bbff]/20">
            VOICE_MODE
          </span>
        </div>
        <button
          onClick={handleClose}
          className="p-2 text-slate-400 hover:text-white transition-colors"
          data-testid="voice-overlay-close"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Center Content */}
      <div className="flex flex-col items-center mb-12 relative z-10">
        {/* AI Core Pulse -- clickable microphone */}
        <button
          onClick={handleMicClick}
          disabled={isProcessing}
          className="relative flex items-center justify-center mb-8 group disabled:opacity-50"
          data-testid="voice-mic-orb"
        >
          {isRecording && (
            <div className="absolute w-36 h-36 rounded-full bg-[#7c3aed]/20 animate-ping" />
          )}
          <div
            className={`w-[120px] h-[120px] rounded-full flex items-center justify-center relative z-10 border transition-all ${
              isRecording
                ? "bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] border-[#d2bbff]/30 scale-110"
                : "bg-gradient-to-tr from-[#4C1D95] to-[#6D28D9] border-[#d2bbff]/20 group-hover:scale-105"
            }`}
            style={{
              boxShadow: isRecording
                ? "0 0 60px 10px rgba(124, 58, 237, 0.4)"
                : "0 0 30px 5px rgba(124, 58, 237, 0.2)",
            }}
          >
            {isProcessing ? (
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            ) : (
              <Mic className="h-12 w-12 text-white" />
            )}
          </div>
        </button>

        {/* Status Text */}
        <h1 className="font-headline text-3xl font-light text-white tracking-wide mb-6">
          {statusText}
        </h1>

        {/* Waveform */}
        <WaveformBars isRecording={isRecording} />

        {/* Transcript */}
        <TranscriptArea entries={transcript} />
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
            onClick={handleClose}
            className="w-[72px] h-[72px] rounded-full bg-[#93000a] text-[#ffdad6] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
            data-testid="voice-end-call"
          >
            <PhoneOff className="h-8 w-8" />
          </button>

          <button
            onClick={() => toast.info("Speaker output controls coming soon")}
            className="w-12 h-12 rounded-full border border-[#4a4455]/30 flex items-center justify-center text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
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
