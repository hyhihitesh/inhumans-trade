import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";
import { captureServerEvent } from "@/lib/posthog";

type VerifyPayload = {
  subscriptionId: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function POST(request: Request) {
  let payload: VerifyPayload;
  try {
    payload = (await request.json()) as VerifyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { subscriptionId, razorpay_order_id, razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = payload;
  if (!subscriptionId || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment verification fields" }, { status: 400 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return NextResponse.json({ error: "Razorpay secret is not configured" }, { status: 500 });

  // Verification logic: Razorpay uses Order ID for one-time and Subscription ID for recurring
  const sourceId = razorpay_subscription_id || razorpay_order_id;
  if (!sourceId) return NextResponse.json({ error: "Missing source ID (order or subscription)" }, { status: 400 });

  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${sourceId}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 401 });
  }

  const repo = new SupabaseCreatorPlatformRepository(createAdminClient());
  try {
    await repo.activateSubscriptionWithPayment(subscriptionId, {
      razorpayOrderId: razorpay_order_id ?? null,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // Track event
    await captureServerEvent(subscriptionId, "subscription_activated", {
      method: "razorpay",
      source: razorpay_subscription_id ? "subscription" : "order"
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to activate subscription" }, { status: 500 });
  }
}
