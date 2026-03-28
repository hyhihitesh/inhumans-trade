"use client";

import { useMemo, useState } from "react";

interface PrototypePreviewProps {
  slug: string;
}

type Viewport = "desktop" | "mobile";

export function PrototypePreview({ slug }: PrototypePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const src = useMemo(() => `/api/prototypes/${slug}/code`, [slug]);

  return (
    <section className="w-full rounded-inhumans-lg border border-inhumans-border bg-surface/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-mono text-foreground/60">Live Stitch Prototype</p>
        <div className="flex gap-2">
          <button
            onClick={() => setViewport("desktop")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              viewport === "desktop"
                ? "bg-teal-primary text-background"
                : "bg-surface-container text-foreground/75 hover:text-foreground"
            }`}
          >
            Desktop
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              viewport === "mobile"
                ? "bg-teal-primary text-background"
                : "bg-surface-container text-foreground/75 hover:text-foreground"
            }`}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-inhumans-border bg-black/30">
        <iframe
          title={`${slug} preview`}
          src={src}
          className={`w-full bg-white transition-all ${
            viewport === "desktop" ? "h-[760px]" : "mx-auto h-[760px] max-w-[430px]"
          }`}
          sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin"
        />
      </div>
    </section>
  );
}
