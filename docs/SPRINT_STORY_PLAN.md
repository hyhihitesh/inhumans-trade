# Inhumans.io End-to-End Build Plan (Sprint Stories)

_Last updated: 2026-03-28_

## Planning Assumptions
- Product source of truth: `Inhumans_io_PRD_v2.md` + `src/stitch_settings_broker_connect/inhumans_io_uiux_spec_v1.md`.
- Current runtime stack in repo: Next.js 16 + React 19 + Supabase.
- Strategy: build in vertical slices, shipping production-quality increments each sprint.
- Rule: no throwaway prototype code in runtime paths; all UI built from reusable components and typed contracts.
(((we have shadcn and supabse mcp, skills utiliz it))) 
## Definition of Done (applies to every story)
- UI matches spec intent (not necessarily pixel-copy) and supports desktop + mobile behavior.
- Type-safe domain contract + repository layer implemented.
- Error/loading/empty states included.
- Accessibility baseline: keyboard access, focus-visible, semantic labels.
- `npm run lint` and `npm run build` pass.
- Story has test coverage (unit/integration/e2e smoke where relevant).

## Latest Technical Best Practices (Context7 + Web, 2026-03-28)
### Next.js 16 + React 19
- Default to Server Components and keep `\"use client\"` only where interactivity is required to reduce bundle size.
- Treat Route Handlers as first-class APIs with explicit authn/authz checks (401/403 paths), and remember `GET` Route Handlers are not cached by default.
- Use App Router caching intentionally (`revalidatePath`, `revalidateTag`) and avoid accidental stale UI behavior.
- Keep secrets and privileged fetches server-side only; never expose service-role keys to client bundles.

### Supabase (Prod)
- Enforce RLS on every multi-tenant table and keep policies simple + indexed for performance.
- Use migrations as the only schema change path; avoid manual dashboard-only edits in production projects.
- Separate repository contracts from datasource implementations so each slice can move from mock -> Supabase independently.
- Add idempotency keys and audit fields for webhook/copy-trade writes to prevent duplicate side effects.

### Testing + CI (Playwright-first E2E)
- Use web-first assertions and locator-based patterns; avoid brittle `waitForTimeout`/selector waits.
- Enable `forbidOnly` in CI and use retries with traces (`trace: 'on-first-retry'`) for debuggable failures.
- Capture E2E artifacts (trace/log/screenshots) on failure and gate merges on lint + typecheck + build + smoke E2E.

### Operational Rules For This Repo
- Every new feature ships with success, loading, empty, and error states.
- Every route has role-aware guard behavior (creator/follower/public).
- Every story includes accessibility checks (keyboard/touch targets/focus visible).
- No runtime feature may bypass the repository boundary and query datasource directly from UI components.

### Source References
- Next.js production checklist and caching/auth guidance: https://nextjs.org/docs/app/guides/production-checklist
- Next.js Route Handlers and App Router docs: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Realtime Postgres changes: https://supabase.com/docs/guides/realtime/postgres-changes
- Supabase with Next.js SSR/auth guidance: https://supabase.com/docs/guides/auth/server-side/nextjs
- Playwright best practices: https://playwright.dev/docs/best-practices
- Playwright trace viewer: https://playwright.dev/docs/trace-viewer

## Sprint 0 (2-3 days): Repo Baseline + Engineering Guardrails
### Goal
Prepare a maintainable production repo before feature velocity.

### Stories
- [ ] **S0.1 Architecture Baseline**
  - [ ] Finalize folder standards: `domain/`, `repositories/`, `components/app/`, route groups.
  - [ ] Enforce data boundary: UI -> service/controller -> repository -> datasource.
  - [ ] Add architecture notes in repo docs.
- [ ] **S0.2 Tooling & Quality Gates**
  - [ ] Add scripts for typecheck/test/e2e placeholders.
  - [ ] Configure CI checks for lint/build/typecheck.
  - [ ] Add pull request checklist template.
- [ ] **S0.3 Design System Hardening**
  - [ ] Lock tokens (colors/typography/spacing/radius/motion) from UIUX spec.
  - [ ] Normalize core shadcn primitives + app variants.
  - [ ] Add shared component usage guidelines.

### Exit Criteria
- Engineering workflow is stable; every next sprint can ship without architecture churn.

---

## Sprint 1 (Week 1): Auth + Onboarding + Broker Connect Foundation
### Goal
Get creator/follower identities and trust foundation live.

### Stories
- [ ] **S1.1 Auth + User Roles**
  - [ ] Supabase auth (Google + email).
  - [ ] Role-aware session model (`creator` / `follower`).
  - [ ] Route protection for app surfaces.
- [ ] **S1.2 Onboarding Flow (5-step)**
  - [ ] Creator onboarding scaffold with progress and resumable state.
  - [ ] Handle/slug reservation flow.
  - [ ] Compliance checkpoints UI (SEBI disclaimer, risk acknowledgment).
- [ ] **S1.3 Broker Connect Screen**
  - [ ] Connection state machine: connected, reconnect-required, disconnected.
  - [ ] Permission matrix UI (explicitly show what is NOT granted).
  - [ ] Last successful sync/trade indicator.

### Exit Criteria
- New creator can sign up, complete onboarding, and reach broker-connect ready state.

---

## Sprint 2 (Week 2): Verified Trade Feed (Core WOW)
### Goal
Ship end-to-end verified trade ingestion and rendering.

### Stories
- [ ] **S2.1 Data Schema + Webhook Contracts**
  - [ ] Finalize `users`, `creator_profiles`, `trades`, `feed_items` schema.
  - [ ] Implement `/api/trade-webhook` with validation + normalization.
  - [ ] Persist audit metadata (broker order ID, source, timestamps).
- [ ] **S2.2 Feed Rendering + Realtime**
  - [ ] Creator dashboard feed route with composer + auto-posted trade cards.
  - [ ] Follower feed route with trade/commentary/system events.
  - [ ] Supabase realtime subscription for INSERT/UPDATE trade events.
- [ ] **S2.3 Shared Trade Components**
  - [ ] VerifiedTradeCard states: `live`, `closed-profit`, `closed-loss`, `pending`.
  - [ ] Variants: `full`, `compact`, `copy-action`.
  - [ ] Freshness indicator: hot/warm/cold.

### Exit Criteria
- Broker event -> webhook -> DB -> realtime UI appears on feed without refresh.

---

## Sprint 3 (Week 3): Follower Conversion Surfaces
### Goal
Enable discovery and paid conversion-ready follower experience.

### Stories
- [ ] **S3.1 Explore + Creator Public Profile**
  - [ ] `/explore` leaderboard/filter/search experience.
  - [ ] `/@[handle]` profile with verified stats + trade history.
  - [ ] Free vs subscribed visibility (blurred preview gating).
- [ ] **S3.2 Subscription Tiers + Billing UX**
  - [ ] Tier management UI (`free/pro/premium`).
  - [ ] Razorpay checkout trigger + success/cancel handling.
  - [ ] Subscription state sync to UI.
- [ ] **S3.3 Notification Center Baseline**
  - [ ] Notification model + center UI.
  - [ ] New trade alerts and subscription events.
use contxt7 mcp for their docs
### Exit Criteria
- Follower can discover creator, view trust signals, and subscribe successfully.

---

## Sprint 4 (Week 4): Copy Trade Flow + Portfolio Tracking
### Goal
Ship safe, high-confidence copy-trade execution UX.

### Stories
- [ ] **S4.1 Copy Trade Interaction**
  - [ ] Desktop slide panel + mobile bottom sheet from trade card CTA.
  - [ ] Quantity/risk controls and confirmation UX.
  - [ ] Clear skipped/failed/success states.
- [ ] **S4.2 Execution Backend (Phase 1)**
  - [ ] `/api/copy-trade` request contract + validation.
  - [ ] Persist `copy_trades` records and statuses.
  - [ ] Retry-safe idempotency key handling.
- [ ] **S4.3 Portfolio Dashboard**
  - [ ] Follower portfolio summary + creator-wise breakdown.
  - [ ] Trade log table with status and P&L.
  - [ ] Alerts preference page.

### Exit Criteria
- User can execute a copy-trade flow end-to-end with tracked outcomes.

---

## Sprint 5 (Week 5): Creator Monetization + Community
### Goal
Complete creator control surfaces and growth loops.

### Stories
- [ ] **S5.1 Creator Analytics Dashboard**
  - [ ] KPIs: subscribers, revenue, copy rate, win rate.
  - [ ] Time-series and breakdown visualizations.
  - [ ] Empty-state and first-trade guidance.
- [ ] **S5.2 Community Feed Features**
  - [ ] Post/commentary publishing + feed rendering.
  - [ ] Tier-gated posts.
  - [ ] Moderate/report controls baseline.
- [ ] **S5.3 Settings Completeness**
  - [ ] Broker settings, profile edit, pricing, payouts.
  - [ ] Session-expired reconnect banners.

### Exit Criteria
- Creator can operate business workflows daily from dashboard.

---

## Sprint 6 (Week 6): Launch Readiness + Hardening
### Goal
Move from “works” to “production ready”.

### Stories
- [ ] **S6.1 Reliability Hardening**
  - [ ] Error boundaries and route-level fallbacks.
  - [ ] API failure retry/backoff strategy.
  - [ ] Structured logging and correlation IDs.
- [ ] **S6.2 Security + Compliance**
  - [ ] RLS for all multi-tenant tables.
  - [ ] Secrets/token handling review.
  - [ ] Legal/disclaimer surfaces finalized.
- [ ] **S6.3 Quality Validation**
  - [ ] E2E smoke suites for creator and follower critical paths.
  - [ ] Responsive + mobile touch target audit.
  - [ ] Performance baseline (LCP/INP/CWV) for core routes.

### Exit Criteria
- Release candidate can onboard beta creators with confidence.

---

## Backlog (Post-Launch / Phase 2)
- [ ] Live room streaming in-platform.
- [ ] Course/cohort hosting.
- [ ] Telegram migration tool.
- [ ] Additional broker integrations (Angel One, Fyers full depth).
- [ ] Native mobile app (React Native/Expo).

## Task Management Template (use for each story)
- [ ] Story owner assigned
- [ ] Technical design note linked
- [ ] Contract/schema approved
- [ ] UI states complete (success/error/empty/loading)
- [ ] Tests added and passing
- [ ] QA checklist complete
- [ ] Docs/changelog updated

## Immediate Next 10 Tasks (Start Here)
- [ ] Create Supabase schema migrations for `users`, `creator_profiles`, `trades`, `subscriptions`, `copy_trades`, `community_posts`.
- [ ] Implement auth + role guards on `/app` and `/m` route groups.
- [ ] Build onboarding state model and persistence.
- [ ] Implement broker connection status and permissions UI.
- [ ] Build `POST /api/trade-webhook` validation + insert path.
- [ ] Build feed repository (real data) and remove feed mocks.
- [ ] Add realtime subscription for trade insert/update.
- [ ] Implement VerifiedTradeCard full state matrix + variants.
- [ ] Build follower copy-trade sheet/panel with risk controls.
- [ ] Add CI workflow for lint/build/typecheck.
