import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";
import { requireUserProfile } from "@/lib/auth/session";
import { cancelSubscriptionAction } from "@/app/(protected)/app/subscriptions/actions";
import { RazorpaySubscribeButton } from "@/components/subscriptions/RazorpaySubscribeButton";

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ creator?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireUserProfile("/app/subscriptions");
  const repo = new SupabaseCreatorPlatformRepository(await createClient());

  const creators = await repo.listExploreCreators(params.creator);
  const selectedCreator = params.creator
    ? creators.find((c) => c.handle === params.creator)
    : creators[0];

  const tiers = selectedCreator ? await repo.listCreatorTiers(selectedCreator.creatorId) : [];
  const activeSub = selectedCreator
    ? await repo.getActiveSubscription(selectedCreator.creatorId, profile.id)
    : null;

  return (
    <section className="space-y-5">
      <header className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Billing</p>
        <h1 className="mt-1 text-xl font-semibold">Subscriptions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Checkout is wired with Razorpay contract and subscription lifecycle callbacks.
        </p>
      </header>

      {params.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}
      {params.success ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
          {decodeURIComponent(params.success)}
        </p>
      ) : null}

      {!selectedCreator ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
          No creators available yet. Explore creators first.
          <Link href="/explore" className="ml-2 text-primary">
            Go to explore
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <article className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">{selectedCreator.displayName}</h2>
            <p className="text-sm text-muted-foreground">@{selectedCreator.handle}</p>
            {activeSub ? (
              <p className="mt-2 text-sm text-emerald-600">Active subscription is enabled.</p>
            ) : (
              <p className="mt-2 text-sm text-amber-600">No active subscription yet.</p>
            )}
          </article>

          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((tier) => (
              <article key={tier.id} className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold">{tier.label}</h3>
                <p className="text-sm text-muted-foreground">{tier.tierName}</p>
                <p className="mt-2 text-2xl font-bold">INR {tier.monthlyPriceInr}</p>
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {tier.features.slice(0, 5).map((feature) => (
                    <li key={feature}>- {feature}</li>
                  ))}
                </ul>
                <div className="mt-4">
                  <RazorpaySubscribeButton creatorId={selectedCreator.creatorId} tierId={tier.id} />
                </div>
              </article>
            ))}
          </div>

          {activeSub ? (
            <div className="flex gap-2">
              <form action={cancelSubscriptionAction}>
                <input type="hidden" name="subscriptionId" value={activeSub.id} />
                <button className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
                  Cancel subscription
                </button>
              </form>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

