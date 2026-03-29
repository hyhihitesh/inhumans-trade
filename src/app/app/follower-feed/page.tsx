import { FeedList } from "@/components/feed/FeedList";
import { FeedRealtimeBridge } from "@/components/feed/FeedRealtimeBridge";
import { createSupabaseFeedRepository } from "@/domain/datasources/supabase-feed";
import { FeedItem } from "@/domain/types";
import { requireAuthenticatedSession, requireUserProfile } from "@/lib/auth/session";

export default async function FollowerFeedPage() {
  await requireUserProfile("/app/follower-feed");
  const { user, supabase } = await requireAuthenticatedSession("/app/follower-feed");

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
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Follower Feed</p>
        <h2 className="mt-1 text-xl font-semibold">Trades + Commentary Stream</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Watch verified trade events and react quickly as creators publish new positions.
        </p>
      </header>

      {errorMessage ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          Failed to load follower feed. {errorMessage}
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
