import React from "react";
import Link from "next/link";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated?: string;
}

export function LegalLayout({ children, title, lastUpdated }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100">
      {/* Simple Header */}
      <header className="border-b border-slate-200 py-6">
        <div className="max-w-4xl mx-auto px-6 flex justify-between items-baseline">
          <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 hover:text-blue-600 transition-colors">
            Inhumans Trade
          </Link>
          <div className="text-sm text-slate-500 font-medium">Compliance Center</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 lg:py-24">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 lowercase">
            {title}
          </h1>
          {lastUpdated && (
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest italic">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        <div className="prose prose-slate max-w-none prose-h2:text-2xl prose-h2:font-bold prose-h2:tracking-tight prose-h2:mt-12 prose-h3:text-xl prose-h3:font-semibold prose-p:text-lg prose-p:leading-relaxed prose-li:text-lg prose-li:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline">
          {children}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Inhumans Trade</h4>
              <p className="text-slate-500 leading-relaxed text-sm">
                A professional social trading infrastructure for creators and their institutional-grade followers. Registered in India.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-slate-500 hover:text-slate-900">About Us</Link></li>
                <li><Link href="/pricing" className="text-slate-500 hover:text-slate-900">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-slate-500 hover:text-slate-900">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-slate-500 hover:text-slate-900">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} INHUMANS TRADE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
