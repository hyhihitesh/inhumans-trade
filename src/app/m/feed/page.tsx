import { FeedList } from "@/components/feed/FeedList";
import { FeedRealtimeBridge } from "@/components/feed/FeedRealtimeBridge";
import { createSupabaseFeedRepository } from "@/domain/datasources/supabase-feed";
import { FeedItem } from "@/domain/types";
import { requireAuthenticatedSession, requireUserProfile } from "@/lib/auth/session";

export default async function MobileFeedPage() {
  await requireUserProfile("/m/feed");
  const { user, supabase } = await requireAuthenticatedSession("/m/feed");
  const repo = createSupabaseFeedRepository(supabase);
  let items: FeedItem[] = [];
  let errorMessage: string | null = null;

  try {
    items = await repo.listFeedItems(20, user.id);
  } catch (error) {
    errorMessage = (error as Error).message;
  }

  return (
    <section className="space-y-3">
      <header className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Mobile Feed</p>
        <h1 className="mt-1 text-lg font-semibold">Realtime trade stream</h1>
      </header>

      {errorMessage ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load mobile feed. {errorMessage}
        </section>
      ) : (
        <>
          <FeedRealtimeBridge />
          <FeedList items={items} roleLabel="Follower" />
        </>
      )}
    </section>
  );
}
