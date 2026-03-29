"use client";

import { ShieldCheck, MessageSquare, Copy, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PnLNumber } from "./PnLNumber";
import { TradeStatus, FreshnessState } from "@/domain/types";

interface TradeCardProps {
  orderId?: string;
  instrument: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  quantity: number;
  currentPnL: number;
  brokerName: string;
  freshness: FreshnessState;
  lastUpdate: string;
  status?: TradeStatus;
  variant?: "full" | "compact" | "copy-action";
  onCopyTrade?: () => void;
  copyCount?: number;
  commentCount?: number;
  strategy?: string;
}

export function VerifiedTradeCard({
  orderId,
  instrument,
  side,
  entryPrice,
  quantity,
  currentPnL,
  brokerName,
  freshness,
  lastUpdate,
  status = "open",
  variant = "full",
  onCopyTrade,
  copyCount = 0,
  commentCount = 0,
  strategy = "Discretionary Alpha",
}: TradeCardProps) {
  const freshnessStyles = {
    hot: "text-profit bg-profit/5 border-profit/10",
    warm: "text-warning bg-warning/5 border-warning/10",
    cold: "text-text-muted bg-surface-2 border-inhumans-border",
  };

  const statusLabel =
    status === "closed" ? "Closed" : status === "pending" ? "Pending" : "Active";

  return (
    <div
      className={cn(
        "w-full rounded-inhumans-lg bg-white border border-inhumans-border shadow-inhumans hover:shadow-inhumans-elevated transition-all duration-300 group overflow-hidden",
        variant === "compact" ? "p-5" : "p-0"
      )}
    >
      <div className="p-6 sm:p-8">
        {/* Header: Verified Signal & Freshness */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-inhumans-md bg-teal-primary/10 flex items-center justify-center border border-teal-primary/20 transition-colors">
              <ShieldCheck size={20} className="text-teal-primary" />
            </div>
            <div>
              <p className="font-bold text-xs tracking-tight text-foreground capitalize flex items-center gap-1.5">
                {brokerName} Verified
                <span className="w-1 h-1 rounded-full bg-text-faint" />
                <span className="text-[10px] font-mono text-text-faint uppercase">#{orderId?.slice(-6) ?? "0000"}</span>
              </p>
              <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mt-0.5">{strategy}</p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-wider transition-colors",
              freshnessStyles[freshness]
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full", 
              freshness === "hot" ? "bg-profit animate-pulse" : 
              freshness === "warm" ? "bg-warning" : "bg-text-faint"
            )} />
            {statusLabel} • {freshness}
          </div>
        </div>

        {/* Content: Asset & Key Details */}
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-[9px] font-black px-2 py-0.5 rounded-full border tracking-widest",
                side === "BUY" ? "bg-profit/10 text-profit border-profit/20" : "bg-loss/10 text-loss border-loss/20"
              )}
            >
              {side}
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">{instrument}</h2>
          </div>
          
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 rounded-inhumans-md bg-surface-2/50 border border-inhumans-divider">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest mb-1">Entry</span>
              <span className="text-sm font-mono font-bold text-foreground">{entryPrice.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest mb-1">Quantity</span>
              <span className="text-sm font-mono font-bold text-foreground">{quantity}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-[9px] font-bold text-text-faint uppercase tracking-widest mb-1">Last Update</span>
              <span className="text-xs font-medium text-text-muted">{lastUpdate}</span>
            </div>
          </div>
        </div>

        {/* P&L Reveal */}
        <div className="p-6 rounded-inhumans-md bg-white border border-inhumans-border shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-text-faint uppercase tracking-[0.2em] mb-2">Current Performance</p>
          <PnLNumber value={currentPnL} className="text-4xl" />
        </div>

        {/* Footer Actions & Stats */}
        <div className="mt-8 pt-6 border-t border-inhumans-divider flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors cursor-help group/stat" title="Social conviction">
              <Copy size={16} className="text-teal-primary/60 group-hover/stat:text-teal-primary" />
              <span className="text-[11px] font-bold font-mono">{copyCount}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors cursor-help group/stat" title="Discussion">
              <MessageSquare size={16} className="text-text-faint group-hover/stat:text-text-muted" />
              <span className="text-[11px] font-bold font-mono">{commentCount}</span>
            </div>
          </div>
          
          {variant === "copy-action" ? (
            <button
              type="button"
              onClick={onCopyTrade}
              className="bg-teal-primary hover:bg-teal-primary-hover text-white px-6 py-2.5 rounded-inhumans-md text-[11px] font-bold uppercase tracking-widest transition-all shadow-md shadow-teal-primary/10 flex items-center gap-2"
            >
              Mirror Signal <ArrowUpRight size={14} />
            </button>
          ) : (
            <div className="text-[10px] font-bold text-text-faint uppercase tracking-tighter flex items-center gap-1.5">
              Verified Stream <div className="w-1 h-1 rounded-full bg-profit animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
