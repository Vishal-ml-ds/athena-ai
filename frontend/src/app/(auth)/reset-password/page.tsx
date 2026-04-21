"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setStatus("loading");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMessage(error.message);
        setStatus("error");
        return;
      }
      setStatus("done");
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
              Choose a new password
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Minimum 8 characters.
            </p>
          </div>

          {status === "done" ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <CheckCircle className="mx-auto mb-2 h-6 w-6 text-emerald-400" />
              <p className="text-sm text-emerald-300 mb-3">
                Password updated. You&apos;re signed in.
              </p>
              <Link
                href="/chat"
                className="inline-block text-sm text-athena-primary font-semibold hover:underline"
              >
                Go to ATHENA →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-outline mb-2 ml-1">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-12 bg-surface-container-lowest border-none rounded-lg px-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
                  data-testid="reset-password"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-outline mb-2 ml-1">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="w-full h-12 bg-surface-container-lowest border-none rounded-lg px-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
                  data-testid="reset-confirm"
                />
              </div>

              {errorMessage && (
                <p className="text-sm text-red-400" data-testid="reset-error">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full h-12 mt-4 bg-gradient-to-br from-primary-container to-athena-primary text-white font-medium rounded-lg shadow-lg shadow-primary-container/20 hover:shadow-primary-container/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="reset-submit"
              >
                {status === "loading" ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Update password"
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
