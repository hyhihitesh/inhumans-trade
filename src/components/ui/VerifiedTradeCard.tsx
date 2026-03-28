"use client";

import { ShieldCheck, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { PnLNumber } from "./PnLNumber";

export type FreshnessState = "hot" | "warm" | "cold";

interface TradeCardProps {
  instrument: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  quantity: number;
  currentPnL: number;
  brokerName: string;
  freshness: FreshnessState;
  lastUpdate: string;
  isLive?: boolean;
}

export function VerifiedTradeCard({
  instrument,
  side,
  entryPrice,
  quantity,
  currentPnL,
  brokerName,
  freshness,
  lastUpdate,
  isLive = true,
}: TradeCardProps) {
  const freshnessColors = {
    hot: "text-profit bg-profit/10 border-profit/20",
    warm: "text-warning bg-warning/10 border-warning/20",
    cold: "text-foreground/40 bg-surface-2 border-inhumans-border",
  };

  const freshnessDots = {
    hot: "bg-profit animate-pulse",
    warm: "bg-warning",
    cold: "bg-foreground/20",
  };

  return (
    <div className="w-full rounded-inhumans-lg bg-surface-1 border border-inhumans-border p-6 shadow-xl hover:border-teal-primary/30 transition-all group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center border border-inhumans-border group-hover:border-teal-primary/50 transition-colors">
            <ShieldCheck size={20} className="text-teal-primary" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight capitalize">{brokerName} Verified</p>
            <p className="text-[10px] text-foreground/40 font-mono uppercase tracking-tighter">
              Order ID: #INH-{Math.floor(Math.random() * 10000)}
            </p>
          </div>
        </div>
        
        {isLive && (
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-widest transition-colors",
            freshnessColors[freshness]
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", freshnessDots[freshness])} />
            {freshness === "hot" ? "Live" : freshness} ({lastUpdate})
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-black px-1.5 py-0.5 rounded",
            side === "BUY" ? "bg-profit/20 text-profit" : "bg-loss/20 text-loss"
          )}>
            {side}
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">
            {instrument}
          </h2>
        </div>
        <p className="text-xs font-mono text-foreground/60">
          ENTRY: {entryPrice.toFixed(2)} • QTY: {quantity}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-inhumans-md bg-surface-2/50 border border-inhumans-border">
          <p className="text-[10px] text-foreground/40 font-bold mb-1 uppercase tracking-widest">Unrealized P&L</p>
          <PnLNumber value={currentPnL} className="text-2xl" />
        </div>
        <div className="p-4 rounded-inhumans-md bg-surface-2/50 border border-inhumans-border flex flex-col justify-center">
          <p className="text-[10px] text-foreground/40 font-bold mb-1 uppercase tracking-widest">Strategy</p>
          <p className="text-xs font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
            Mean Reversion Pro
          </p>
        </div>
      </div>
    </div>
  );
}
