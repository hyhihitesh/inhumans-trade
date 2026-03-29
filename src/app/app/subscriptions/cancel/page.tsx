import Link from "next/link";
import { cancelSubscriptionAction } from "@/app/app/subscriptions/actions";

export default async function SubscriptionCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ subscription?: string }>;
}) {
  const params = await searchParams;
  const subscriptionId = params.subscription ?? "";

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-8 sm:px-6">
      <section className="rounded-xl border border-amber-300 bg-amber-100 p-6">
        <h1 className="text-xl font-semibold text-amber-800">Checkout canceled</h1>
        <p className="mt-2 text-sm text-amber-700">
          You can keep it pending or mark it canceled now.
        </p>
      </section>

      <form action={cancelSubscriptionAction}>
        <input type="hidden" name="subscriptionId" value={subscriptionId} />
        <button className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
          Mark canceled
        </button>
      </form>

      <Link href="/app/subscriptions" className="inline-block text-sm text-primary">
        Back to subscriptions
      </Link>
    </main>
  );
}
