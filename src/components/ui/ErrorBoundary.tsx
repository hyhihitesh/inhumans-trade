"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-inhumans-lg border border-loss/10 bg-loss/5 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-loss/10 text-loss">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">Something went wrong</h2>
          <p className="mt-2 max-w-md text-sm text-text-muted">
            An unexpected error occurred while rendering this section. Our team has been notified.
          </p>
          
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 max-w-full overflow-auto rounded-inhumans-md bg-white/50 p-4 text-left font-mono text-[10px] text-loss">
              {this.state.error?.message}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 rounded-inhumans-md bg-foreground px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-background transition-all hover:bg-foreground/90"
            >
              <RefreshCcw size={14} />
              Try Again
            </button>
            <Link
              href="/app"
              className="flex items-center gap-2 rounded-inhumans-md border border-inhumans-border bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-text-muted transition-all hover:bg-surface-2 hover:text-foreground"
            >
              <Home size={14} />
              Back to Hub
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
