"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User,
  SlidersHorizontal,
  Puzzle,
  KeyRound,
  CreditCard,
  Camera,
  ChevronDown,
  AudioLines,
  Mail,
  Terminal,
  MessageCircle,
  Trash2,
  Plus,
  HelpCircle,
  LogOut,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api/client";

/* ─── Types ─── */

type SettingsSection = "profile" | "preferences" | "integrations" | "api-keys" | "billing";

interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  preferences: Record<string, string>;
}

/* ─── Constants ─── */

const NAV_ITEMS: { id: SettingsSection; label: string; Icon: typeof User }[] = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "preferences", label: "Preferences", Icon: SlidersHorizontal },
  { id: "integrations", label: "Integrations", Icon: Puzzle },
  { id: "api-keys", label: "API Keys", Icon: KeyRound },
  { id: "billing", label: "Billing", Icon: CreditCard },
];

const TIMEZONE_OPTIONS = [
  "UTC-08:00 (Pacific Time)",
  "UTC+00:00 (GMT)",
  "UTC+01:00 (Central Europe)",
  "UTC+05:30 (India)",
] as const;

const LANGUAGE_OPTIONS = ["English (US)", "German", "Japanese", "Hindi"] as const;

const VOICE_OPTIONS = [
  "Hyperion (Male, Authority)",
  "Selene (Female, Empathetic)",
  "Atlas (Non-binary, Technical)",
] as const;

const INTEGRATIONS = [
  {
    id: "google",
    name: "Google Workspace",
    description: "Calendar & Drive Sync",
    Icon: Mail,
    status: "connected" as const,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Repository AI Agent",
    Icon: Terminal,
    status: "available" as const,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Direct Messaging Integration",
    Icon: MessageCircle,
    status: "coming-soon" as const,
  },
] as const;

const API_KEYS = [
  { id: "1", label: "Production Node", prefix: "at_live_82b9...", created: "Oct 12, 2023" },
  { id: "2", label: "Development Sandbox", prefix: "at_test_f022...", created: "Nov 04, 2023" },
] as const;

/* ─── Sub-components ─── */

function SettingsNav({
  active,
  onSelect,
}: {
  active: SettingsSection;
  onSelect: (s: SettingsSection) => void;
}) {
  return (
    <nav className="flex-1 space-y-1">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all ${
            active === item.id
              ? "text-violet-400 font-semibold bg-violet-500/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-surface-container"
          }`}
        >
          <item.Icon className="h-5 w-5" />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function ProfileSection({
  profile,
  isLoading,
}: {
  profile: UserProfile | null;
  isLoading: boolean;
}) {
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setShowSuccess(false);
    try {
      await api.patch("/api/v1/users/me", { display_name: displayName });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      /* Could show error toast */
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-6" id="profile">
      <div className="flex items-center gap-4 mb-2">
        <User className="h-5 w-5 text-athena-primary" />
        <h2 className="text-xl font-headline font-semibold text-white">User Profile</h2>
      </div>
      <div className="glass-card rounded-xl p-8 border border-outline-variant/10">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Avatar */}
            <div className="relative group cursor-pointer">
              <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-athena-primary/30 group-hover:border-athena-primary transition-colors bg-gradient-to-br from-purple-600 to-amber-500 flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Form */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 text-on-surface focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  data-testid="profile-name"
                />
              </div>
              <div className="space-y-2 opacity-60">
                <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 text-on-surface cursor-not-allowed"
                  type="email"
                  readOnly
                  value={profile?.email ?? ""}
                  data-testid="profile-email"
                />
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-3">
                {showSuccess && (
                  <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                    <CheckCircle2 className="h-4 w-4" /> Saved!
                  </span>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  data-testid="save-profile"
                  className="px-6 py-2.5 bg-surface-container-high text-athena-primary rounded-lg font-medium hover:bg-surface-container-highest transition-colors active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PreferencesSection() {
  return (
    <section className="space-y-6" id="preferences">
      <div className="flex items-center gap-4 mb-2">
        <SlidersHorizontal className="h-5 w-5 text-athena-primary" />
        <h2 className="text-xl font-headline font-semibold text-white">System Preferences</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme Toggle */}
        <div className="glass-card rounded-xl p-6 border border-outline-variant/10 flex flex-col justify-between">
          <label className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-4">
            Interface Theme
          </label>
          <div className="bg-surface-container-lowest p-1 rounded-full flex items-center">
            <button className="flex-1 py-2 px-4 rounded-full text-sm font-medium bg-athena-primary text-on-primary">
              Dark
            </button>
            <button className="flex-1 py-2 px-4 rounded-full text-sm font-medium text-slate-400 hover:text-slate-200">
              Light
            </button>
          </div>
        </div>

        {/* Timezone & Language */}
        <div className="glass-card rounded-xl p-6 border border-outline-variant/10 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Timezone
            </label>
            <div className="relative">
              <select className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-4 pr-10 text-on-surface appearance-none focus:ring-1 focus:ring-athena-primary/40 outline-none">
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz}>{tz}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-slate-500 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Language
            </label>
            <div className="relative">
              <select className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-4 pr-10 text-on-surface appearance-none focus:ring-1 focus:ring-athena-primary/40 outline-none">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang}>{lang}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Voice Synthesis */}
      <div className="glass-card rounded-xl p-6 border border-outline-variant/10">
        <label className="text-xs font-mono text-slate-500 uppercase tracking-widest block mb-4">
          AI Voice Synthesis
        </label>
        <div className="relative max-w-md">
          <select className="w-full bg-surface-container-lowest border-none rounded-lg py-3 pl-12 pr-10 text-on-surface appearance-none focus:ring-1 focus:ring-athena-primary/40 outline-none">
            {VOICE_OPTIONS.map((voice) => (
              <option key={voice}>{voice}</option>
            ))}
          </select>
          <AudioLines className="absolute left-4 top-3 h-5 w-5 text-athena-primary" />
          <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-slate-500 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  return (
    <section className="space-y-6" id="integrations">
      <div className="flex items-center gap-4 mb-2">
        <Puzzle className="h-5 w-5 text-athena-primary" />
        <h2 className="text-xl font-headline font-semibold text-white">Connected Services</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {INTEGRATIONS.map((integration) => (
          <div
            key={integration.id}
            className={`glass-card rounded-xl p-6 border border-outline-variant/10 flex flex-col items-center text-center space-y-4 ${
              integration.status === "coming-soon" ? "opacity-50 grayscale" : ""
            } ${integration.status === "available" ? "group hover:bg-surface-container-high transition-colors cursor-pointer" : ""}`}
          >
            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
              <integration.Icon
                className={`h-8 w-8 ${
                  integration.status === "connected"
                    ? "text-athena-secondary"
                    : integration.status === "available"
                      ? "text-athena-primary"
                      : "text-slate-400"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-on-surface">{integration.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{integration.description}</p>
            </div>
            {integration.status === "connected" && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Connected
              </div>
            )}
            {integration.status === "available" && (
              <button className="w-full py-2 bg-surface-container-high rounded-lg text-sm font-medium hover:bg-primary-container hover:text-white transition-all">
                Connect
              </button>
            )}
            {integration.status === "coming-soon" && (
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ApiKeysSection() {
  return (
    <section className="space-y-6" id="api-keys">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <KeyRound className="h-5 w-5 text-athena-primary" />
          <h2 className="text-xl font-headline font-semibold text-white">Developer API</h2>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-container to-athena-primary text-white rounded-lg font-medium shadow-lg shadow-primary-container/20 active:scale-95 transition-transform">
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/10">
        <table className="w-full text-left">
          <thead className="bg-surface-container-low border-b border-outline-variant/10">
            <tr>
              <th className="px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-widest">Label</th>
              <th className="px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-widest">Prefix</th>
              <th className="px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-widest">Created</th>
              <th className="px-6 py-4 text-xs font-mono text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {API_KEYS.map((key) => (
              <tr key={key.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-5 font-medium text-on-surface">{key.label}</td>
                <td className="px-6 py-5 font-mono text-athena-primary text-sm">{key.prefix}</td>
                <td className="px-6 py-5 text-slate-400 text-sm">{key.created}</td>
                <td className="px-6 py-5 text-right">
                  <button className="p-2 text-slate-500 hover:text-[#ffb4ab] transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ─── Page ─── */

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<UserProfile>("/api/v1/users/me");
      setProfile(data);
    } catch {
      /* Profile fetch failed — user may not be logged in */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex-1 flex bg-athena-background overflow-hidden">
      {/* Settings Sidebar — hidden on mobile, shown as top bar */}
      <aside className="hidden md:flex w-64 bg-surface-container-low flex-col p-4 space-y-2 shrink-0 overflow-y-auto">
        <div className="px-4 py-6 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full border-2 border-athena-secondary p-0.5">
              <div className="h-full w-full rounded-full bg-primary-container flex items-center justify-center">
                <KeyRound className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 leading-none">System Settings</h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                v2.4.0-stable
              </p>
            </div>
          </div>
        </div>

        <SettingsNav active={activeSection} onSelect={setActiveSection} />

        <div className="pt-4 border-t border-outline-variant/10 mt-auto space-y-1">
          <button className="w-full bg-gradient-to-r from-primary-container to-athena-primary text-white py-3 rounded-xl font-medium mb-4 shadow-lg shadow-primary-container/20 active:scale-95 transition-transform">
            Upgrade Plan
          </button>
          <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-200 transition-all w-full">
            <HelpCircle className="h-5 w-5" />
            <span>Help</span>
          </button>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            data-testid="sign-out"
            className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-all w-full disabled:opacity-50"
          >
            {isSigningOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile section tabs */}
      <div className="flex overflow-x-auto gap-2 p-4 md:hidden scrollbar-hide border-b border-white/5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === item.id
                ? "bg-primary-container text-white"
                : "bg-surface-container text-slate-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <header>
            <h1 className="text-4xl font-headline font-light text-on-surface tracking-tight mb-2">
              Workspace <span className="text-athena-primary font-bold">Preferences</span>
            </h1>
            <p className="text-slate-400">
              Configure your Athena AI environment and security parameters.
            </p>
          </header>

          <ProfileSection profile={profile} isLoading={isLoading} />
          <PreferencesSection />
          <IntegrationsSection />
          <ApiKeysSection />

          {/* Mobile sign-out */}
          <div className="md:hidden pb-8">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              data-testid="mobile-sign-out"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 font-medium transition-all disabled:opacity-50"
            >
              {isSigningOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
