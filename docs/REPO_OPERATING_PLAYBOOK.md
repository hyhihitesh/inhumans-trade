# Repo Operating Playbook

Use this as the default workflow for clean, maintainable, production-safe delivery.

## 1) Branch + PR discipline
- Create one feature branch per slice/task.
- Keep PRs small and scoped (UI slice, API slice, migration slice).
- Rebase on latest `main` before requesting review.
- Do not mix refactor + feature + migration in one PR unless tightly coupled.

## 2) Quality gate before every push
- Run:
  - `npm run verify:migrations`
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
- CI must pass before merge.

## 3) Supabase sync rules (anti-drift)
- Any DB change must be committed as SQL migration under `supabase/migrations`.
- Never rely on dashboard-only schema/function edits.
- Migration filenames must follow:
  - `YYYYMMDDHHMMSS_description.sql`
- Keep migrations additive and reversible where possible.
- If a function is changed in production, mirror the same change in repo migration immediately.

## 4) Conflict prevention
- One owner per slice in active sprint.
- If two PRs touch the same migration/function/table, merge the earlier PR first, then rebase and regenerate the later migration.
- Avoid editing old migration files after merge; add a new migration instead.

## 5) Production-readiness coding rules
- Respect architecture boundary: `UI -> repository -> datasource`.
- Keep UI components presentational; put data logic in repositories/controllers.
- Explicitly handle loading/empty/error/partial states.
- No hidden mock fallbacks in slices already migrated to real backend.

## 6) Release hygiene
- Confirm env contracts are documented in `.env.example`.
- Verify key user journeys on desktop and mobile before release.
- Keep docs updated when contracts/routes/DB behavior change.

