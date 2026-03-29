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
        {children}
      </body>
    </html>
  );
}
