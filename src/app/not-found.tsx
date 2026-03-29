"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background selection:bg-teal-primary/30">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Scandinavian Trust branded indicator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative inline-flex flex-col items-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-teal-primary/5 border border-teal-primary/10 flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-teal-primary animate-pulse" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-teal-primary/60">error 404</p>
        </motion.div>

        <section className="space-y-4">
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
            Lost the signal?
          </h1>
          <p className="text-text-muted leading-relaxed font-medium">
            The path you followed is no longer transmitting. It might have been rebalanced out or the handle has changed.
          </p>
        </section>

        <nav className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-inhumans-md bg-teal-primary text-background font-bold text-sm hover:opacity-90 transition-all group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <Link
            href="/explore"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-inhumans-md bg-surface-1 border border-inhumans-border text-foreground font-bold text-sm hover:bg-surface-2 transition-all"
          >
            Explore Traders
          </Link>
        </nav>

        <footer className="pt-8 border-t border-inhumans-divider">
          <p className="text-[10px] uppercase font-bold tracking-widest text-text-faint">
            inhumans.io &middot; verify everything
          </p>
        </footer>
      </div>
    </main>
  );
}
