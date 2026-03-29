import { SupabaseCopyTradeRepository } from "@/domain/datasources/supabase-copy-trade";
import { createClient } from "@/lib/supabase/server";
import { requireUserProfile } from "@/lib/auth/session";
import { PnLNumber } from "@/components/ui/PnLNumber";
import { 
  TrendingUp, 
  Zap, 
  Activity, 
  ShieldCheck,
  History,
  Search,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function PortfolioPage() {
  const { profile } = await requireUserProfile("/app/portfolio");
  const repo = new SupabaseCopyTradeRepository(await createClient());
  const [summary, copyTrades] = await Promise.all([
    repo.getFollowerPortfolioSummary(profile.id),
    repo.listFollowerCopyTrades(profile.id, 100),
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-primary mb-1.5">Personal Execution</p>
          <h1 className="text-3xl font-bold text-foreground font-display">Copy Portfolio</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/app/follower-feed" className="px-5 py-2.5 rounded-inhumans-md bg-teal-primary text-white text-[11px] font-bold uppercase tracking-widest hover:bg-teal-primary-hover transition-all shadow-md shadow-teal-primary/10 flex items-center gap-2">
            Find Signals <Search size={14} />
          </Link>
        </div>
      </header>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          label="Total Realized" 
          value={summary.totalRealizedPnl >= 0 ? `+₹${summary.totalRealizedPnl.toLocaleString("en-IN")}` : `-₹${Math.abs(summary.totalRealizedPnl).toLocaleString("en-IN")}`} 
          icon={TrendingUp} 
          trend="Lifetime Outcome"
          variant={summary.totalRealizedPnl >= 0 ? "profit" : "loss"}
        />
        <KpiCard 
          label="Success Rate" 
          value={`${summary.totalCopyTrades > 0 ? Math.round((summary.executedTrades / summary.totalCopyTrades) * 100) : 0}%`} 
          icon={ShieldCheck} 
          trend="Broker fill efficiency" 
        />
        <KpiCard 
          label="Open Positions" 
          value={summary.openTrades.toString()} 
          icon={Zap} 
          trend="Live in market" 
        />
        <KpiCard 
          label="Total History" 
          value={summary.totalCopyTrades.toString()} 
          icon={History} 
          trend="Cumulative attempts" 
        />
      </div>

      {/* Soft Master Trade Log */}
      <article className="rounded-inhumans-lg border border-inhumans-border bg-white shadow-inhumans overflow-hidden">
        <div className="px-8 py-5 border-b border-inhumans-divider bg-surface-2/30">
          <h3 className="font-bold text-[11px] uppercase tracking-wider text-text-muted">Master Execution Log</h3>
        </div>
        
        <div className="overflow-x-auto">
          {copyTrades.length === 0 ? (
            <div className="py-24 text-center px-6">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-6 border border-inhumans-border">
                <Activity size={24} className="text-text-faint" />
              </div>
              <p className="text-sm text-text-muted italic">No mirror execution history found.</p>
              <p className="mt-2 text-xs text-text-faint max-w-xs mx-auto">Once you copy a trade from the feed, its lifecycle will be tracked here in detail.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-faint border-b border-inhumans-divider bg-surface-2/10">
                  <th className="px-8 py-5 font-mono">Timestamp</th>
                  <th className="px-8 py-5">Instrument</th>
                  <th className="px-8 py-5">Quantity</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Realized P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inhumans-divider">
                {copyTrades.map((copy) => (
                  <tr key={copy.id} className="hover:bg-surface-2/30 transition-colors group">
                    <td className="px-8 py-6 text-text-faint font-mono text-xs">
                      {new Date(copy.createdAt).toLocaleString("en-IN", { 
                        day: '2-digit', 
                        month: 'short', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-foreground">{copy.instrument}</p>
                      <p className="text-[10px] text-text-muted font-mono uppercase tracking-tighter mt-0.5">
                        {copy.side} · {copy.symbol}
                      </p>
                    </td>
                    <td className="px-8 py-6 font-mono text-sm font-medium text-foreground">{copy.requestedQuantity}</td>
                    <td className="px-8 py-6">
                      <StatusBadge status={copy.status} />
                      {copy.failureReason && (
                        <p className="mt-1.5 text-[9px] text-loss/70 truncate max-w-[140px] font-medium" title={copy.failureReason}>
                          {copy.failureReason}
                        </p>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right font-bold">
                      {copy.realizedPnl !== null ? (
                        <PnLNumber value={copy.realizedPnl} className="text-sm" />
                      ) : (
                        <span className="text-text-faint text-xs">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </article>
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

function StatusBadge({ status }: { status: string }) {
  const styles = {
    executed: "bg-profit/5 text-profit border-profit/10",
    failed: "bg-loss/5 text-loss border-loss/10",
    skipped: "bg-warning/5 text-warning border-warning/10",
    pending: "bg-surface-2 text-text-muted border-inhumans-border",
    submitted: "bg-teal-primary/5 text-teal-primary border-teal-primary/10",
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border",
      styles[status as keyof typeof styles] || styles.pending
    )}>
      {status}
    </span>
  );
}
