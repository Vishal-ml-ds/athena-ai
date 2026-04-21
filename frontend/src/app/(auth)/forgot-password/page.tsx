"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="bg-mesh font-body text-on-surface min-h-screen flex items-center justify-center p-6">
      <main className="w-full max-w-[420px] relative">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-athena-secondary/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="glass-panel rounded-xl p-8 shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)] relative z-10 border border-outline-variant/15">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] mb-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-headline text-2xl font-bold text-white tracking-tight">
              Reset your password
            </h1>
            <p className="text-on-surface-variant text-sm mt-1 text-center">
              We&apos;ll email you a secure link to choose a new one.
            </p>
          </div>

          {status === "sent" ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <Mail className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
              <p className="text-sm text-emerald-300">
                If an account exists for <span className="font-semibold">{email}</span>, a reset link is on its way.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-outline mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-12 bg-surface-container-lowest border-none rounded-lg px-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
                  data-testid="forgot-email"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-400" data-testid="forgot-error">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full h-12 mt-4 bg-gradient-to-br from-primary-container to-athena-primary text-white font-medium rounded-lg shadow-lg shadow-primary-container/20 hover:shadow-primary-container/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="forgot-submit"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-on-surface-variant text-sm">
              Remembered it?
              <Link
                href="/login"
                className="text-athena-primary font-semibold hover:underline decoration-athena-primary/30 underline-offset-4 ml-1"
              >
                Back to sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
