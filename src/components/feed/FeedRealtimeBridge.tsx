"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function FeedRealtimeBridge() {
  const router = useRouter();
  const [live, setLive] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("feed-trades-live")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
        },
        () => {
          router.refresh();
        }
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
      <span className={`h-2 w-2 rounded-full ${live ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
      {live ? "Realtime connected" : "Realtime connecting"}
    </div>
  );
}
