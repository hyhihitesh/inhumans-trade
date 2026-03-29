# Implementation Plan: Sprint 6 - Launch Readiness & Hardening

This plan outlines the final hardening of the Inhumans.io platform to ensure production reliability, database security, and overall quality validation before onboarding beta creators.

## Objective
Move the platform from "feature-complete" to "production-ready" by addressing reliability gaps, auditing security policies, and validating the end-to-end user experience across devices.

## 1. Reliability Hardening (S6.1)
**Goal:** Ensure the app fails gracefully and remains resilient to network/API instability.

- [x] **Global Error Boundaries:**
  - [x] Create `src/components/ui/ErrorBoundary.tsx` using React 19 standards.
  - [x] Implement route-level `error.tsx` and `loading.tsx` in `src/app/app/` and `src/app/explore/`.
- [x] **API Resilience:**
  - [x] Implement a `withRetry` utility in `src/lib/api-utils.ts` to wrap flaky repository calls.
  - [x] Add request correlation IDs to headers for better traceability in logs.
- [x] **Structured Logging:**
  - [x] Introduce a lightweight `src/lib/logger.ts` for consistent server-side and client-side logging.

## 2. Security & Compliance Audit (S6.2)
**Goal:** Enforce strict multi-tenancy and fulfill regulatory trust requirements.

- [x] **Database RLS Audit:**
  - [x] Finalize Row Level Security (RLS) for all tables: `users`, `trades`, `copy_trades`, `subscriptions`, `courses`, and `live_sessions`.
  - [x] Create a new migration `supabase/migrations/20260330000000_sprint6_security_rls_final.sql`.
- [x] **Secrets Management:**
  - [x] Review all environment variables in `src/lib/supabase/env.ts` and ensure no service-role keys are exposed to the client.
- [x] **Legal & Trust Surfaces:**
  - [x] Finalize the SEBI-mandated disclaimers in the onboarding flow (`src/app/app/onboarding/`) and creator profiles.
  - [x] Add a "Trust & Safety" summary to the landing page and footer.


## 3. Quality Validation (S6.3)
**Goal:** Confirm critical paths are bug-free and performant.

- **Expanded E2E Smoke Suites:**
  - Implement `e2e/creator-dashboard.spec.ts` covering trade verification and analytics.
  - Implement `e2e/onboarding.spec.ts` to ensure the 5-step flow is robust.
- **Mobile & Performance Audit:**
  - Audit touch targets and responsive layouts in `src/app/m/`.
  - Run a Lighthouse/Web Vitals baseline and address any LCP or INP regressions.

## Implementation Phases

### Phase 1: Reliability Foundation
- `ErrorBoundary` component + Route-level error/loading states.
- `withRetry` repository wrapper.

### Phase 2: Security Hardening
- RLS migration and policy verification.
- Environment variable and secrets audit.

### Phase 3: Final Quality Gate
- E2E test suite expansion.
- Responsive design and performance optimizations.

## Verification
- [x] `npm run check` (Lint + Typecheck + Migrations + Build).
- [x] `npm run test:e2e` (Smoke suite passing; Auth-protected routes require test-mode session).
- [x] Manual audit of RLS policies using Supabase local testing (Verified via migration-check).
