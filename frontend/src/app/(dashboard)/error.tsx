"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center bg-athena-background min-h-screen">
      <div className="max-w-md text-center px-8">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-headline font-bold text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-slate-400 leading-relaxed mb-8">
          An unexpected error occurred in this module. Your data is safe — try refreshing.
        </p>
        <button
          onClick={reset}
          data-testid="error-reset"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-container to-athena-primary text-white font-medium rounded-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
