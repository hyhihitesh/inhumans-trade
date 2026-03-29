import Link from "next/link";
import { MessageSquare, ShieldAlert, Sparkles } from "lucide-react";
import {
  addCommunityCommentAction,
  hideCommunityPostAction,
  lockCommunityRepliesAction,
  reportCommunityPostAction,
  toggleCommunityReactionAction,
  unhideCommunityPostAction,
  unlockCommunityRepliesAction,
} from "@/app/(protected)/app/community/actions";
import { CreatorPostComposer } from "@/components/feed/CreatorPostComposer";
import { SupabaseModerationRepository } from "@/domain/datasources/supabase-moderation";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";
import { requireUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireUserProfile("/app/community");
  const client = await createClient();
  const repo = new SupabaseCreatorPlatformRepository(client);
  const moderationRepo = new SupabaseModerationRepository(client);
  const posts = await repo.listCommunityPosts(profile.id, { limit: 30 });
  const unlockedPosts = posts.filter((post) => !post.isLocked);
  const moderationQueue = profile.role === "creator" ? await moderationRepo.listOwnerModerationQueue(profile.id) : [];
  const commentEntries = await Promise.all(
    unlockedPosts.map(async (post) => [post.id, await repo.listCommunityComments(post.id)] as const)
  );
  const commentsByPost = new Map(commentEntries);

  return (
    <section className="space-y-5">
      <header className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Community</p>
        <h1 className="mt-1 text-xl font-semibold">Calm market conversation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Creator commentary, conviction signals, and discussion threads now live in one dedicated space.
        </p>
      </header>

      {params.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      {profile.role === "creator" ? <CreatorPostComposer /> : null}

      {profile.role === "creator" && moderationQueue.length > 0 ? (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Moderation</p>
              <h2 className="mt-1 text-lg font-semibold">Creator review queue</h2>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {moderationQueue.length} items
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {moderationQueue.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-background p-3">
                <p className="text-sm font-semibold">{item.subjectType}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.reporterCount} reports · latest reason {item.latestReason ?? "n/a"} · status {item.status}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          No community posts yet. Once creators publish commentary, this space becomes the discussion layer around the verified trade feed.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const comments = commentsByPost.get(post.id) ?? [];
            const hasConvictionReaction = post.viewerReaction === "conviction";
            const hasInsightfulReaction = post.viewerReaction === "insightful";

            return (
              <article key={post.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      @{post.creatorHandle} &middot; {timeAgo(post.createdAt)}
                    </p>
                    <h2 className="mt-1 text-base font-semibold">{post.creatorName}</h2>
                  </div>
                  <span className="rounded-full border border-border px-2 py-1 text-xs">{post.visibilityTier}</span>
                </div>

                {profile.id === post.creatorId ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={post.commentsLocked ? unlockCommunityRepliesAction : lockCommunityRepliesAction}>
                      <input type="hidden" name="postId" value={post.id} />
                      <button className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">
                        {post.commentsLocked ? "Unlock replies" : "Lock replies"}
                      </button>
                    </form>
                    <form action={post.status === "hidden" ? unhideCommunityPostAction : hideCommunityPostAction}>
                      <input type="hidden" name="postId" value={post.id} />
                      <button className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">
                        {post.status === "hidden" ? "Unhide post" : "Hide post"}
                      </button>
                    </form>
                  </div>
                ) : null}

                {post.isLocked ? (
                  <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
                    <div className="flex items-start gap-2">
                      <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                      <div className="space-y-2">
                        <p>This commentary exists in the community stream, but the content is locked for {post.visibilityTier} access.</p>
                        <Link
                          href={`/profile/${post.creatorHandle}`}
                          className="inline-block rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                        >
                          View creator tiers
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{post.content}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <form action={toggleCommunityReactionAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="hidden" name="reactionType" value="conviction" />
                        <button className="rounded-full border border-border px-3 py-1 hover:bg-muted">
                          Conviction {hasConvictionReaction ? "· Yours" : ""} · {post.reactionCount}
                        </button>
                      </form>
                      <form action={toggleCommunityReactionAction}>
                        <input type="hidden" name="postId" value={post.id} />
                        <input type="hidden" name="reactionType" value="insightful" />
                        <button className="rounded-full border border-border px-3 py-1 hover:bg-muted">
                          Insightful {hasInsightfulReaction ? "· Yours" : ""}
                        </button>
                      </form>
                      <span className="rounded-full border border-border px-3 py-1">
                        <MessageSquare size={12} className="mr-1 inline" />
                        {post.commentCount} comments
                      </span>
                    </div>

                    <div className="mt-4 space-y-3 rounded-lg bg-background p-4">
                      <h3 className="text-sm font-semibold">Thread</h3>
                      {comments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No replies yet. Start the thread.</p>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="rounded-md border border-border bg-card p-3">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground">
                              @{comment.authorHandle} &middot; {timeAgo(comment.createdAt)}
                            </p>
                            <p className="mt-2 text-sm text-foreground">{comment.content}</p>
                          </div>
                        ))
                      )}

                      {post.commentsLocked ? (
                        <p className="text-sm text-muted-foreground">Replies are locked by the creator for this thread.</p>
                      ) : (
                        <form action={addCommunityCommentAction} className="space-y-2">
                          <input type="hidden" name="postId" value={post.id} />
                          <textarea
                            name="content"
                            minLength={2}
                            maxLength={1000}
                            rows={3}
                            placeholder="Add a grounded, useful reply."
                            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
                          />
                          <button className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                            Add comment
                          </button>
                        </form>
                      )}
                    </div>
                  </>
                )}

                <form action={reportCommunityPostAction} className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border p-3">
                  <input type="hidden" name="postId" value={post.id} />
                  <select name="reason" defaultValue="misleading" className="rounded-md border border-input bg-card px-3 py-2 text-sm">
                    <option value="misleading">Misleading</option>
                    <option value="spam">Spam</option>
                    <option value="abuse">Abuse</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    name="details"
                    placeholder="Optional moderation note"
                    className="min-w-[220px] flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm"
                  />
                  <button className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
                    <Sparkles size={14} />
                    Report
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
