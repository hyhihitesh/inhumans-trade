import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SupabaseCreatorPlatformRepository } from "@/domain/datasources/supabase-creator-platform";
import { razorpay, toPaise } from "@/lib/billing/razorpay";

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
    .select("id, name, handle")
    .eq("id", user.id)
    .single();
  if (followerError) return NextResponse.json({ error: followerError.message }, { status: 400 });

  const repo = new SupabaseCreatorPlatformRepository(supabase);
  const tier = await repo.getTierById(body.tierId);
  if (!tier || tier.creatorId !== body.creatorId) {
    return NextResponse.json({ error: "Invalid or inactive tier" }, { status: 400 });
  }

  // 1. Ensure a Razorpay Plan exists for this tier
  // In a real-world scenario, we'd cache this in our DB. 
  // For now, we fetch/create a plan dynamically.
  let planId = (tier as any).razorpay_plan_id;

  if (!planId) {
    try {
      const plan = await razorpay.plans.create({
        period: "monthly",
        interval: 1,
        item: {
          name: `Inhumans: @${tier.creatorId.slice(0, 8)} - ${tier.label}`,
          amount: toPaise(tier.monthlyPriceInr),
          currency: "INR",
          description: `Subscription to verified trade stream of ${tier.creatorId}`
        }
      });
      planId = plan.id;
      // Note: Ideally, we update our DB here to store the planId for future use.
    } catch (error: any) {
      return NextResponse.json({ error: "Failed to create payment plan", details: error.message }, { status: 502 });
    }
  }

  // 2. Create Inhumans Pending Subscription
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

  // 3. Create Razorpay Subscription
  try {
    const rzpSubscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 120, // 10 years of monthly billing
      quantity: 1,
      customer_notify: 1,
      notes: {
        inhumans_subscription_id: subscription.id,
        creator_id: body.creatorId,
        follower_id: user.id,
        tier_id: body.tierId,
      }
    });

    return NextResponse.json({
      mode: "razorpay_subscription",
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpaySubscriptionId: rzpSubscription.id,
      subscriptionId: subscription.id,
      creatorId: body.creatorId,
      tierId: body.tierId,
      profileName: followerProfile.name ?? "Follower",
      profileEmail: user.email ?? "",
      successUrl,
      cancelUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create Razorpay subscription", details: error.message }, { status: 502 });
  }
}

