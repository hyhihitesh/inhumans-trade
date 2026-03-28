"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Zap, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { VerifiedTradeCard } from "@/components/ui/VerifiedTradeCard";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden min-h-screen">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,#2dd4bf0a_0%,transparent_100%)]" />
      
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-inhumans-border bg-background/80 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-inhumans-md bg-teal-primary flex items-center justify-center">
              <span className="text-background font-bold text-lg">I</span>
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight">INHUMANS.IO</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/60">
            <Link href="#" className="hover:text-teal-primary transition-colors">Creators</Link>
            <Link href="#" className="hover:text-teal-primary transition-colors">The Trust Engine</Link>
            <Link href="#" className="hover:text-teal-primary transition-colors">Pricing</Link>
          </div>
          <button className="bg-foreground text-background px-5 py-2 rounded-inhumans-md text-sm font-bold hover:scale-105 transition-transform active:scale-95">
            Get Started
          </button>
        </nav>
      </header>

      <main className="pt-32 pb-24 px-6 flex flex-col items-center">
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-primary/20 bg-teal-primary/5 text-teal-primary text-xs font-bold mb-8 uppercase tracking-widest"
        >
          <ShieldCheck size={14} />
          SEBI Compliant Logic
        </motion.div>

        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl text-5xl md:text-7xl font-display font-extrabold text-center leading-[1.1] md:leading-[1.05] tracking-tight mb-8"
        >
          The Trust Layer for <br />
          <span className="text-teal-primary">Trading Creators.</span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl text-lg md:text-xl text-center text-foreground/60 leading-relaxed mb-12"
        >
          Stop posting screenshots. Connect your broker. Share verified live feeds. 
          Build undeniable trust with your community in real-time.
        </motion.p>

        {/* Hero Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-24"
        >
          <button className="h-14 px-8 bg-teal-primary text-background rounded-inhumans-lg font-bold text-lg flex items-center justify-center gap-2 hover:shadow-[0_0_30px_-5px_#2dd4bf80] transition-all">
            Connect Broker <ArrowRight size={20} />
          </button>
          <button className="h-14 px-8 border border-inhumans-border bg-surface-1 rounded-inhumans-lg font-bold text-lg hover:bg-surface-2 transition-colors">
            Explore Feed
          </button>
        </motion.div>

        {/* Preview Section - Modular Trade Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-lg p-1 rounded-inhumans-lg bg-gradient-to-b from-teal-primary/20 to-transparent"
        >
          <VerifiedTradeCard 
            instrument="NIFTY 22400 CE"
            side="BUY"
            entryPrice={98.40}
            quantity={1800}
            currentPnL={18420}
            brokerName="Zerodha"
            freshness="hot"
            lastUpdate="2m ago"
          />
        </motion.div>

        {/* Feature Grid */}
        <div className="max-w-7xl mx-auto mt-48 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="text-amber-500" />,
              title: "Instant Verification",
              desc: "Direct broker integration via OAuth. No manual uploads. No photoshop. Just data."
            },
            {
              icon: <TrendingUp className="text-teal-primary" />,
              title: "P&L Authenticity",
              desc: "Every digit you see is a verified ledger movement from the broker postback."
            },
            {
              icon: <Users className="text-blue-500" />,
              title: "One-Tap Mirroring",
              desc: "Optionally allow your subscribers to mirror your orders with calculated risk."
            }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="p-8 rounded-inhumans-lg bg-surface-1 border border-inhumans-border hover:border-teal-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-inhumans-md bg-surface-2 flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-extrabold mb-3">{feature.title}</h3>
              <p className="text-foreground/60 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="border-t border-inhumans-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
            <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
              <span className="text-background font-bold text-xs">I</span>
            </div>
            <span className="font-display font-extrabold tracking-tight">INHUMANS.IO</span>
          </div>
          <p className="text-xs text-foreground/40 font-medium">
            © 2026 INHUMANS.IO • Verified Trading Infrastructure
          </p>
        </div>
      </footer>
    </div>
  );
}
