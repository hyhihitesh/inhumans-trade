export default function MobileAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-background px-3 py-4 text-foreground">{children}</div>;
}
