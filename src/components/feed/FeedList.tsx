"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Lock, ShieldCheck } from "lucide-react";
import { CopyTradeSheet } from "@/components/feed/CopyTradeSheet";
import { CreatorTierBadge } from "@/components/ui/CreatorTierBadge";
import { VerifiedTradeCard } from "@/components/ui/VerifiedTradeCard";
import { FeedItem } from "@/domain/types";

function timeAgo(input: string) {
  const diff = Date.now() - new Date(input).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function FeedList({ items, roleLabel }: { items: FeedItem[]; roleLabel: "Creator" | "Follower" }) {
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const selectedTrade = selectedTradeId
    ? items.find((item) => item.trade?.id === selectedTradeId)?.trade ?? null
    : null;

  if (items.length === 0) {
    return (
      <div className="rounded-inhumans-lg border border-dashed border-inhumans-border bg-white p-12 text-center shadow-inhumans animate-in fade-in duration-700">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 shadow-inner">
          <ShieldCheck size={28} className="text-text-faint" />
        </div>
        <p className="mx-auto max-w-xs text-sm font-medium leading-relaxed text-text-muted">
          Your verified stream is currently empty. New signal events will appear here in real-time.
        </p>
        <div className="mt-8 flex justify-center">
          <Link 
            href="/explore" 
            className="inline-flex items-center gap-2 rounded-inhumans-md bg-surface-2 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:bg-inhumans-border hover:text-foreground transition-all"
          >
            Explore Creators <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {items.map((item) => (
        <article key={item.id} className="relative">
          <div className="mb-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-inhumans-border bg-surface-2 shadow-sm">
                <span className="text-[10px] font-bold text-teal-primary">{item.creator.handle[0].toUpperCase()}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted">
                    @{item.creator.handle}
                  </p>
                  <CreatorTierBadge tier={(item.creator as any).performanceTier || "starter"} />
                </div>
                <p className="text-[8px] font-bold uppercase tracking-widest text-text-faint">
                  {timeAgo(item.createdAt)}
                </p>
              </div>
            </div>
            {item.visibilityTier && item.visibilityTier !== "free" ? (
              <span className="flex items-center gap-1 rounded-full border border-teal-primary/10 bg-teal-primary/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-primary">
                <Lock size={10} /> {item.visibilityTier}
              </span>
            ) : null}
          </div>

          {item.trade ? (
            <VerifiedTradeCard
              orderId={item.trade.brokerOrderId}
              instrument={item.trade.instrument}
              side={item.trade.side}
              entryPrice={item.trade.entryPrice}
              quantity={item.trade.quantity}
              currentPnL={item.trade.currentPnl}
              brokerName={item.trade.brokerName}
              freshness={item.trade.freshness}
              lastUpdate={timeAgo(item.trade.updatedAt ?? item.trade.executedAt)}
              status={item.trade.status}
              variant={roleLabel === "Follower" ? "copy-action" : "full"}
              onCopyTrade={roleLabel === "Follower" ? () => setSelectedTradeId(item.trade?.id ?? null) : undefined}
              copyCount={item.trade.copyCount}
              commentCount={item.trade.commentCount}
              strategy={item.trade.strategy}
            />
          ) : (
            <div className="overflow-hidden rounded-inhumans-lg border border-inhumans-border bg-white shadow-inhumans">
              {item.isLocked ? (
                <div className="space-y-6 p-8 text-center sm:p-12">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-inhumans-divider bg-surface-2 shadow-sm">
                    <Lock size={24} className="text-text-muted" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-display text-lg font-bold tracking-tight text-foreground">Subscriber Access Required</h4>
                    <p className="mx-auto max-w-xs text-sm leading-relaxed text-text-muted">
                      This market commentary is exclusive to <strong>{item.visibilityTier}</strong> subscribers of @{item.creator.handle}.
                    </p>
                  </div>
                  <Link
                    href={`/profile/${item.creator.handle}`}
                    className="inline-flex items-center gap-2 rounded-inhumans-md bg-teal-primary px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-white shadow-md shadow-teal-primary/10 transition-all hover:bg-teal-primary-hover"
                  >
                    View Subscription Tiers <ArrowUpRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="p-6 sm:p-8">
                  <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-foreground sm:text-base">
                    {item.content ?? "Strategic market announcement."}
                  </p>
                  {item.ctaLabel ? (
                    <div className="mt-6 flex justify-end border-t border-inhumans-divider pt-6">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-primary hover:underline"
                      >
                        {item.ctaLabel} <ArrowUpRight size={14} />
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </article>
      ))}

      <CopyTradeSheet trade={selectedTrade} isOpen={Boolean(selectedTrade)} onClose={() => setSelectedTradeId(null)} />
    </div>
  );
}
