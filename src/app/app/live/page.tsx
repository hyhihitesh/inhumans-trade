import { Radio, ShieldCheck, TimerReset, Video } from "lucide-react";
import { createLiveRoomAction, joinLiveSessionAction, scheduleLiveSessionAction } from "@/app/(protected)/app/live/actions";
import { SupabaseLiveRepository } from "@/domain/datasources/supabase-live";
import { requireUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export default async function LivePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireUserProfile("/app/live");
  const repo = new SupabaseLiveRepository(await createClient());
  const [rooms, sessions] = await Promise.all([
    repo.listLiveRooms(),
    repo.listLiveSessions(profile.id, { creatorId: profile.role === "creator" ? profile.id : undefined }),
  ]);
  const creatorRooms = rooms.filter((room) => room.creatorId === profile.id);

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Live Rooms</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Scheduled conviction, not noisy livestream chaos</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Creators can run YouTube-backed live sessions now with tier-aware access. Followers see upcoming rooms, live state, and upgrade paths without leaving the trust layer.
        </p>
      </header>

      {params.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      {profile.role === "creator" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <form action={createLiveRoomAction} className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Create live room</h2>
            <input name="title" placeholder="Morning open room" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <textarea
              name="description"
              rows={4}
              placeholder="What traders should expect from this room."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <select name="accessMode" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="free">Free</option>
                <option value="free_preview">Free preview</option>
                <option value="tier_gated">Tier gated</option>
              </select>
              <select name="visibilityTier" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">No tier</option>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="premium">Premium</option>
              </select>
              <input
                name="freePreviewMinutes"
                type="number"
                min={1}
                max={120}
                placeholder="Preview mins"
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Create room</button>
          </form>

          <form action={scheduleLiveSessionAction} className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Schedule session</h2>
            <select name="roomId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Choose a live room</option>
              {creatorRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.title}
                </option>
              ))}
            </select>
            <input name="title" placeholder="Live title" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input name="startsAt" type="datetime-local" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input name="liveUrl" placeholder="YouTube live URL" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input name="embedUrl" placeholder="YouTube embed URL" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <textarea
              name="description"
              rows={3}
              placeholder="Session thesis, agenda, or prep notes."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Publish session</button>
          </form>
        </div>
      ) : null}

      <div className="grid gap-4">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
            No live sessions are scheduled yet. Once creators start scheduling rooms, they will appear here with access state and replay availability.
          </div>
        ) : (
          sessions.map((session) => (
            <article key={session.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                    <Radio size={14} />
                    {session.status}
                  </div>
                  <h2 className="text-lg font-semibold">{session.title}</h2>
                  <p className="text-sm text-muted-foreground">{session.description || "No session notes yet."}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-1">Starts {formatDateTime(session.startsAt)}</span>
                    <span className="rounded-full border border-border px-2 py-1">Access {session.accessMode}</span>
                    {session.visibilityTier ? (
                      <span className="rounded-full border border-border px-2 py-1">Tier {session.visibilityTier}</span>
                    ) : null}
                    {session.freePreviewMinutes ? (
                      <span className="rounded-full border border-border px-2 py-1">{session.freePreviewMinutes} min preview</span>
                    ) : null}
                  </div>
                </div>

                <div className="w-full max-w-sm rounded-xl border border-border bg-background p-4">
                  {session.canView ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        Access available
                      </div>
                      {session.embedUrl ? (
                        <a
                          href={session.embedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        >
                          <Video size={16} />
                          Open embed
                        </a>
                      ) : session.replayEmbedUrl ? (
                        <a
                          href={session.replayEmbedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                        >
                          <Video size={16} />
                          Watch replay
                        </a>
                      ) : (
                        <form action={joinLiveSessionAction}>
                          <input type="hidden" name="sessionId" value={session.id} />
                          <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                            Register attendance
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                        <TimerReset size={16} />
                        Upgrade required
                      </div>
                      <p className="text-sm text-muted-foreground">
                        This session is visible in the schedule, but full viewing is reserved for {session.visibilityTier || "creator"} members.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
