"use client";

import { useMemo, useState } from "react";
import { Trade } from "@/domain/types";
import { ShieldCheck, Info, ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  trade: Trade | null;
  isOpen: boolean;
  onClose: () => void;
};

type SubmitState = "idle" | "submitting" | "success" | "failed";

export function CopyTradeSheet({ trade, isOpen, onClose }: Props) {
  const [quantity, setQuantity] = useState("1");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const estimatedCapital = useMemo(() => {
    if (!trade) return 0;
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    return Math.round(qty * trade.entryPrice);
  }, [quantity, trade]);

  async function submitCopyTrade() {
    if (!trade) return;
    setState("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/copy-trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tradeId: trade.id,
          requestedQuantity: Number(quantity),
          requestedRiskPercent: 2,
          requestedCapitalInr: undefined,
          idempotencyKey: crypto.randomUUID(),
        }),
      });

      const payload = (await response.json()) as { error?: string; copyTradeId?: string; status?: string };
      if (!response.ok) throw new Error(payload.error ?? "Unable to create copy trade request.");

      setState("success");
      setMessage(
        `Mirror execution initiated successfully.`
      );
      setTimeout(() => onClose(), 2000);
    } catch (error) {
      setState("failed");
      setMessage((error as Error).message);
    }
  }

  if (!isOpen || !trade) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/10 backdrop-blur-sm p-4 sm:items-center animate-in fade-in duration-300" data-testid="copy-trade-sheet-backdrop">
      <section 
        className="w-full max-w-lg rounded-inhumans-xl bg-white border border-inhumans-border p-8 shadow-inhumans-elevated animate-in slide-in-from-bottom-4 duration-500" 
        data-testid="copy-trade-sheet"
      >
        <div className="mb-8 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-inhumans-lg bg-teal-primary/10 flex items-center justify-center border border-teal-primary/20">
              <ShieldCheck className="text-teal-primary" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-primary mb-1">Mirror Selection</p>
              <h3 className="text-xl font-bold font-display text-foreground">{trade.instrument}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-2 transition-colors text-text-faint hover:text-text-muted"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 p-5 rounded-inhumans-lg bg-surface-2/50 border border-inhumans-divider">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase text-text-faint tracking-widest">Signal Side</p>
              <p className={cn("text-sm font-bold font-mono", trade.side === "BUY" ? "text-profit" : "text-loss")}>{trade.side}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase text-text-faint tracking-widest">Entry Target</p>
              <p className="text-sm font-bold font-mono">₹{trade.entryPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-text-muted">Quantity (Lots)</span>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="w-full rounded-inhumans-md border border-inhumans-border bg-white px-4 py-3 text-sm font-bold focus:border-teal-primary/50 focus:ring-4 focus:ring-teal-primary/5 outline-none transition-all"
              />
            </label>

            <div className="p-4 rounded-inhumans-md bg-teal-primary/5 border border-teal-primary/10 flex items-center gap-3">
              <Info size={16} className="text-teal-primary" />
              <p className="text-xs font-medium text-text-muted">
                Estimated notional: <span className="font-bold text-foreground">₹{estimatedCapital.toLocaleString("en-IN")}</span>
              </p>
            </div>
          </div>

          {message ? (
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-widest text-center animate-in zoom-in-95 duration-200",
                state === "success" ? "text-profit" : "text-loss"
              )}
            >
              {message}
            </p>
          ) : (
            <p className="text-[10px] text-text-faint text-center leading-relaxed">
              This request will place a live market order via your connected broker account.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={submitCopyTrade}
            disabled={state === "submitting" || state === "success"}
            className="w-full flex items-center justify-center gap-2 rounded-inhumans-md bg-teal-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white hover:bg-teal-primary-hover transition-all shadow-md shadow-teal-primary/10 disabled:opacity-40"
          >
            {state === "submitting" ? "Initiating..." : (
              <>
                Confirm Mirror Execution <ArrowUpRight size={18} />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 text-[11px] font-bold uppercase tracking-widest text-text-faint hover:text-text-muted transition-colors"
          >
            Cancel and Review
          </button>
        </div>
      </section>
    </div>
  );
}
