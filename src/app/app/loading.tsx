import { ShieldCheck } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="relative mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-inhumans-lg border border-teal-primary/20 bg-teal-primary/5">
          <ShieldCheck className="text-teal-primary animate-pulse" size={40} />
        </div>
        <div className="absolute -inset-2 rounded-inhumans-xl border border-teal-primary/10 animate-[ping_3s_linear_infinite]" />
      </div>
      
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-teal-primary animate-pulse">Syncing Environment</p>
      <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Loading Dashboard</h2>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-muted">
        Ensuring your secure connection to broker-verified data streams. This will only take a moment.
      </p>

      <div className="mt-12 w-full max-w-[240px] overflow-hidden rounded-full bg-surface-2 h-1.5 border border-inhumans-divider">
        <div className="h-full bg-teal-primary w-1/3 rounded-full animate-[loading-progress_2s_ease-in-out_infinite]" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-progress {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 60%; }
          100% { transform: translateX(400%); width: 30%; }
        }
      `}} />
    </div>
  );
}
