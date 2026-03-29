import Link from "next/link";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Home,
  LogOut,
  MessageSquare,
  Radio,
  School,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Zap,
} from "lucide-react";
import { signOutAction } from "@/app/auth/actions";
import { SupabaseOnboardingRepository } from "@/domain/datasources/supabase-onboarding";
import { requireUserProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile, onboarding } = await requireUserProfile("/app");
  const supabase = await createClient();
  const onboardingRepo = new SupabaseOnboardingRepository(supabase);

  const zerodhaConn = await onboardingRepo.getBrokerConnection(profile.id, "zerodha");
  const isBrokerLive = zerodhaConn?.status === "connected";

  const creatorNav = [
    { href: "/app/feed", label: "Feed", icon: Zap },
    { href: "/app/community", label: "Community", icon: MessageSquare },
    { href: "/app/live", label: "Live", icon: Radio },
    { href: "/app/courses", label: "Courses", icon: School },
    { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/app/subscriptions", label: "Subscriptions", icon: Bell },
  ];

  const followerNav = [
    { href: "/app/follower-feed", label: "Feed", icon: Home },
    { href: "/app/live", label: "Live", icon: Radio },
    { href: "/app/courses", label: "Learn", icon: School },
    { href: "/app/portfolio", label: "Portfolio", icon: TrendingUp },
    { href: "/explore", label: "Explore", icon: Search },
    { href: "/app/notifications", label: "Alerts", icon: Bell },
  ];

  const navItems = profile.role === "creator" ? creatorNav : followerNav;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 h-16 border-b border-inhumans-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/app" className="group flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-inhumans-md border border-teal-primary/20 bg-teal-primary/10 transition-all group-hover:bg-teal-primary/20">
                <ShieldCheck className="text-teal-primary" size={20} />
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-foreground">Inhumans</span>
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-inhumans-border bg-surface-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted sm:flex">
              <span className={cn("h-1.5 w-1.5 rounded-full", isBrokerLive ? "bg-profit" : "bg-warning")} />
              {profile.role} hub
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-xs font-semibold leading-none text-foreground">{profile.name || profile.handle}</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-tighter text-text-muted">{profile.role}</p>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-inhumans-md border border-inhumans-border bg-surface-1 p-2 text-text-muted transition-all hover:bg-surface-2 hover:text-foreground"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl flex-1 md:grid-cols-[260px_1fr]">
        <aside className="hidden space-y-8 border-r border-inhumans-border bg-white/50 p-6 md:block">
          <div className="space-y-1">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-faint">Main Navigation</p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-inhumans-md px-3 py-2.5 text-sm font-medium text-text-muted transition-all hover:bg-surface-2 hover:text-foreground"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className="transition-colors group-hover:text-teal-primary" />
                  {item.label}
                </div>
                <ChevronRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>

          <div className="space-y-1">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-text-faint">System</p>
            <Link
              href="/app/settings/broker"
              className="flex items-center gap-3 rounded-inhumans-md px-3 py-2.5 text-sm font-medium text-text-muted transition-all hover:bg-surface-2 hover:text-foreground"
            >
              <Settings size={18} />
              Broker Settings
            </Link>
          </div>

          {!onboarding.completed ? (
            <div className="mt-8 rounded-inhumans-lg border border-warning/10 bg-warning/5 p-5 shadow-inhumans">
              <p className="text-[10px] font-bold uppercase tracking-widest text-warning">Setup Incomplete</p>
              <p className="mt-1 text-xs font-semibold text-foreground">Onboarding Phase</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                <div className="h-full bg-warning transition-all" style={{ width: `${(onboarding.currentStep / 5) * 100}%` }} />
              </div>
              <Link
                href={`/app/onboarding?step=${onboarding.currentStep}`}
                className="mt-4 block text-[11px] font-bold uppercase tracking-tight text-teal-primary hover:underline"
              >
                Continue Step {onboarding.currentStep} {"->"}
              </Link>
            </div>
          ) : null}

          <div className="mt-auto border-t border-inhumans-divider pt-8">
            <div className="rounded-inhumans-lg border border-inhumans-border bg-surface-2 p-4 shadow-inhumans">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-inhumans-border bg-white shadow-sm">
                  <span className="text-xs font-bold text-teal-primary">{profile.handle?.[0]?.toUpperCase() || "U"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-foreground">@{profile.handle}</p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <div className={cn("h-1.5 w-1.5 rounded-full", isBrokerLive ? "bg-profit" : "bg-warning")} />
                    <p className="text-[9px] font-bold uppercase tracking-tighter text-text-muted">
                      {isBrokerLive ? "Syncing Active" : "Action Needed"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 overflow-y-auto p-4 sm:p-8 md:p-12">{children}</main>
      </div>

      <nav className="sticky bottom-0 z-40 flex h-16 items-center justify-around border-t border-inhumans-border bg-white px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.02)] md:hidden">
        {navItems.slice(0, 4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 p-2 text-text-muted transition-colors hover:text-teal-primary"
          >
            <item.icon size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tight">{item.label}</span>
          </Link>
        ))}
        <Link href="/app/settings/broker" className="flex flex-col items-center gap-1 p-2 text-text-muted">
          <Settings size={20} />
          <span className="text-[9px] font-bold uppercase tracking-tight">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
