import { createClient } from "@/lib/supabase/server";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";
import { requireUserProfile } from "@/lib/auth/session";
import { markNotificationReadAction } from "@/app/(protected)/app/notifications/actions";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.floor(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function NotificationsPage() {
  const { profile } = await requireUserProfile("/app/notifications");
  const repo = new SupabaseCreatorPlatformRepository(await createClient());
  const notifications = await repo.listNotifications(profile.id);

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Inbox</p>
        <h1 className="mt-1 text-xl font-semibold">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Trade alerts, subscription events, and system updates.
        </p>
      </header>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <article key={notification.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {notification.type.replaceAll("_", " ")} • {timeAgo(notification.createdAt)}
                  </p>
                  <h2 className="mt-1 text-base font-semibold">{notification.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                </div>
                {notification.readAt ? (
                  <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                    Read
                  </span>
                ) : (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="notificationId" value={notification.id} />
                    <button className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted">
                      Mark read
                    </button>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

