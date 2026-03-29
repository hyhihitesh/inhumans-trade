import { ShieldAlert } from "lucide-react";
import { actionModerationReportAction } from "@/app/app/admin/moderation/actions";
import { SupabaseModerationRepository } from "@/domain/datasources/supabase-moderation";
import { requireAdminUser } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminModerationPage() {
  await requireAdminUser("/app/admin/moderation");
  const repo = new SupabaseModerationRepository(await createClient());
  const queue = await repo.listAdminModerationQueue();

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ShieldAlert size={22} />
          Moderation queue
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          This internal queue lets the platform review reports across community, live, and course discussion surfaces without exposing admin tools in user-facing navigation.
        </p>
      </header>

      {queue.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
          No open moderation patterns are waiting in the queue right now.
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{item.subjectType}</p>
                  <h2 className="mt-1 text-lg font-semibold">Subject {item.subjectId}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.reporterCount} reports · latest reason {item.latestReason ?? "n/a"} · status {item.status}
                  </p>
                </div>
                <form action={actionModerationReportAction} className="grid gap-2 sm:grid-cols-[160px_1fr_auto]">
                  <input type="hidden" name="reportId" value={item.id} />
                  <select name="nextStatus" defaultValue="reviewing" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="reviewing">Reviewing</option>
                    <option value="actioned">Actioned</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                  <input name="reason" placeholder="Internal note" className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Update</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
