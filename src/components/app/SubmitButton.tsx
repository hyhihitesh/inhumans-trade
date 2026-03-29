"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
    >
      {pending ? pendingLabel ?? "Please wait..." : label}
    </button>
  );
}
