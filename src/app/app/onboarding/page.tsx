import { saveOnboardingAction } from "@/app/app/actions";
import { requireUserProfile } from "@/lib/auth/session";

const stepTitles: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Identity Setup",
  2: "Public Handle",
  3: "Trading Context",
  4: "Compliance Consent",
  5: "Launch Checklist",
};

function getStepFromParams(stepParam: string | undefined, currentStep: 1 | 2 | 3 | 4 | 5) {
  const parsed = Number(stepParam ?? currentStep);
  if (Number.isNaN(parsed)) return currentStep;
  if (parsed < 1) return 1;
  if (parsed > 5) return 5;
  return parsed as 1 | 2 | 3 | 4 | 5;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { profile, onboarding } = await requireUserProfile("/app/onboarding");

  const step = getStepFromParams(params.step, onboarding.currentStep);
  const payload = onboarding.payload as Record<string, string | boolean | undefined>;
  const progress = (step / 5) * 100;

  return (
    <section className="space-y-5">
      <header className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Creator onboarding</p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">
            Step {step}: {stepTitles[step]}
          </h2>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </header>

      {params.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      <form action={saveOnboardingAction} className="space-y-5 rounded-xl border border-border bg-card p-5">
        <input type="hidden" name="currentStep" value={step} />

        {step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Full name</span>
              <input
                name="name"
                defaultValue={String(payload.name ?? profile.name ?? "")}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Role</span>
              <select
                name="role"
                defaultValue={String(payload.role ?? profile.role)}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="creator">Creator</option>
                <option value="follower">Follower</option>
              </select>
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">Choose public handle</span>
            <input
              name="handle"
              defaultValue={String(payload.handle ?? profile.handle ?? "")}
              placeholder="e.g. sovereign_vault"
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            />
          </label>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Experience level</span>
              <select
                name="experienceLevel"
                defaultValue={String(payload.experienceLevel ?? "")}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Risk band</span>
              <select
                name="riskBand"
                defaultValue={String(payload.riskBand ?? "")}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Select risk profile</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="space-y-6">
            <div className="rounded-inhumans-md border border-warning/20 bg-warning/5 p-4 text-xs leading-relaxed text-text-muted">
              <p className="font-bold text-warning mb-2 uppercase tracking-widest">Risk Disclosure on Derivatives</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>9 out of 10 individual traders in equity Futures and Options Segment, incurred net losses.</li>
                <li>On an average, loss makers registered net loss close to ₹50,000.</li>
                <li>Over and above the net losses incurred, loss makers expended an additional 28% of net trading losses as transaction costs.</li>
                <li>Those making net profits, incurred between 15% to 50% of such profits as transaction cost.</li>
              </ul>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptedDisclosure"
                  defaultChecked={Boolean(payload.acceptedDisclosure)}
                  className="mt-1 h-4 w-4 rounded border-inhumans-border text-teal-primary focus:ring-teal-primary/20"
                  required
                />
                <span className="text-sm font-medium text-text-muted group-hover:text-foreground transition-colors">
                  I understand that Inhumans.io is a technology platform and does not provide investment advice or SEBI-registered advisory services.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="acceptedRisk" 
                  defaultChecked={Boolean(payload.acceptedRisk)} 
                  className="mt-1 h-4 w-4 rounded border-inhumans-border text-teal-primary focus:ring-teal-primary/20"
                  required
                />
                <span className="text-sm font-medium text-text-muted group-hover:text-foreground transition-colors">
                  I acknowledge the high risks associated with trading in derivatives and that past performance of any creator is not indicative of future results.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="acceptedNoGuarantee"
                  defaultChecked={Boolean(payload.acceptedNoGuarantee)}
                  className="mt-1 h-4 w-4 rounded border-inhumans-border text-teal-primary focus:ring-teal-primary/20"
                  required
                />
                <span className="text-sm font-medium text-text-muted group-hover:text-foreground transition-colors">
                  I agree that I am solely responsible for my own trading decisions and any capital loss incurred through mirror execution.
                </span>
              </label>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="space-y-3 text-sm">
            <label className="space-y-1">
              <span className="text-muted-foreground">Default broker</span>
              <select
                name="defaultBroker"
                defaultValue={String(payload.defaultBroker ?? "zerodha")}
                className="w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="zerodha">Zerodha</option>
                <option value="dhan">Dhan</option>
                <option value="angel_one">Angel One</option>
                <option value="fyers">Fyers</option>
              </select>
            </label>
            <div className="rounded-md border border-border bg-background p-3">
              <p>Name: {String(payload.name ?? profile.name ?? "not set")}</p>
              <p>Handle: {String(payload.handle ?? profile.handle ?? "not set")}</p>
              <p>Role: {String(payload.role ?? profile.role)}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            name="intent"
            value="save"
            className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Save progress
          </button>

          {step > 1 ? (
            <button
              type="submit"
              name="intent"
              value="back"
              className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Back
            </button>
          ) : null}

          {step < 5 ? (
            <button type="submit" name="intent" value="continue" className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
              Save and continue
            </button>
          ) : (
            <button type="submit" name="intent" value="complete" className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
              Complete onboarding
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
