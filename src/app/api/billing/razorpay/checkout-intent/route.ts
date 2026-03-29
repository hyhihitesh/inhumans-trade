import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";

type Body = { creatorId: string; tierId: string };

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.creatorId || !body.tierId) {
    return NextResponse.json({ error: "Missing creatorId or tierId" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: followerProfile, error: followerError } = await supabase
    .from("profiles")
    .select("id, name")
    .eq("id", user.id)
    .single();
  if (followerError) return NextResponse.json({ error: followerError.message }, { status: 400 });

  const repo = new SupabaseCreatorPlatformRepository(supabase);
  const tier = await repo.getTierById(body.tierId);
  if (!tier || tier.creatorId !== body.creatorId) {
    return NextResponse.json({ error: "Invalid or inactive tier" }, { status: 400 });
  }

  const subscription = await repo.createPendingSubscription(body.creatorId, user.id, body.tierId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const successUrl = `${appUrl}/app/subscriptions/success`;
  const cancelUrl = `${appUrl}/app/subscriptions/cancel`;

  if (tier.monthlyPriceInr === 0) {
    await repo.activateSubscriptionWithPayment(subscription.id, {
      razorpayOrderId: null,
      razorpayPaymentId: null,
      razorpaySignature: null,
    });
    return NextResponse.json({
      mode: "sandbox_stub",
      successUrl: `${successUrl}?subscription=${subscription.id}`,
    });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json(
      {
        error: "Paid checkout is unavailable. Razorpay is not configured on this environment.",
      },
      { status: 503 }
    );
  }

  const orderResp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: tier.monthlyPriceInr * 100,
      currency: "INR",
      receipt: `sub_${subscription.id.slice(0, 16)}`,
      notes: {
        subscription_id: subscription.id,
        creator_id: body.creatorId,
        follower_id: user.id,
        tier_id: body.tierId,
      },
    }),
  });

  if (!orderResp.ok) {
    const details = await orderResp.text();
    return NextResponse.json({ error: "Failed to create Razorpay order", details }, { status: 502 });
  }

  const order = (await orderResp.json()) as { id: string };

  return NextResponse.json({
    mode: "razorpay",
    keyId,
    orderId: order.id,
    amount: tier.monthlyPriceInr * 100,
    currency: "INR",
    subscriptionId: subscription.id,
    creatorId: body.creatorId,
    tierId: body.tierId,
    profileName: followerProfile.name ?? "Follower",
    profileEmail: user.email ?? "",
    successUrl,
    cancelUrl,
  });
}

