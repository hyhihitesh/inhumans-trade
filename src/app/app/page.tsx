import Link from "next/link";
import { redirect } from "next/navigation";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  Activity,
  ArrowUpRight,
  ChevronRight,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SupabaseCopyTradeRepository } from "@/domain/datasources/supabase-copy-trade";
import { SupabaseCreatorBusinessRepository } from "@/domain/datasources/supabase-creator-business";
import { SupabaseFeedRepository } from "@/domain/datasources/supabase-feed";
import { UserProfile } from "@/domain/types";
import { requireAuthenticatedSession, requireUserProfile } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { PnLNumber } from "@/components/ui/PnLNumber";

export default async function AppHomePage() {
  const { profile, onboarding } = await requireUserProfile("/app");

  if (!onboarding.completed) {
    redirect(`/app/onboarding?step=${onboarding.currentStep}`);
  }

  const { supabase } = await requireAuthenticatedSession("/app");

  if (profile.role === "creator") {
    return <CreatorDashboard profile={profile} supabase={supabase} />;
  }

  return <FollowerDashboard profile={profile} supabase={supabase} />;
}

async function CreatorDashboard({ profile, supabase }: { profile: UserProfile; supabase: SupabaseClient }) {
  const businessRepo = new SupabaseCreatorBusinessRepository(supabase);
  const feedRepo = new SupabaseFeedRepository(supabase);

  const [summary, trades] = await Promise.all([
    businessRepo.getCreatorAnalyticsSummary(profile.id),
    feedRepo.listCreatorTrades(profile.id, 1),
  ]);

  const latestTrade = trades[0] ?? null;

  return (
    <div className="animate-in space-y-10 fade-in duration-500">
      <header>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-teal-primary">Business Overview</p>
        <h1 className="font-display text-3xl font-bold text-foreground">Creator Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Subscribers" value={summary.subscribers.toLocaleString()} icon={Users} trend="+12% this month" />
        <KpiCard label="MRR" value={`Rs ${summary.mrrInr.toLocaleString("en-IN")}`} icon={TrendingUp} trend="Next payout: April 5" />
        <KpiCard label="Win Rate" value={`${summary.winRate}%`} icon={ShieldCheck} trend="Institutional Grade" />
        <KpiCard label="Copy Rate" value={`${summary.copyRate}%`} icon={Zap} trend="High Conviction" />
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <article className="overflow-hidden rounded-inhumans-lg border border-inhumans-border bg-white shadow-inhumans lg:col-span-2">
          <div className="flex items-center justify-between border-b border-inhumans-divider bg-surface-2/50 px-6 py-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Most Recent Verified Trade</h3>
            <Link
              href="/app/feed"
              className="group flex items-center gap-1.5 text-[11px] font-bold uppercase text-teal-primary transition-colors hover:text-teal-primary-hover"
            >
              Full Feed <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="p-8">
            {latestTrade ? (
              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">
                <div>
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                        latestTrade.side === "BUY" ? "border-profit/20 bg-profit/10 text-profit" : "border-loss/20 bg-loss/10 text-loss"
                      )}
                    >
                      {latestTrade.side}
                    </span>
                    <h4 className="text-2xl font-bold tracking-tight">{latestTrade.instrument}</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-faint">Entry</span>
                      <span className="font-mono text-sm font-bold">{latestTrade.entryPrice.toFixed(2)}</span>
                    </div>
                    <div className="h-6 w-px bg-inhumans-divider" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-text-faint">Status</span>
                      <span className="text-sm font-bold capitalize text-text-muted">{latestTrade.status}</span>
                    </div>
                  </div>
                </div>
                <div className="border-inhumans-divider pt-6 text-left md:border-t-0 md:pt-0 md:text-right">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-text-faint">Live Performance</p>
                  <PnLNumber value={latestTrade.currentPnl} className="text-4xl" />
                </div>
              </div>
            ) : (
              <div className="rounded-inhumans-md border border-dashed border-inhumans-border bg-surface-2/30 py-8 text-center">
                <p className="text-sm italic text-text-muted">Awaiting your first broker-verified execution.</p>
                <Link
                  href="/app/feed"
                  className="mt-5 inline-block rounded-inhumans-md bg-teal-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-teal-primary-hover"
                >
                  Initialize Feed
                </Link>
              </div>
            )}
          </div>
        </article>

        <article className="flex flex-col justify-between rounded-inhumans-lg border border-inhumans-border bg-white p-8 shadow-inhumans">
          <div>
            <h3 className="mb-8 text-[11px] font-bold uppercase tracking-wider text-text-muted">Performance Cycle</h3>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-text-faint">30D Realized P&amp;L</p>
            <PnLNumber value={summary.monthlyPnl} className="text-4xl" />

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between border-b border-inhumans-divider py-2">
                <span className="text-xs font-medium text-text-muted">Total Trades</span>
                <span className="font-mono text-xs font-bold">{summary.totalTrades}</span>
              </div>
              <div className="flex items-center justify-between border-b border-inhumans-divider py-2">
                <span className="text-xs font-medium text-text-muted">Executed Copies</span>
                <span className="font-mono text-xs font-bold">{summary.executedCopyTrades}</span>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/app/analytics"
              className="flex w-full items-center justify-center gap-2 rounded-inhumans-md border border-inhumans-border bg-surface-2 py-3.5 text-[11px] font-bold uppercase tracking-widest text-foreground transition-all hover:bg-surface-3"
            >
              Deep Analytics <ArrowUpRight size={14} />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

async function FollowerDashboard({ profile, supabase }: { profile: UserProfile; supabase: SupabaseClient }) {
  const copyTradeRepo = new SupabaseCopyTradeRepository(supabase);

  const [summary, recentCopies] = await Promise.all([
    copyTradeRepo.getFollowerPortfolioSummary(profile.id),
    copyTradeRepo.listFollowerCopyTrades(profile.id, 5),
  ]);

  const totalPnlLabel =
    summary.totalRealizedPnl >= 0
      ? `+Rs ${summary.totalRealizedPnl.toLocaleString("en-IN")}`
      : `-Rs ${Math.abs(summary.totalRealizedPnl).toLocaleString("en-IN")}`;

  return (
    <div className="animate-in space-y-10 fade-in duration-500">
      <header>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-teal-primary">Personal Portfolio</p>
        <h1 className="font-display text-3xl font-bold text-foreground">Follower Overview</h1>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total P&L"
          value={totalPnlLabel}
          icon={TrendingUp}
          trend="Overall Outcome"
          variant={summary.totalRealizedPnl >= 0 ? "profit" : "loss"}
        />
        <KpiCard label="Copy Trades" value={summary.executedTrades.toString()} icon={Activity} trend="Successful Executions" />
        <KpiCard label="Active" value={summary.openTrades.toString()} icon={Zap} trend="Positions in Market" />
        <KpiCard
          label="Consistency"
          value={`${summary.totalCopyTrades > 0 ? Math.round((summary.executedTrades / summary.totalCopyTrades) * 100) : 0}%`}
          icon={ShieldCheck}
          trend="Fill Rate"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <article className="overflow-hidden rounded-inhumans-lg border border-inhumans-border bg-white shadow-inhumans lg:col-span-2">
          <div className="flex items-center justify-between border-b border-inhumans-divider bg-surface-2/50 px-6 py-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-muted">Recent Signal Mirroring</h3>
            <Link
              href="/app/portfolio"
              className="group flex items-center gap-1.5 text-[11px] font-bold uppercase text-teal-primary transition-colors hover:text-teal-primary-hover"
            >
              All Activity <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentCopies.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-inhumans-divider text-[9px] font-bold uppercase tracking-[0.15em] text-text-faint">
                    <th className="px-8 py-4">Instrument</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-inhumans-divider">
                  {recentCopies.map((copy) => (
                    <tr key={copy.id} className="group transition-colors hover:bg-surface-2/30">
                      <td className="px-8 py-5">
                        <p className="font-bold text-foreground">{copy.instrument}</p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase text-text-faint">
                          {copy.side} &middot; {copy.symbol}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider",
                            copy.status === "executed"
                              ? "border-profit/10 bg-profit/5 text-profit"
                              : copy.status === "failed"
                                ? "border-loss/10 bg-loss/5 text-loss"
                                : "border-inhumans-border bg-surface-2 text-text-muted"
                          )}
                        >
                          {copy.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-semibold">
                        {copy.realizedPnl !== null ? <PnLNumber value={copy.realizedPnl} className="text-sm" /> : <span className="text-xs text-text-faint">--</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-16 text-center">
                <p className="text-sm italic text-text-muted">Your mirror execution history is currently empty.</p>
                <Link
                  href="/app/follower-feed"
                  className="mt-5 inline-block rounded-inhumans-md bg-teal-primary px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-teal-primary-hover"
                >
                  Discover Alpha
                </Link>
              </div>
            )}
          </div>
        </article>

        <article className="flex flex-col justify-between rounded-inhumans-lg border border-inhumans-border bg-white p-8 shadow-inhumans">
          <div>
            <h3 className="mb-8 text-[11px] font-bold uppercase tracking-wider text-text-muted">Trust Discovery</h3>
            <p className="text-sm leading-relaxed text-text-muted">
              Connect with creators who prioritize <strong>proof over promise</strong>. Every trade you see is pulled directly from a verified broker account.
            </p>
          </div>
          <div className="mt-10">
            <Link
              href="/explore"
              className="flex w-full items-center justify-center gap-2 rounded-inhumans-md bg-teal-primary py-4 text-[11px] font-bold uppercase tracking-widest text-white shadow-md shadow-teal-primary/5 transition-all hover:bg-teal-primary-hover"
            >
              Explore Verified Creators <Search size={14} />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  variant = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend: string;
  variant?: "default" | "profit" | "loss";
}) {
  return (
    <article className="group rounded-inhumans-lg border border-inhumans-border bg-white p-6 shadow-inhumans transition-all hover:border-teal-primary/20">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-inhumans-md border border-inhumans-border bg-surface-2 shadow-sm transition-all group-hover:bg-teal-primary/5">
          <Icon size={20} className={cn(variant === "profit" ? "text-profit" : variant === "loss" ? "text-loss" : "text-teal-primary")} />
        </div>
      </div>
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-text-faint">{label}</p>
      <p className="mb-2.5 font-display text-3xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-[10px] font-medium tracking-tight text-text-muted">{trend}</p>
    </article>
  );
}
