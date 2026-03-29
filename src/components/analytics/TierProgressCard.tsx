"use client";

import { ChevronRight, Info, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatorAnalyticsSummary, CreatorPerformanceTier } from "@/domain/types";

interface Props {
  analytics: CreatorAnalyticsSummary;
}

const TIER_LABELS: Record<CreatorPerformanceTier, string> = {
  starter: "Starter",
  rising: "Rising",
  pro: "Pro",
  elite: "Elite"
};

export function TierProgressCard({ analytics }: Props) {
  const currentTier = analytics.currentTier || "starter";
  const progress = analytics.nextTierProgress;

  return (
    <div className="rounded-inhumans-lg border border-inhumans-border bg-white p-6 shadow-inhumans">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint">Pricing Power</p>
          <h3 className="font-display text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Tier: {TIER_LABELS[currentTier]}
            <div className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
          </h3>
        </div>
        <div className="h-10 w-10 rounded-full bg-surface-2 flex items-center justify-center text-text-muted">
          <TrendingUp size={20} />
        </div>
      </div>

      {progress ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-muted">
            <span>Progress to {TIER_LABELS[progress.nextTierId]}</span>
            <span>{progress.percentComplete}%</span>
          </div>
          
          <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden border border-inhumans-divider">
            <div 
              className="h-full bg-teal-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>

          <ul className="space-y-2 pt-2">
            {progress.remainingRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] font-medium text-text-muted">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-inhumans-divider" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="rounded-inhumans-md bg-warning/5 border border-warning/10 p-4">
          <div className="flex items-center gap-2 text-warning mb-1">
            <AlertCircle size={14} />
            <p className="text-[11px] font-bold uppercase tracking-tight">Maximum Tier Reached</p>
          </div>
          <p className="text-[11px] leading-relaxed text-text-muted">
            You are currently in the Elite tier. Maintain your 20% ROI and 65% win rate to keep your premium pricing power.
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-inhumans-divider flex items-center justify-between">
        <p className="text-[10px] font-medium text-text-faint flex items-center gap-1">
          <Info size={12} /> Data updates every 24h
        </p>
        <button className="text-[10px] font-bold uppercase tracking-widest text-teal-primary hover:underline flex items-center gap-1">
          View Thresholds <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
