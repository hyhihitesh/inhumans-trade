import Link from "next/link";
import { Lock } from "lucide-react";
import { notFound } from "next/navigation";
import { VerifiedTradeCard } from "@/components/ui/VerifiedTradeCard";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";
import { ProfileTradeRow } from "@/domain/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function formatTradeTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function LockedTradeRow({
  trade,
  handle,
  isSignedIn,
}: {
  trade: ProfileTradeRow;
  handle: string;
  isSignedIn: boolean;
}) {
  return (
    <article className="space-y-3 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Verified trade row</p>
          <h3 className="mt-1 text-lg font-semibold">{trade.instrument}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {trade.side} {trade.symbol} via {trade.brokerName}
          </p>
        </div>
        <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
          {trade.visibilityTier} locked
        </span>
      </div>

      <div className="grid gap-3 rounded-lg border border-dashed border-border bg-background p-4 text-sm md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Status</p>
          <p className="mt-1 font-semibold capitalize">{trade.status}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Executed</p>
          <p className="mt-1 font-semibold">{formatTradeTime(trade.executedAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Pricing</p>
          <p className="mt-1 font-semibold text-muted-foreground">Hidden until unlocked</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Live PnL</p>
          <p className="mt-1 font-semibold text-muted-foreground">Hidden until unlocked</p>
        </div>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="flex items-start gap-2">
          <Lock size={16} className="mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p>
              This trade row remains visible for trust, but order ID, pricing, quantity, and live PnL are locked for{" "}
              <strong>{trade.visibilityTier}</strong> access.
            </p>
            <Link
              href={isSignedIn ? `/app/subscriptions?creator=${handle}` : `/auth/sign-in?next=/profile/${handle}`}
              className="inline-block rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              {isSignedIn ? `Unlock ${trade.unlockTier ?? trade.visibilityTier}` : "Sign in to unlock"}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function PublicCreatorProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const repo = new SupabaseCreatorPlatformRepository(user ? supabase : createAdminClient());
  const profile = await repo.getCreatorPublicProfile(handle, user?.id);
  if (!profile) notFound();

  const activeTier = profile.activeSubscriptionTier;

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">@{profile.handle}</p>
            <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{profile.bio ?? "No bio yet."}</p>
          </div>
          <div className="space-y-2 text-right">
            <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs">
              {profile.verificationStatus}
            </span>
            <p className="text-xs text-muted-foreground">
              {activeTier ? `Your access: ${activeTier}` : "Viewing as public/free"}
            </p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <div className="rounded-md bg-background p-2">
            <dt className="text-muted-foreground">Subscribers</dt>
            <dd className="font-semibold">{profile.subscribers}</dd>
          </div>
          <div className="rounded-md bg-background p-2">
            <dt className="text-muted-foreground">Win rate</dt>
            <dd className="font-semibold">{profile.winRate}%</dd>
          </div>
          <div className="rounded-md bg-background p-2">
            <dt className="text-muted-foreground">Trades</dt>
            <dd className="font-semibold">{profile.totalTrades}</dd>
          </div>
          <div className="rounded-md bg-background p-2">
            <dt className="text-muted-foreground">30d PnL</dt>
            <dd className="font-semibold">INR {Math.round(profile.monthlyPnl)}</dd>
          </div>
        </dl>
      </header>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Subscription tiers</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {profile.tiers.map((tier) => (
            <article key={tier.id} className="rounded-lg border border-border bg-background p-4">
              <h3 className="text-base font-semibold">{tier.label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.tierName}</p>
              <p className="mt-3 text-xl font-bold">INR {tier.monthlyPriceInr}/mo</p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {tier.features.slice(0, 4).map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
              <Link
                href={user ? `/app/subscriptions?creator=${profile.handle}&tier=${tier.id}` : `/auth/sign-in?next=/profile/${profile.handle}`}
                className="mt-4 inline-block rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
              >
                {user ? "Choose tier" : "Sign in to subscribe"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Recent verified trades</h2>
          <span className="text-xs text-muted-foreground">
            Rows stay visible. Sensitive trade details unlock by tier.
          </span>
        </div>

        <div className="space-y-4">
          {profile.recentTrades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trades published yet.</p>
          ) : (
            profile.recentTrades.map((trade) =>
              trade.isLocked ? (
                <LockedTradeRow key={trade.id} trade={trade} handle={profile.handle} isSignedIn={Boolean(user)} />
              ) : (
                <VerifiedTradeCard
                  key={trade.id}
                  orderId={trade.brokerOrderId ?? undefined}
                  instrument={trade.instrument}
                  side={trade.side}
                  entryPrice={trade.entryPrice ?? 0}
                  quantity={trade.quantity ?? 0}
                  currentPnL={trade.currentPnl ?? 0}
                  brokerName={trade.brokerName}
                  freshness="warm"
                  lastUpdate={formatTradeTime(trade.updatedAt ?? trade.executedAt)}
                  status={trade.status}
                  variant="compact"
                />
              )
            )
          )}
        </div>
      </section>
    </main>
  );
}
