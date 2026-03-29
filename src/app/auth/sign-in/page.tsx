import Link from "next/link";
import { signInAction, signInWithGoogleAction } from "@/app/auth/actions";
import { SubmitButton } from "@/components/app/SubmitButton";

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const error = params.error;
  const next = params.next ?? "/app";

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground mt-1">Access creator/follower dashboard.</p>
        </div>

        {error && <p className="text-sm text-destructive">{decodeURIComponent(error)}</p>}

        <form action={signInAction} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input name="password" type="password" required placeholder="Password" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <SubmitButton label="Sign in" pendingLabel="Signing in..." />
        </form>

        <form action={signInWithGoogleAction}>
          <button type="submit" className="w-full rounded-md border border-border px-4 py-2.5 text-sm font-medium">
            Continue with Google
          </button>
        </form>

        <p className="text-sm text-muted-foreground">
          New here? <Link href="/auth/sign-up" className="text-primary">Create account</Link>
        </p>
      </div>
    </main>
  );
}
