import Link from "next/link";
import { activateSubscriptionAction } from "@/app/(protected)/app/subscriptions/actions";

export default async function SubscriptionSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription?: string }>;
}) {
  const params = await searchParams;
  const subscriptionId = params.subscription ?? "";

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8 sm:px-6">
      <section className="rounded-xl border border-emerald-300 bg-emerald-100 p-6">
        <h1 className="text-xl font-semibold text-emerald-800">Payment success</h1>
        <p className="mt-2 text-sm text-emerald-700">
          Complete activation to sync your subscription state in app.
        </p>
      </section>

      <form action={activateSubscriptionAction}>
        <input type="hidden" name="subscriptionId" value={subscriptionId} />
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          Activate subscription
        </button>
      </form>

      <Link href="/app/subscriptions" className="inline-block text-sm text-primary">
        Back to subscriptions
      </Link>
    </main>
  );
}
