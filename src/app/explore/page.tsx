import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  const repo = new SupabaseCreatorPlatformRepository(await createClient());
  const creators = await repo.listExploreCreators(query);

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header className="rounded-xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Discover</p>
        <h1 className="mt-1 text-2xl font-semibold">Explore verified creators</h1>
        <form className="mt-4 flex gap-2" action="/explore">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by handle or name"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" type="submit">
            Search
          </button>
        </form>
      </header>

      {creators.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          No creators found for this search.
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {creators.map((creator) => (
            <article key={creator.creatorId} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{creator.displayName}</h2>
                  <p className="text-sm text-muted-foreground">@{creator.handle}</p>
                </div>
                <span className="rounded-full border border-border px-2 py-1 text-xs">
                  {creator.verificationStatus}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                {creator.bio ?? "No bio added yet."}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md bg-background p-2">
                  <dt className="text-muted-foreground">Subscribers</dt>
                  <dd className="font-semibold">{creator.subscribers}</dd>
                </div>
                <div className="rounded-md bg-background p-2">
                  <dt className="text-muted-foreground">Win rate</dt>
                  <dd className="font-semibold">{creator.winRate}%</dd>
                </div>
                <div className="rounded-md bg-background p-2">
                  <dt className="text-muted-foreground">Trades</dt>
                  <dd className="font-semibold">{creator.totalTrades}</dd>
                </div>
                <div className="rounded-md bg-background p-2">
                  <dt className="text-muted-foreground">Min tier</dt>
                  <dd className="font-semibold">
                    {creator.minTierPriceInr === null ? "NA" : `INR ${creator.minTierPriceInr}`}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/profile/${creator.handle}`}
                  className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  View profile
                </Link>
                <Link
                  href={`/@${creator.handle}`}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Public URL
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

