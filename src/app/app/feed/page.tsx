import { FeedList } from "@/components/feed/FeedList";
import { FeedRealtimeBridge } from "@/components/feed/FeedRealtimeBridge";
import { createSupabaseFeedRepository } from "@/domain/datasources/supabase-feed";
import { FeedItem } from "@/domain/types";
import { requireAuthenticatedSession, requireUserProfile } from "@/lib/auth/session";
import { CreatorPostComposer } from "@/components/feed/CreatorPostComposer";

export default async function CreatorFeedPage() {
  await requireUserProfile("/app/feed");
  const { user, supabase } = await requireAuthenticatedSession("/app/feed");

  const repo = createSupabaseFeedRepository(supabase);
  let items: FeedItem[] = [];
  let errorMessage: string | null = null;

  try {
    items = await repo.listFeedItems(30, user.id);
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Creator Dashboard</p>
        <h2 className="mt-1 text-xl font-semibold">Verified Feed</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Auto-posted broker-verified trades appear here with realtime updates.
        </p>
      </header>

      <CreatorPostComposer />

      {errorMessage ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          Failed to load creator feed. {errorMessage}
        </section>
      ) : (
        <>
          <FeedRealtimeBridge />
          <FeedList items={items} roleLabel="Creator" />
        </>
      )}
    </section>
  );
}
