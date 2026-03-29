"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type Props = {
  creatorId: string;
  tierId: string;
  label?: string;
};

async function ensureCheckoutScript() {
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout SDK"));
    document.body.appendChild(script);
  });
}

export function RazorpaySubscribeButton({ creatorId, tierId, label = "Start checkout" }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      const intentResponse = await fetch("/api/billing/razorpay/checkout-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, tierId }),
      });

      const intentPayload = (await intentResponse.json()) as
        | {
            mode: "sandbox_stub";
            successUrl: string;
          }
        | {
            mode: "razorpay_subscription";
            keyId: string;
            razorpaySubscriptionId: string;
            subscriptionId: string;
            creatorId: string;
            tierId: string;
            profileName: string;
            profileEmail: string;
            successUrl: string;
            cancelUrl: string;
          }
        | { error: string };

      if (!intentResponse.ok || "error" in intentPayload) {
        throw new Error(("error" in intentPayload ? intentPayload.error : "Unable to start checkout"));
      }

      if (intentPayload.mode === "sandbox_stub") {
        window.location.href = intentPayload.successUrl;
        return;
      }

      await ensureCheckoutScript();
      if (!window.Razorpay) throw new Error("Razorpay SDK unavailable");

      const checkout = new window.Razorpay({
        key: intentPayload.keyId,
        subscription_id: intentPayload.razorpaySubscriptionId,
        name: "Inhumans.io",
        description: "Verified Creator Subscription",
        prefill: {
          name: intentPayload.profileName,
          email: intentPayload.profileEmail,
        },
        theme: {
          color: "#0D9488", // Teal Primary
        },
        handler: async (response: Record<string, string>) => {
          const verifyResponse = await fetch("/api/billing/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId: intentPayload.subscriptionId,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (!verifyResponse.ok) {
            const payload = (await verifyResponse.json().catch(() => ({}))) as { error?: string };
            throw new Error(payload.error ?? "Payment verification failed");
          }
          window.location.href = `${intentPayload.successUrl}?subscription=${encodeURIComponent(intentPayload.subscriptionId)}`;
        },
        modal: {
          ondismiss: () => {
            window.location.href = `${intentPayload.cancelUrl}?subscription=${encodeURIComponent(intentPayload.subscriptionId)}`;
          },
        },
      });

      checkout.open();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-inhumans-md bg-teal-primary text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-teal-primary/10 transition-all hover:bg-teal-primary-hover active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? (
          <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        ) : (
          label
        )}
      </button>
      {error ? (
        <div className="p-3 rounded-inhumans-md bg-loss/5 border border-loss/10">
          <p className="text-[10px] font-bold text-loss text-center leading-tight">{error}</p>
        </div>
      ) : null}
    </div>
  );
}
