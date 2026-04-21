"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Loader2, Lock, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        window.location.href = "/chat";
      }
    } catch {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-mesh font-body text-on-surface min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-[420px] relative">
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-athena-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Login Card */}
        <div className="glass-panel rounded-xl p-8 shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)] relative z-10 border border-outline-variant/15">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-headline text-2xl font-bold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Sign in to your ATHENA account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-outline mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-12 bg-surface-container-lowest border-none rounded-lg px-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
                  data-testid="login-email"
                />
                <div className="absolute inset-0 rounded-lg pointer-events-none border border-outline-variant/10 group-hover:border-outline-variant/30 transition-colors" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="font-mono text-[10px] uppercase tracking-widest text-outline">
                  Password
                </label>
                <a
                  href="#"
                  className="font-mono text-[10px] uppercase tracking-widest text-athena-primary hover:text-athena-primary/80 transition-colors"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={8}
                  className="w-full h-12 bg-surface-container-lowest border-none rounded-lg px-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
                  data-testid="login-password"
                />
                <div className="absolute inset-0 rounded-lg pointer-events-none border border-outline-variant/10 group-hover:border-outline-variant/30 transition-colors" />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400" data-testid="login-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-4 bg-gradient-to-br from-primary-container to-athena-primary text-white font-medium rounded-lg shadow-lg shadow-primary-container/20 hover:shadow-primary-container/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-submit"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              Don&apos;t have an account?
              <Link
                href="/signup"
                className="text-athena-primary font-semibold hover:underline decoration-athena-primary/30 underline-offset-4 ml-1"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase tracking-tighter">
              End-to-End Encrypted
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-mono text-[10px] uppercase tracking-tighter">
              SOC2 Compliant
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
