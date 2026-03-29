"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, LogOut } from "lucide-react";
import Link from "next/link";
import { signOutAction } from "@/app/auth/actions";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Route segment error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-loss/10 text-loss shadow-sm">
        <AlertTriangle size={40} />
      </div>
      
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-loss">System Failure</p>
      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">A critical error occurred</h2>
      <p className="mt-4 max-w-lg text-base leading-relaxed text-text-muted">
        The application encountered an unexpected issue while loading your dashboard. This might be due to a temporary network problem or a configuration error.
      </p>

      {error.digest && (
        <div className="mt-6 rounded-full border border-inhumans-border bg-surface-2 px-4 py-1.5 font-mono text-[10px] text-text-faint">
          Error ID: {error.digest}
        </div>
      )}

      <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
        <button
          onClick={() => reset()}
          className="flex h-12 items-center gap-3 rounded-inhumans-md bg-foreground px-8 text-xs font-bold uppercase tracking-widest text-background transition-all hover:bg-foreground/90 hover:shadow-lg active:scale-95"
        >
          <RefreshCcw size={16} />
          Restart Interface
        </button>
        
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex h-12 items-center gap-3 rounded-inhumans-md border border-inhumans-border bg-white px-8 text-xs font-bold uppercase tracking-widest text-text-muted transition-all hover:bg-surface-2 hover:text-foreground active:scale-95"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </form>
      </div>

      <div className="mt-16 pt-8 border-t border-inhumans-divider w-full max-w-xs text-center">
        <p className="text-[11px] font-medium text-text-faint">
          Need support? Contact our reliability team at <br />
          <span className="font-bold text-teal-primary hover:underline cursor-pointer">reliability@inhumans.io</span>
        </p>
      </div>
    </div>
  );
}
