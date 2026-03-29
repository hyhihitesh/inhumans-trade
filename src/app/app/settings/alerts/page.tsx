import { SupabaseCopyTradeRepository } from "@/domain/datasources/supabase-copy-trade";
import { createClient } from "@/lib/supabase/server";
import { requireUserProfile } from "@/lib/auth/session";
import { updateAlertPreferencesAction } from "@/app/(protected)/app/settings/alerts/actions";
import { WebPushSettingsCard } from "@/components/push/WebPushSettingsCard";
import { getWebPushPublicKey } from "@/lib/push/web-push";

export default async function AlertsSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { profile } = await requireUserProfile("/app/settings/alerts");
  const repo = new SupabaseCopyTradeRepository(await createClient());
  const prefs = await repo.getAlertPreferences(profile.id);
  const params = await searchParams;

  return (
    <section className="space-y-5">
      <header className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Settings</p>
        <h1 className="mt-1 text-xl font-semibold">Alerts Preferences</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Control which notifications are delivered into your app experience.
        </p>
      </header>

      {params.success ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
          {decodeURIComponent(params.success)}
        </p>
      ) : null}

      <form action={updateAlertPreferencesAction} className="space-y-4 rounded-xl border border-border bg-card p-5">
        <Toggle
          name="tradeAlertsEnabled"
          label="Trade alerts"
          description="Notify when followed creators publish verified trades."
          defaultChecked={prefs.tradeAlertsEnabled}
        />
        <Toggle
          name="subscriptionAlertsEnabled"
          label="Subscription alerts"
          description="Notify for subscription lifecycle and billing events."
          defaultChecked={prefs.subscriptionAlertsEnabled}
        />
        <Toggle
          name="marketingAlertsEnabled"
          label="Product updates"
          description="Receive feature announcements and product updates."
          defaultChecked={prefs.marketingAlertsEnabled}
        />

        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          Save preferences
        </button>
      </form>

      <WebPushSettingsCard publicKey={getWebPushPublicKey()} />
    </section>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="mt-1 h-4 w-4" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </span>
    </label>
  );
}
