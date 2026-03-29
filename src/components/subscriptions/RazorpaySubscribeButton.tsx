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
            mode: "razorpay";
            keyId: string;
            orderId: string;
            amount: number;
            currency: string;
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
        amount: intentPayload.amount,
        currency: intentPayload.currency,
        name: "Inhumans.io",
        description: "Creator subscription",
        order_id: intentPayload.orderId,
        prefill: {
          name: intentPayload.profileName,
          email: intentPayload.profileEmail,
        },
        notes: {
          creator_id: intentPayload.creatorId,
          tier_id: intentPayload.tierId,
          subscription_id: intentPayload.subscriptionId,
        },
        handler: async (response: Record<string, string>) => {
          const verifyResponse = await fetch("/api/billing/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriptionId: intentPayload.subscriptionId,
              razorpay_order_id: response.razorpay_order_id,
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
    <div className="space-y-2">
      <button
        type="button"
        onClick={startCheckout}
        disabled={loading}
        className="w-full rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "Starting..." : label}
      </button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
