"use client";

import { ShieldCheck, TrendingUp, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatorPerformanceTier } from "@/domain/types";

interface Props {
  tier: CreatorPerformanceTier;
  className?: string;
  showLabel?: boolean;
}

const TIER_CONFIG = {
  starter: {
    label: "Starter",
    icon: Zap,
    color: "text-text-muted",
    bg: "bg-surface-2",
    border: "border-inhumans-divider",
    description: "New creator building a verified track record."
  },
  rising: {
    label: "Rising",
    icon: TrendingUp,
    color: "text-teal-primary",
    bg: "bg-teal-primary/5",
    border: "border-teal-primary/20",
    description: "Proven consistency with 30+ days of verified trades."
  },
  pro: {
    label: "Pro",
    icon: ShieldCheck,
    color: "text-profit",
    bg: "bg-profit/5",
    border: "border-profit/20",
    description: "High-performance trader with institutional-grade risk management."
  },
  elite: {
    label: "Elite",
    icon: Award,
    color: "text-warning",
    bg: "bg-warning/5",
    border: "border-warning/20",
    description: "Top 5% performer with exceptional ROI and follower trust."
  }
};

export function CreatorTierBadge({ tier, className, showLabel = true }: Props) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.starter;
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-all cursor-help group relative",
        config.bg,
        config.color,
        config.border,
        className
      )}
    >
      <Icon size={10} className="shrink-0" />
      {showLabel && <span>{config.label}</span>}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-inhumans-md bg-foreground text-background text-[10px] font-medium normal-case tracking-normal opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
        <p className="font-bold mb-1 uppercase tracking-widest text-[8px] opacity-70">{config.label} Tier</p>
        {config.description}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-foreground" />
      </div>
    </div>
  );
}
