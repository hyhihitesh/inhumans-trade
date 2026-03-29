import { requireUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCreatorBusinessRepository } from "@/domain/datasources/supabase-creator-business";
import { PnLNumber } from "@/components/ui/PnLNumber";
import { 
  Users, 
  ShieldCheck, 
  Zap, 
  CreditCard,
  Target,
  ArrowUpRight,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AnalyticsPage() {
  const { profile } = await requireUserProfile("/app/analytics");
  const repo = new SupabaseCreatorBusinessRepository(await createClient());
  const summary = await repo.getCreatorAnalyticsSummary(profile.id);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-primary mb-1.5">Business Intelligence</p>
          <h1 className="text-3xl font-bold text-foreground font-display">Creator Analytics</h1>
        </div>
        <div className="px-4 py-2 rounded-full border border-inhumans-border bg-white text-[10px] font-bold uppercase tracking-widest text-text-muted shadow-sm">
          Updated: Just now
        </div>
      </header>

      {/* Primary Metrics Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          label="Total Subscribers" 
          value={summary.subscribers.toLocaleString()} 
          icon={Users} 
          trend="+8% from last month" 
        />
        <KpiCard 
          label="Monthly Revenue" 
          value={`₹${summary.mrrInr.toLocaleString("en-IN")}`} 
          icon={CreditCard} 
          trend="Estimated net payout" 
        />
        <KpiCard 
          label="Verified Win Rate" 
          value={`${summary.winRate}%`} 
          icon={ShieldCheck} 
          trend={`${summary.totalTrades} total trades`} 
          variant={summary.winRate > 50 ? "profit" : "default"}
        />
        <KpiCard 
          label="Engagement Score" 
          value={`${summary.copyRate}%`} 
          icon={Zap} 
          trend="Follower conviction" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Visualization Placeholder */}
        <article className="lg:col-span-2 rounded-inhumans-lg border border-inhumans-border bg-white shadow-inhumans overflow-hidden">
          <div className="px-6 py-4 border-b border-inhumans-divider bg-surface-2/30 flex justify-between items-center">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-text-muted">30-Day P&L Velocity</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-profit" />
              <span className="text-[10px] font-bold uppercase text-text-faint">Realized</span>
            </div>
          </div>
          <div className="p-10 flex flex-col items-center justify-center min-h-[350px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint mb-3">Cycle Performance</p>
            <PnLNumber value={summary.monthlyPnl} className="text-7xl font-display" />

            <div className="mt-12 grid grid-cols-3 gap-12">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-faint mb-1">Trades</p>
                <p className="text-2xl font-bold font-display">{summary.totalTrades}</p>
              </div>
              <div className="text-center border-x border-inhumans-divider px-12">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-faint mb-1">Avg RR</p>
                <p className="text-2xl font-bold font-display">1:2.4</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-faint mb-1">Profit Factor</p>
                <p className="text-2xl font-bold font-display text-profit">1.82</p>
              </div>
            </div>
          </div>
        </article>

        {/* Execution Efficiency */}
        <article className="rounded-inhumans-lg border border-inhumans-border bg-white shadow-inhumans p-8 space-y-8">
          <div className="space-y-1">
            <h3 className="font-bold text-[11px] uppercase tracking-wider text-text-muted">Copy Integrity</h3>
            <p className="text-xs text-text-faint leading-relaxed">
              How effectively your followers mirror your verified executions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold uppercase text-text-faint mb-1">Requests</p>
                <p className="text-3xl font-bold font-mono text-foreground">{summary.totalCopyTrades}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase text-text-faint mb-1">Success</p>
                <p className="text-3xl font-bold font-mono text-teal-primary">{summary.executedCopyTrades}</p>
              </div>
            </div>

            <div className="h-2.5 w-full bg-surface-2 rounded-full overflow-hidden border border-inhumans-divider">
              <div 
                className="h-full bg-teal-primary/80 transition-all duration-1000 ease-out" 
                style={{ width: `${summary.totalCopyTrades > 0 ? (summary.executedCopyTrades / summary.totalCopyTrades) * 100 : 0}%` }}
              />
            </div>

            <div className="p-4 rounded-inhumans-md bg-surface-2/50 border border-inhumans-divider">
              <div className="flex items-center gap-3">
                <Target size={16} className="text-text-muted" />
                <p className="text-[11px] font-medium text-text-muted leading-snug">
                  Your current **Copy Rate** is {summary.copyRate}%, indicating strong trust signals.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-inhumans-divider">
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-inhumans-md bg-surface-2 border border-inhumans-border hover:bg-surface-3 transition-all text-[11px] font-bold uppercase tracking-widest text-foreground">
              Export Audit Log <ArrowUpRight size={14} />
            </button>
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
  variant = "default"
}: { 
  label: string; 
  value: string; 
  icon: LucideIcon; 
  trend: string;
  variant?: "default" | "profit" | "loss"
}) {
  return (
    <article className="rounded-inhumans-lg border border-inhumans-border bg-white p-6 shadow-inhumans hover:border-teal-primary/20 transition-all group">
      <div className="flex items-center justify-between mb-5">
        <div className="w-10 h-10 rounded-inhumans-md bg-surface-2 flex items-center justify-center border border-inhumans-border group-hover:bg-teal-primary/5 transition-all shadow-sm">
          <Icon size={20} className={cn(
            variant === "profit" ? "text-profit" : variant === "loss" ? "text-loss" : "text-teal-primary"
          )} />
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-faint mb-1.5">{label}</p>
      <p className="text-3xl font-display font-bold tracking-tight text-foreground mb-2.5">{value}</p>
      <p className="text-[10px] font-medium text-text-muted tracking-tight">{trend}</p>
    </article>
  );
}
