import Link from "next/link";
import { disconnectZerodhaBrokerAction } from "@/app/app/actions";
import { SupabaseOnboardingRepository } from "@/domain/datasources/supabase-onboarding";
import { BrokerName } from "@/domain/types";
import { requireAuthenticatedSession } from "@/lib/auth/session";
import { requireZerodhaBrokerEnv } from "@/lib/supabase/env";

const brokerCatalog: Array<{
  id: BrokerName;
  title: string;
  subtitle: string;
  live: boolean;
}> = [
  { id: "zerodha", title: "Zerodha", subtitle: "Kite Connect OAuth", live: true },
  { id: "dhan", title: "Dhan", subtitle: "Planned next broker", live: false },
  { id: "angel_one", title: "Angel One", subtitle: "Planned next broker", live: false },
  { id: "fyers", title: "Fyers", subtitle: "Planned next broker", live: false },
];

function statusClass(status: string) {
  if (status === "connected") return "text-emerald-700 bg-emerald-500/10 border-emerald-500/20";
  if (status === "reconnect_required") return "text-amber-700 bg-amber-500/10 border-amber-500/20";
  return "text-muted-foreground bg-muted border-border";
}

export default async function BrokerSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const { supabase, user } = await requireAuthenticatedSession("/app/settings/broker");
  const repo = new SupabaseOnboardingRepository(supabase);
  const zerodhaConnection = await repo.getBrokerConnection(user.id, "zerodha");

  let zerodhaAvailable = true;
  try {
    requireZerodhaBrokerEnv();
  } catch {
    zerodhaAvailable = false;
  }

  return (
    <section className="space-y-5">
      <header className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Trust Infrastructure</p>
        <h2 className="mt-1 text-xl font-semibold">Broker connections</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Zerodha is the first production broker path. Other broker integrations stay hidden from live actions until they are fully wired.
        </p>
      </header>

      {params.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}
      {params.success ? (
        <p className="rounded-md border border-emerald-300 bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
          {decodeURIComponent(params.success)}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {brokerCatalog.map((broker) => {
          const connection = broker.id === "zerodha" ? zerodhaConnection : null;
          const status = connection?.status ?? "disconnected";
          const canConnect = broker.live && zerodhaAvailable;

          return (
            <article key={broker.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{broker.title}</h3>
                  <p className="text-sm text-muted-foreground">{broker.subtitle}</p>
                </div>
                <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusClass(status)}`}>
                  {broker.live ? status.replaceAll("_", " ") : "planned"}
                </span>
              </div>

              <dl className="mt-4 space-y-1 text-sm text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <dt>Account</dt>
                  <dd>{connection?.accountLabel ?? (broker.live ? "Not connected" : "Not available yet")}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Broker user</dt>
                  <dd>{connection?.brokerUserId ?? "Unavailable"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Last sync</dt>
                  <dd>{connection?.lastSyncAt ? new Date(connection.lastSyncAt).toLocaleString() : "Never"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Last successful trade</dt>
                  <dd>
                    {connection?.lastSuccessfulTradeAt
                      ? new Date(connection.lastSuccessfulTradeAt).toLocaleString()
                      : "Never"}
                  </dd>
                </div>
              </dl>

              {connection?.lastError ? (
                <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Last broker error: {connection.lastError}
                </p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {broker.id === "zerodha" ? (
                  <>
                    {canConnect ? (
                      <Link
                        href="/api/brokers/zerodha/connect"
                        className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                      >
                        {status === "connected" ? "Reconnect Zerodha" : "Connect Zerodha"}
                      </Link>
                    ) : (
                      <span className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
                        Configure Zerodha env to enable connect
                      </span>
                    )}
                    {connection?.status !== "disconnected" ? (
                      <form action={disconnectZerodhaBrokerAction}>
                        <button
                          type="submit"
                          className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
                        >
                          Disconnect
                        </button>
                      </form>
                    ) : null}
                  </>
                ) : (
                  <span className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
                    Planned after Zerodha hardening
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
