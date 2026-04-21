"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, display_name: name }),
      });
      const body = await res.json();

      if (!res.ok || !body.success) {
        setError(body.error?.message || "Signup failed. Please try again.");
        return;
      }

      const { access_token, refresh_token } = body.data;
      const supabase = createClient();
      await supabase.auth.setSession({ access_token, refresh_token });

      window.location.href = "/onboarding";
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-mesh font-body text-on-surface min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 py-6 bg-transparent backdrop-blur-xl shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)]">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter text-slate-100 font-headline"
        >
          ATHENA
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/#features"
            className="text-slate-400 font-headline tracking-tight hover:text-purple-300 transition-colors duration-300"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-slate-400 font-headline tracking-tight hover:text-purple-300 transition-colors duration-300"
          >
            Security
          </Link>
          <Link
            href="/#pricing"
            className="text-slate-400 font-headline tracking-tight hover:text-purple-300 transition-colors duration-300"
          >
            Enterprise
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-purple-400 font-semibold font-headline tracking-tight active:opacity-80 transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 pt-24 pb-12">
        {/* Auth Card */}
        <div className="w-full max-w-[420px] glass-panel rounded-xl p-8 border border-outline-variant/15 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)]">
              <Brain className="w-8 h-8 text-on-primary-container" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white font-headline tracking-tight mb-2">
              Create account
            </h1>
            <p className="text-sm text-on-surface-variant font-medium">
              Get started with ATHENA
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-athena-secondary">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
                data-testid="signup-name"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-athena-secondary">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
                data-testid="signup-email"
              />
            </div>

            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase tracking-widest text-athena-secondary">
                Password (min 8 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={8}
                className="w-full bg-surface-container-lowest border-none rounded-lg py-3 px-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
                data-testid="signup-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400" data-testid="signup-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-lg text-on-primary font-semibold font-headline tracking-wide glow-button mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="signup-submit"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Already have an account?
              <Link
                href="/login"
                className="text-athena-primary font-semibold hover:text-athena-primary/80 transition-colors ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-athena-background">
        <div className="w-full max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-200 font-bold font-mono text-[10px] uppercase tracking-widest">
            ATHENA AI OS
          </div>
          <div className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} ATHENA AI OS. Celestial Intelligence Systems.
          </div>
        </div>
      </footer>
    </div>
  );
}
