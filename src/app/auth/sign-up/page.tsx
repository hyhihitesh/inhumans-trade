import Link from "next/link";
import { signUpAction } from "@/app/auth/actions";
import { SubmitButton } from "@/components/app/SubmitButton";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const role = params.role === "creator" ? "creator" : "follower";

  return (
    <main className="min-h-screen grid place-items-center px-6 bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start as creator or follower.</p>
        </div>

        {error && <p className="text-sm text-destructive">{decodeURIComponent(error)}</p>}

        <form action={signUpAction} className="space-y-3">
          <input name="name" type="text" placeholder="Full name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input name="password" type="password" required placeholder="Password" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <select name="role" defaultValue={role} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="creator">Creator</option>
            <option value="follower">Follower</option>
          </select>
          <SubmitButton label="Create account" pendingLabel="Creating..." />
        </form>

        <p className="text-sm text-muted-foreground">
          Already have an account? <Link href="/auth/sign-in" className="text-primary">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
