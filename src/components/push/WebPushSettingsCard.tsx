"use client";

import { useMemo, useState } from "react";

function base64UrlToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function WebPushSettingsCard({
  publicKey,
}: {
  publicKey: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canConfigure = useMemo(() => Boolean(publicKey && typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window), [publicKey]);

  async function register() {
    if (!canConfigure) {
      setMessage("Web push is not available in this browser or environment yet.");
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.register("/push-sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Push permission was not granted.");
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(publicKey),
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      setMessage("Web push is now enabled for this browser.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to enable web push.");
    } finally {
      setLoading(false);
    }
  }

  async function unregister() {
    setLoading(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setMessage("Web push is disabled for this browser.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to disable web push.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold">Web push</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enable browser push for new verified trades, live reminders, billing updates, and course/cohort prompts.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={register}
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          Enable push
        </button>
        <button
          type="button"
          onClick={unregister}
          disabled={loading}
          className="rounded-md border border-border px-4 py-2 text-sm font-semibold disabled:opacity-60"
        >
          Disable push
        </button>
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </section>
  );
}
