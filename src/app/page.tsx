"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  CandlestickChart,
  CheckCircle2,
  ChevronRight,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Explore Traders", href: "#featured-traders" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "For Creators", href: "#for-creators" },
  { label: "Pricing", href: "#pricing" },
] as const;

const socialProofStats = [
  { value: "2,400+", label: "verified trade calls published" },
  { value: "380+", label: "active subscribers today" },
  { value: "INR 12.4 Cr+", label: "in tracked trade value" },
  { value: "94%", label: "of creators connected to live broker" },
] as const;

const creatorSteps = [
  "Connect your Zerodha or Dhan account",
  "Trade as normal, Inhumans captures it live",
  "Set your subscription price and go public",
  "Build your audience on proof, not promises",
] as const;

const followerSteps = [
  "Browse verified traders by market, style, and ROI",
  "View live trades and real performance history",
  "Subscribe to get alerts and a private trade feed",
  "Optionally connect your broker to copy trades",
] as const;

const trustPillars = [
  {
    title: "Broker API connected",
    body: "Trade data flows directly from Zerodha, Dhan, or supported brokers. No manual input.",
    icon: Landmark,
  },
  {
    title: "Timestamps are immutable",
    body: "Entry and exit times are locked the moment the order is placed. Nothing can be backdated.",
    icon: LockKeyhole,
  },
  {
    title: "Performance is calculated",
    body: "ROI, win rate, drawdown, and risk profile are auto-calculated. No self-reporting.",
    icon: CandlestickChart,
  },
] as const;

const featuredTraders = [
  {
    name: "Arjun Sharma",
    specialty: "Nifty Options Intraday",
    winRate: "68%",
    roi: "+22.4%",
    broker: "Zerodha",
    language: "Hindi / English",
    size: "large",
    tint: "from-teal-primary/10 via-white to-white",
  },
  {
    name: "Priya Thomas",
    specialty: "Swing Equity",
    winRate: "71%",
    roi: "+18.1%",
    broker: "Dhan",
    language: "English / Kannada",
    size: "small",
    tint: "from-sky-100/60 via-white to-white",
  },
  {
    name: "Kiran Menon",
    specialty: "BankNifty Momentum",
    winRate: "64%",
    roi: "+26.8%",
    broker: "Zerodha",
    language: "Hindi / Telugu",
    size: "small",
    tint: "from-amber-100/70 via-white to-white",
  },
  {
    name: "Neha Verma",
    specialty: "Positional Futures",
    winRate: "73%",
    roi: "+15.7%",
    broker: "Dhan",
    language: "Hindi / English",
    size: "large",
    tint: "from-emerald-100/70 via-white to-white",
  },
] as const;

const feedPreview = [
  {
    instrument: "NIFTY 22500 CE",
    status: "BUY",
    meta: "Entry INR 112",
    time: "09:17 AM",
    mood: "open",
  },
  {
    instrument: "RELIANCE",
    status: "SELL",
    meta: "Exit INR 2,847",
    time: "+3.8%",
    mood: "closed",
  },
  {
    instrument: "BANKNIFTY 48000 PE",
    status: "SL Hit",
    meta: "Entry INR 88 to Exit INR 64",
    time: "-INR 2,400",
    mood: "loss",
  },
  {
    instrument: "INFY",
    status: "BUY",
    meta: "Entry INR 1,892",
    time: "Swing, Day 3",
    mood: "swing",
  },
] as const;

const pricingTiers = [
  {
    name: "Free",
    price: "INR 0",
    cadence: "forever",
    note: "Follow up to 3 traders",
    features: [
      "See trade history for the last 7 days",
      "Basic performance stats",
      "No alerts",
    ],
    cta: "Start free",
    href: "/auth/sign-up",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "INR 499",
    cadence: "per month per trader",
    note: "Most popular for active followers",
    features: [
      "Live trade alerts by push and email",
      "Full trade history",
      "Performance deep dive",
      "Priority access to new creators",
    ],
    cta: "Subscribe to Pro traders",
    href: "/auth/sign-up",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "INR 999",
    cadence: "per month per trader",
    note: "For high-conviction followers",
    features: [
      "Everything in Pro",
      "Copy-trade integration",
      "1-on-1 creator chat access",
      "Early access before alerts fire",
    ],
    cta: "Subscribe to Elite traders",
    href: "/auth/sign-up",
    highlighted: false,
  },
] as const;

const testimonials = [
  {
    quote:
      "I followed 4 traders on Telegram for 8 months and lost money on their delayed calls. On Inhumans I can see exactly when they entered. That changed everything for me.",
    author: "Rohit S.",
    detail: "Software engineer, Pune",
    size: "large",
  },
  {
    quote:
      "Connected my Zerodha account in 15 minutes. My followers grew from 0 to 140 in 6 weeks without posting a single video.",
    author: "Kiran M.",
    detail: "Options trader, Hyderabad",
    size: "small",
  },
  {
    quote:
      "The verified badge alone makes people trust me more than my 50k Telegram group ever did.",
    author: "Priya T.",
    detail: "Swing trader, Bangalore",
    size: "small",
  },
] as const;

const faqs = [
  {
    question: "Is Inhumans SEBI registered?",
    answer:
      "Inhumans is a technology platform, not a registered investment advisor. We do not offer financial advice. Creators share their trades for educational purposes only.",
  },
  {
    question: "Can I lose money copying a trader?",
    answer:
      "Yes. All trading involves risk. Inhumans shows you verified history, not guaranteed future performance. Copy-trade features require you to acknowledge risk explicitly.",
  },
  {
    question: "How is the broker connection secured?",
    answer:
      "We use read-only API access from brokers like Zerodha and Dhan. We never have access to your funds, passwords, or trading permissions. Your money stays in your account.",
  },
  {
    question: "Can a creator fake their trades?",
    answer:
      "No. Trades come directly from the broker API, timestamped at order placement. Creators cannot manually enter, delete, or modify any trade data.",
  },
  {
    question: "What markets are supported?",
    answer:
      "Currently NSE equity, F&O, and currency. BSE, MCX, and crypto are coming soon.",
  },
] as const;

const containerClass = "mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8";

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.35 }}
      variants={reveal}
      className={cn(
        "max-w-3xl space-y-4",
        align === "center" && "mx-auto text-center"
      )}
    >
      {eyebrow ? (
        <p className="section-kicker">
          <Sparkles className="size-3.5" />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-copy">{description}</p> : null}
    </motion.div>
  );
}

function TradeStatusPill({ mood }: { mood: (typeof feedPreview)[number]["mood"] }) {
  const styles = {
    open: "bg-profit/10 text-profit border-profit/20",
    closed: "bg-teal-primary/10 text-teal-primary border-teal-primary/20",
    loss: "bg-loss/10 text-loss border-loss/20",
    swing: "bg-neutral/10 text-neutral border-neutral/20",
  } as const;

  const labels = {
    open: "Open",
    closed: "Closed",
    loss: "Risk Hit",
    swing: "Swing",
  } as const;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase",
        styles[mood]
      )}
    >
      {labels[mood]}
    </span>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.08),transparent_34%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.08),transparent_28%),linear-gradient(180deg,#f9f8f6_0%,#f6f3ee_46%,#f9f8f6_100%)]" />

      <div className="border-b border-inhumans-divider bg-[#f3efe8]/90 text-center text-[11px] font-medium tracking-[0.14em] text-foreground/70 backdrop-blur">
        <div className={cn(containerClass, "py-2")}>
          <span className="mr-2 text-loss">LIVE NOW</span>
          47 verified traders publishing real-time trades. No signals. No guesswork. Just proof.
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-inhumans-divider bg-background/84 backdrop-blur-xl">
        <nav className={cn(containerClass, "flex h-[4.5rem] items-center justify-between gap-6")}>
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full border border-teal-primary/20 bg-teal-primary/10 text-sm font-semibold text-teal-primary">
              IN
            </div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Inhumans</p>
              <p className="text-xs tracking-[0.16em] text-foreground/45 uppercase">
                Verified trades
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button asChild variant="ghost" className="rounded-full px-4 text-foreground/75 hover:bg-white/70">
              <Link href="/auth/sign-in">Log in</Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-teal-primary px-5 text-white shadow-[0_10px_30px_-18px_rgba(13,148,136,0.95)] hover:bg-teal-primary-hover"
            >
              <Link href="/auth/sign-up">Join for free</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="pb-24">
        <section className="landing-section pt-14 sm:pt-20">
          <div className={cn(containerClass, "grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]")}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-2xl space-y-7 pt-6"
            >
              <motion.p variants={reveal} className="section-kicker">
                <ShieldCheck className="size-3.5" />
                Verified trading. Live.
              </motion.p>

              <motion.h1
                variants={reveal}
                className="max-w-xl text-5xl leading-[0.98] font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl"
              >
                Follow traders who prove it with every trade.
              </motion.h1>

              <motion.p
                variants={reveal}
                className="max-w-xl text-lg leading-8 text-foreground/68 sm:text-xl"
              >
                Inhumans connects you to India&apos;s top traders. Every position is
                broker-verified, every stat is earned in real markets, and every
                follower sees what happened today instead of a screenshot from last
                month.
              </motion.p>

              <motion.div variants={reveal} className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-[3.25rem] rounded-full bg-teal-primary px-6 text-base text-white shadow-[0_14px_36px_-18px_rgba(13,148,136,1)] hover:bg-teal-primary-hover"
                >
                  <Link href="/auth/sign-up">
                    Start following for free
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-[3.25rem] rounded-full border-inhumans-border bg-white/80 px-6 text-base text-foreground hover:bg-white"
                >
                  <Link href="/auth/sign-up?role=creator">
                    I&apos;m a trader, grow my audience
                    <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </motion.div>

              <motion.p
                variants={reveal}
                className="text-sm leading-7 text-foreground/52"
              >
                No credit card. Cancel anytime. Trades verified via Zerodha and Dhan.
              </motion.p>

              <motion.div
                variants={reveal}
                className="grid gap-3 sm:grid-cols-3"
              >
                {[
                  "Live entry and exit stamps",
                  "Losses shown alongside wins",
                  "Built for followers and creators",
                ].map((item) => (
                  <div key={item} className="data-chip">
                    <CheckCircle2 className="size-4 text-teal-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="relative"
            >
              <motion.div
                variants={reveal}
                className="absolute -left-6 top-8 hidden rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-[0_18px_45px_-30px_rgba(38,38,38,0.28)] backdrop-blur md:block"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                  Today&apos;s signal health
                </p>
                <div className="mt-3 flex items-end gap-2">
                  {[35, 58, 44, 76, 62, 88, 71].map((height, index) => (
                    <div
                      key={height}
                      className={cn(
                        "w-4 rounded-full bg-gradient-to-t from-teal-primary to-teal-primary/25",
                        index === 2 && "from-warning to-warning/30",
                        index === 6 && "from-profit to-profit/30"
                      )}
                      style={{ height }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div variants={reveal} className="linen-panel overflow-hidden p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-inhumans-divider pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                      Live verified feed
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-foreground">
                      Proof before promise
                    </h3>
                  </div>
                  <div className="rounded-full border border-profit/20 bg-profit/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-profit uppercase">
                    Broker verified
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      instrument: "NIFTY 22500 CE",
                      action: "BUY",
                      detail: "Entry INR 112 at 09:17 AM",
                      result: "Open",
                    },
                    {
                      instrument: "RELIANCE",
                      action: "Closed",
                      detail: "Exit INR 2,847 at 11:02 AM",
                      result: "+4.2%",
                    },
                    {
                      instrument: "BANKNIFTY 48000 PE",
                      action: "SL Hit",
                      detail: "Entry INR 88 to Exit INR 64",
                      result: "-INR 2,400",
                    },
                    {
                      instrument: "INFY",
                      action: "Swing",
                      detail: "Position carried into day 3",
                      result: "Still active",
                    },
                  ].map((trade, index) => (
                    <div
                      key={trade.instrument}
                      className="soft-card flex items-center justify-between gap-4 p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">
                            {trade.instrument}
                          </p>
                          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-primary">
                            {trade.action}
                          </span>
                        </div>
                        <p className="text-sm text-foreground/58">{trade.detail}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            index === 2
                              ? "text-loss"
                              : index === 1
                                ? "text-profit"
                                : "text-foreground"
                          )}
                        >
                          {trade.result}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-foreground/38">
                          Broker linked
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="soft-card p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/40">
                      Verified calls today
                    </p>
                    <p className="mt-2 text-2xl font-semibold">147</p>
                  </div>
                  <div className="soft-card p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/40">
                      Alert latency
                    </p>
                    <p className="mt-2 text-2xl font-semibold">1.9s</p>
                  </div>
                  <div className="soft-card p-4">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/40">
                      Copy-ready accounts
                    </p>
                    <p className="mt-2 text-2xl font-semibold">83</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="landing-section mt-16">
          <div className={cn(containerClass)}>
            <div className="rounded-[2rem] border border-inhumans-divider bg-white/72 px-6 py-6 shadow-[0_20px_50px_-40px_rgba(38,38,38,0.35)] backdrop-blur sm:px-8">
              <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-foreground/42">
                Trusted by traders across India
              </p>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={stagger}
                className="mt-6 grid gap-4 md:grid-cols-4"
              >
                {socialProofStats.map((stat) => (
                  <motion.div key={stat.label} variants={reveal} className="soft-card p-5 text-center">
                    <p className="text-3xl font-semibold tracking-tight text-foreground">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground/56">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-section mt-24">
          <div className={cn(containerClass, "space-y-12")}>
            <SectionHeading
              eyebrow="How it works"
              title="From trade to follower in seconds"
              description="The whole experience is designed to feel easy on both sides. Creators just trade. Followers just follow. The proof layer handles the rest."
            />

            <div className="grid gap-6 lg:grid-cols-[1fr_0.88fr_1fr]">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={stagger}
                className="linen-panel p-6"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-full bg-teal-primary/10 p-2 text-teal-primary">
                    <TrendingUp className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-foreground/40">
                      Creator side
                    </p>
                    <h3 className="text-2xl font-semibold">Trade like normal</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {creatorSteps.map((step, index) => (
                    <motion.div key={step} variants={reveal} className="flex gap-4">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-teal-primary/20 bg-white text-sm font-semibold text-teal-primary">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-base leading-7 text-foreground/70">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={reveal}
                className="linen-panel flex flex-col justify-between overflow-hidden p-5"
              >
                <div className="rounded-[1.6rem] border border-inhumans-divider bg-white p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/42">
                    Creator dashboard
                  </p>
                  <div className="mt-4 space-y-3">
                    {["Live broker connected", "Monthly subscribers: 142", "Subscription price: INR 499"].map((item) => (
                      <div key={item} className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-3 text-sm text-foreground/70">
                        <span>{item}</span>
                        <CheckCircle2 className="size-4 text-teal-primary" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mx-auto my-4 flex size-12 items-center justify-center rounded-full border border-teal-primary/20 bg-teal-primary/10 text-teal-primary">
                  <ArrowRight className="size-5" />
                </div>
                <div className="rounded-[1.6rem] border border-inhumans-divider bg-white p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/42">
                    Follower alert
                  </p>
                  <div className="mt-4 rounded-2xl border border-profit/20 bg-profit/10 p-4">
                    <div className="flex items-center gap-3">
                      <Bell className="size-5 text-profit" />
                      <div>
                        <p className="text-sm font-semibold">Arjun Sharma entered NIFTY</p>
                        <p className="text-xs text-foreground/50">Verified at 09:17 AM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={stagger}
                className="linen-panel p-6"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-full bg-neutral/10 p-2 text-neutral">
                    <Users className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-foreground/40">
                      Follower side
                    </p>
                    <h3 className="text-2xl font-semibold">Choose clarity over noise</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  {followerSteps.map((step, index) => (
                    <motion.div key={step} variants={reveal} className="flex gap-4">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-neutral/20 bg-white text-sm font-semibold text-neutral">
                        {index + 1}
                      </div>
                      <p className="pt-1 text-base leading-7 text-foreground/70">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="landing-section mt-24">
          <div className={cn(containerClass, "space-y-10")}>
            <SectionHeading
              eyebrow="Trust mechanism"
              title="Every trade here is broker-linked. Here's why that matters."
              description="On Telegram, anyone can post a trade after it already happened. On Inhumans, every entry and exit is timestamped directly from the broker API before the market has time to rewrite the story."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={stagger}
              className="grid gap-5 md:grid-cols-3"
            >
              {trustPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <motion.article key={pillar.title} variants={reveal} className="linen-panel p-6">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-teal-primary shadow-[0_18px_30px_-24px_rgba(13,148,136,0.75)]">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold">{pillar.title}</h3>
                    <p className="mt-3 text-base leading-7 text-foreground/62">{pillar.body}</p>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>

        <section id="featured-traders" className="landing-section mt-24">
          <div className={cn(containerClass, "space-y-12")}>
            <SectionHeading
              eyebrow="Featured traders"
              title="Meet traders who are already live"
              description="Different styles, different markets, same standard: every trade is on record and every stat is earned in the open."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="grid gap-5 md:grid-cols-2"
            >
              {featuredTraders.map((trader) => (
                <motion.article
                  key={trader.name}
                  variants={reveal}
                  className={cn(
                    "overflow-hidden rounded-[2rem] border border-inhumans-divider bg-gradient-to-br p-6 shadow-[0_22px_55px_-40px_rgba(38,38,38,0.4)]",
                    trader.tint,
                    trader.size === "large" ? "md:min-h-[23rem]" : "md:min-h-[19rem]"
                  )}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="space-y-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex size-14 items-center justify-center rounded-full border border-white/90 bg-white text-lg font-semibold text-foreground shadow-sm">
                            {trader.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-2xl font-semibold">{trader.name}</h3>
                              <ShieldCheck className="size-4 text-teal-primary" />
                            </div>
                            <p className="mt-1 text-sm text-foreground/58">{trader.specialty}</p>
                          </div>
                        </div>
                        <div className="rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-primary">
                          Live now
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          { label: "Win rate", value: trader.winRate },
                          { label: "ROI this month", value: trader.roi },
                          { label: "Broker", value: trader.broker },
                          { label: "Language", value: trader.language },
                        ].map((item) => (
                          <div key={item.label} className="rounded-[1.4rem] border border-white/85 bg-white/88 p-4">
                            <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/42">
                              {item.label}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-foreground">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="mt-6 w-fit rounded-full border-white bg-white/85 px-5 hover:bg-white"
                    >
                      <Link href="/explore">
                        View live feed
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </motion.article>
              ))}
            </motion.div>

            <p className="text-center text-sm text-foreground/54">
              +380 more verified traders are already live on the platform.
            </p>
          </div>
        </section>

        <section id="for-creators" className="landing-section mt-24">
          <div className={cn(containerClass, "grid gap-8 lg:grid-cols-[1.05fr_0.95fr]")}>
            <div className="space-y-10">
              <SectionHeading
                eyebrow="For creators"
                title="You already have the trades. Now build the income."
                description="Inhumans turns your trading history into a subscription business without a YouTube channel, without a course, and without forcing you to act like a content machine."
              />

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={stagger}
                className="grid gap-5 md:grid-cols-2"
              >
                {[
                  {
                    title: "Your trades are your resume",
                    body: "The moment you connect your broker, your verified track record is live. Past performance auto-populates your profile.",
                  },
                  {
                    title: "Flexible pricing on your terms",
                    body: "Set a free tier, a paid tier, or both. Monthly or annual. Full control over what each plan unlocks.",
                  },
                  {
                    title: "Earn while you trade",
                    body: "Followers pay monthly. You earn recurring income simply by continuing to trade the way you already do.",
                    wide: true,
                  },
                ].map((item) => (
                  <motion.article
                    key={item.title}
                    variants={reveal}
                    className={cn("linen-panel p-6", item.wide && "md:col-span-2")}
                  >
                    <h3 className="text-2xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-base leading-7 text-foreground/62">{item.body}</p>
                  </motion.article>
                ))}
              </motion.div>

              <div className="space-y-4">
                <Button
                  asChild
                  size="lg"
                  className="h-[3.25rem] rounded-full bg-teal-primary px-6 text-base text-white hover:bg-teal-primary-hover"
                >
                  <Link href="/auth/sign-up?role=creator">
                    Become a verified creator
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <p className="max-w-xl text-sm leading-7 text-foreground/50">
                  Inhumans is an educational platform. Creators share trades for transparency and learning, not investment advice. All users acknowledge this at signup.
                </p>
              </div>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={reveal}
              className="linen-panel p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/42">
                    Creator earnings snapshot
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">Monetize trust quietly</h3>
                </div>
                <div className="rounded-full border border-teal-primary/20 bg-teal-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-primary">
                  Passive income
                </div>
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-inhumans-divider bg-white p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/42">
                      Monthly subscription revenue
                    </p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight">INR 1.18L</p>
                  </div>
                  <p className="rounded-full bg-profit/10 px-3 py-1 text-sm font-semibold text-profit">
                    +18% this month
                  </p>
                </div>

                <div className="mt-6 flex items-end gap-2">
                  {[48, 64, 60, 82, 94, 101, 116].map((height) => (
                    <div
                      key={height}
                      className="flex-1 rounded-t-[1rem] bg-gradient-to-t from-teal-primary to-teal-primary/18"
                      style={{ height }}
                    />
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Followers", value: "142" },
                    { label: "Paid plans", value: "89" },
                    { label: "Free tier", value: "53" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-surface-2 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-foreground/42">
                        {item.label}
                      </p>
                      <p className="mt-2 text-lg font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="landing-section mt-24">
          <div className={cn(containerClass, "space-y-10")}>
            <SectionHeading
              eyebrow="Live feed preview"
              title="This is what a live verified feed looks like"
              description="Every card below came directly from a connected broker account. The losses are real too, because real traders lose sometimes and followers deserve that truth."
              align="center"
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="rounded-[2rem] border border-[#17302d]/10 bg-[#17302d] p-5 shadow-[0_30px_80px_-45px_rgba(23,48,45,0.65)] sm:p-7"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                    Verified private feed
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Direct from the broker ledger
                  </h3>
                </div>
                <div className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/72">
                  Timestamped live
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {feedPreview.map((item) => (
                  <motion.div
                    key={item.instrument}
                    variants={reveal}
                    className="flex flex-col gap-4 rounded-[1.6rem] border border-white/10 bg-white/6 p-4 text-white/88 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-white">{item.instrument}</p>
                        <TradeStatusPill mood={item.mood} />
                      </div>
                      <p className="text-sm text-white/62">{item.meta}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-medium text-white/78">{item.time}</p>
                      <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/72">
                        Broker verified
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="pricing" className="landing-section mt-24">
          <div className={cn(containerClass, "space-y-10")}>
            <SectionHeading
              eyebrow="Pricing"
              title="Start free. Upgrade when it makes sense."
              description="Pricing is per trader you follow. Most followers subscribe to two or three creators once they find a style that fits."
              align="center"
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="grid gap-5 lg:grid-cols-[0.95fr_1.1fr_0.95fr]"
            >
              {pricingTiers.map((tier) => (
                <motion.article
                  key={tier.name}
                  variants={reveal}
                  className={cn(
                    "flex flex-col rounded-[2rem] border p-6",
                    tier.highlighted
                      ? "border-teal-primary/20 bg-white shadow-[0_26px_70px_-40px_rgba(13,148,136,0.55)]"
                      : "border-inhumans-divider bg-[#fbfaf8]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground/46">
                        {tier.name}
                      </p>
                      <p className="mt-4 text-4xl font-semibold tracking-tight">{tier.price}</p>
                      <p className="mt-2 text-sm text-foreground/56">{tier.cadence}</p>
                    </div>
                    {tier.highlighted ? (
                      <span className="rounded-full border border-teal-primary/20 bg-teal-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-primary">
                        Most popular
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-5 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-foreground/62">
                    {tier.note}
                  </p>

                  <div className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex gap-3">
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-teal-primary" />
                        <p className="text-sm leading-7 text-foreground/70">{feature}</p>
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    size="lg"
                    variant={tier.highlighted ? "default" : "outline"}
                    className={cn(
                      "mt-8 h-[3.25rem] rounded-full",
                      tier.highlighted
                        ? "bg-teal-primary text-white hover:bg-teal-primary-hover"
                        : "border-inhumans-border bg-white hover:bg-surface-2"
                    )}
                  >
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </motion.article>
              ))}
            </motion.div>

            <p className="text-center text-sm leading-7 text-foreground/50">
              Subscriptions give you access to a verified trader&apos;s activity feed, not investment advice. Inhumans does not guarantee returns.
            </p>
          </div>
        </section>

        <section className="landing-section mt-24">
          <div className={cn(containerClass, "space-y-10")}>
            <SectionHeading
              eyebrow="Testimonials"
              title="What followers and creators are saying"
              description="The trust shift is the point. Once people can see when trades actually happened, everything about the relationship changes."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="grid gap-5 md:grid-cols-[1.2fr_0.8fr_0.8fr]"
            >
              {testimonials.map((item) => (
                <motion.blockquote
                  key={item.author}
                  variants={reveal}
                  className={cn(
                    "rounded-[2rem] border border-inhumans-divider bg-white p-6 shadow-[0_20px_60px_-45px_rgba(38,38,38,0.45)]",
                    item.size === "large" && "md:row-span-2"
                  )}
                >
                  <div className="flex gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-5 text-xl leading-9 text-foreground/78">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <footer className="mt-8">
                    <p className="font-semibold text-foreground">{item.author}</p>
                    <p className="mt-1 text-sm text-foreground/48">{item.detail}</p>
                  </footer>
                </motion.blockquote>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="landing-section mt-24">
          <div className={cn(containerClass, "grid gap-8 lg:grid-cols-[0.9fr_1.1fr]")}>
            <SectionHeading
              eyebrow="FAQ"
              title="Questions we actually get asked"
              description="The rules matter here. We want users to understand exactly what is verified, what is educational, and where the risk still lives."
            />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
              className="space-y-4"
            >
              {faqs.map((faq) => (
                <motion.details
                  key={faq.question}
                  variants={reveal}
                  className="group rounded-[1.5rem] border border-inhumans-divider bg-white px-5 py-4 shadow-[0_18px_40px_-35px_rgba(38,38,38,0.35)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
                    <span className="text-lg font-semibold text-foreground">{faq.question}</span>
                    <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/48 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pt-4 pr-4 text-base leading-7 text-foreground/62">{faq.answer}</p>
                </motion.details>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="landing-section mt-24">
          <div className={cn(containerClass)}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={reveal}
              className="overflow-hidden rounded-[2.4rem] border border-teal-primary/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(243,242,240,0.9))] px-6 py-10 shadow-[0_30px_70px_-45px_rgba(13,148,136,0.45)] sm:px-10"
            >
              <div className="max-w-3xl space-y-5">
                <p className="section-kicker">
                  <ShieldCheck className="size-3.5" />
                  Final CTA
                </p>
                <h2 className="section-title">Trade with proof. Follow with confidence.</h2>
                <p className="section-copy">
                  Join the traders and followers who chose transparency over screenshots.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-[3.25rem] rounded-full bg-teal-primary px-6 text-base text-white hover:bg-teal-primary-hover"
                  >
                    <Link href="/auth/sign-up">Join Inhumans. It&apos;s free.</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-[3.25rem] rounded-full border-inhumans-border bg-white/70 px-6 text-base hover:bg-white"
                  >
                    <Link href="/explore">
                      Explore verified traders
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
                <p className="text-sm leading-7 text-foreground/50">
                  2,400+ verified trades published. Broker-connected. No Telegram nonsense.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="mt-24 border-t border-inhumans-divider bg-white/55 pb-10 pt-12">
        <div className={cn(containerClass, "space-y-10")}>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr_0.9fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full border border-teal-primary/20 bg-teal-primary/10 text-sm font-semibold text-teal-primary">
                  IN
                </div>
                <div>
                  <p className="font-display text-lg font-semibold tracking-tight">Inhumans</p>
                  <p className="text-sm text-foreground/48">Verified trades. Real performance.</p>
                </div>
              </div>
            </div>

            <div>
              <p className="footer-heading">Product</p>
              <div className="footer-links">
                <Link href="/explore">Explore Traders</Link>
                <Link href="#how-it-works">How It Works</Link>
                <Link href="#pricing">Pricing</Link>
                <Link href="/auth/sign-up?role=creator">Creator Program</Link>
              </div>
            </div>

            <div>
              <p className="footer-heading">Company</p>
              <div className="footer-links">
                <Link href="/">About</Link>
                <Link href="/">Blog</Link>
                <Link href="/">Careers</Link>
                <Link href="/">Press</Link>
              </div>
            </div>

            <div>
              <p className="footer-heading">Legal</p>
              <div className="footer-links">
                <Link href="/">Terms of Use</Link>
                <Link href="/">Privacy Policy</Link>
                <Link href="/">Risk Disclaimer</Link>
                <Link href="/">Refund Policy</Link>
              </div>
            </div>

            <div>
              <p className="footer-heading">Follow us</p>
              <div className="footer-links">
                <Link href="/">X</Link>
                <Link href="/">Instagram</Link>
                <Link href="/">YouTube</Link>
                <Link href="/">LinkedIn</Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-inhumans-divider pt-6 text-sm text-foreground/48 lg:flex-row lg:items-center lg:justify-between">
            <p>(c) 2026 Inhumans Technologies Pvt. Ltd. | Mandya, Karnataka, India</p>
            <p className="max-w-3xl leading-7">
              Trading is subject to market risk. Inhumans is an educational platform, not a SEBI-registered investment advisor. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
