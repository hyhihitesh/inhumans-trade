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
    <div className="flex flex-col gap-5 pb-20">
      <FeedRealtimeBridge />
      
      <header className="px-1 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint">Verified Stream</p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">Market Pulse</h1>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-profit/10 border border-profit/20">
            <div className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
            <span className="text-[9px] font-bold text-profit uppercase tracking-tighter">Live</span>
          </div>
        </div>
      </header>

      {errorMessage ? (
        <section className="rounded-inhumans-lg border border-loss/20 bg-loss/5 p-6 text-center">
          <p className="text-sm font-medium text-loss">Failed to load pulse. {errorMessage}</p>
          <button className="mt-4 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-foreground underline underline-offset-4">
            Try Again
          </button>
        </section>
      ) : (
        <div className="space-y-4">
          <FeedList items={items} roleLabel="Follower" />
        </div>
      )}
    </div>
  );
}
