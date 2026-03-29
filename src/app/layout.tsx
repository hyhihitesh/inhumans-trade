import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const displayFont = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
});

export const metadata: Metadata = {
  title: "Inhumans | Verified trades, real performance",
  description:
    "Follow traders who prove it with every trade. Inhumans brings broker-verified positions, real-time performance, and trust-first discovery to India's trading community.",
  metadataBase: new URL("https://inhumans.io"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        bodyFont.variable,
        displayFont.variable
      )}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-teal-primary/30">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        
        <footer className="w-full border-t border-inhumans-divider bg-white/50 py-12 px-4 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-teal-primary/10 border border-teal-primary/20 flex items-center justify-center">
                    <div className="h-3 w-3 rounded-full bg-teal-primary" />
                  </div>
                  <span className="font-display text-lg font-bold tracking-tight">Inhumans</span>
                </div>
                <p className="text-sm text-text-muted max-w-sm leading-relaxed">
                  The most trusted place for retail traders to discover and follow broker-verified performance.
                </p>
              </div>

              <div className="rounded-inhumans-lg border border-inhumans-border bg-surface-2/50 p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-faint mb-4">Risk Disclosure</p>
                <p className="text-[11px] leading-relaxed text-text-muted">
                  Trading in equity, derivatives, and other instruments involves high risks of capital loss. 
                  9 out of 10 individual traders in equity F&O incur net losses. 
                  Inhumans.io is a technology platform and does not provide investment advice. 
                  All trade data shown is for informational purposes only and is pulled directly from connected broker accounts.
                </p>
                <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-inhumans-divider">
                  <span className="text-[10px] font-bold text-text-faint hover:text-foreground cursor-pointer transition-colors uppercase">Terms</span>
                  <span className="text-[10px] font-bold text-text-faint hover:text-foreground cursor-pointer transition-colors uppercase">Privacy</span>
                  <span className="text-[10px] font-bold text-text-faint hover:text-foreground cursor-pointer transition-colors uppercase">Disclaimer</span>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-inhumans-divider flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-[10px] font-medium text-text-faint">
                &copy; {new Date().getFullYear()} Inhumans.io. Not a SEBI registered investment advisor.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <p className="text-[10px] font-medium text-text-faint">
                  Support: <span className="font-bold text-teal-primary hover:underline cursor-pointer">ops@inhumans.io</span>
                </p>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-teal-primary/5 border border-teal-primary/10">
                  <div className="h-1 w-1 rounded-full bg-teal-primary animate-pulse" />
                  <span className="text-[9px] font-bold text-teal-primary uppercase tracking-tighter">System Normal</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
