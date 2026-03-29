# Inhumans.io - Project Context

## Project Overview
Inhumans.io is a production-focused Next.js 16 application for creator-led verified trading workflows. It uses a **Scandinavian Trust** design system — combining warm minimalism with clarity-first UX to make complex financial data feel simple, calm, and trustworthy.

### Core Stack
- **Framework:** Next.js 16 (App Router)
- **Library:** React 19 + TypeScript
- **Backend/Auth:** Supabase (Postgres, Realtime, Auth)
- **Payments:** Razorpay (Checkout, Verification, Webhooks)
- **Styling:** Tailwind CSS 4 (Warm Minimalism theme)
- **Animation:** Framer Motion (Subtle, purposeful transitions)

### Design System (Scandinavian Trust)
- **Palette:** Warm Off-White (`#F9F8F6`) background, Deep Charcoal (`#262626`) text.
- **Accents:** Muted Teal for trust/actions, Muted Green for profit, Muted Red for loss.
- **Typography:** 'Plus Jakarta Sans' (headings), 'Inter' (body), 'JetBrains Mono' (data).
- **Aesthetic:** 12–16px rounded corners, soft shadows, generous spacing, and progressive disclosure.

- **UI Components (`src/components/*`):** Presentational only. No direct data logic.
- **Route Handlers (`src/app/*`):** Coordinate requests, rendering, and server actions.
- **Domain Contracts (`src/domain/*`):** Interfaces, types, and repository definitions.
- **Repositories (`src/domain/repositories/*`):** Domain logic and data access interfaces.
- **Datasources (`src/domain/datasources/*`):** Concrete implementations (e.g., Supabase, external APIs).

## Building and Running

### Development
- `npm ci`: Install dependencies.
- `npm run dev`: Start the development server.

### Quality and Validation
- `npm run lint`: Run ESLint checks.
- `npm run typecheck`: Run TypeScript type checks (`tsc --noEmit`).
- `npm run verify:migrations`: Validates migration filename ordering and format.
- `npm run build`: Build the application for production.
- `npm run check`: Complete quality gate (migrations + lint + typecheck + build).

### Testing
- `npm run test:unit`: Run Vitest unit tests (usually co-located: `src/**/*.test.ts`).
- `npm run test:e2e`: Run Playwright E2E tests (`e2e/*.spec.ts`).
- `npx playwright install chromium`: Required for fresh E2E setups.

## Database (Supabase) Workflow
The project maintains a "No Drift" policy. All database changes **must** be managed via migrations.

- **Location:** `supabase/migrations/*.sql`
- **Naming:** `YYYYMMDDHHMMSS_description.sql`
- **Policy:** Migrations are additive. Never modify merged migrations; add a new one instead.
- **Enforcement:** `npm run verify:migrations` is part of the CI quality gate.

## Development Conventions

### Coding Standards
- **Layered Access:** Do not call Supabase or external APIs directly in UI components or pages. Use repositories.
- **UI States:** Always explicitly handle `loading`, `empty`, `error`, and `success` states in feature routes.
- **Dismantling Mocks:** When migrating a mock slice to a real backend, keep domain interfaces stable and only replace the repository implementation.

### Agent-Specific Instructions
- **Context Usage:** Use `context7` for code generation, setup, or library/API documentation.
- **Tools:** Use the `supabase` MCP server for authentication and database tasks.
- **Problem Solving:** Use `sequential thinking` for complex logic. If stuck, search for correct patterns using web `context7`.
- **Inquiries vs. Directives:** Treat analysis/advice requests as **Inquiries** (no changes allowed). Implementation requests are **Directives**.

## Key Directories
- `src/app/`: Next.js routes, pages, and API handlers.
- `src/components/`: Presentational UI components.
- `src/domain/`: Core types, interfaces, and repository contracts.
- `src/domain/datasources/`: Supabase and other data source implementations.
- `src/lib/`: Shared utilities, auth, and Supabase client initializations.
- `supabase/migrations/`: The source-of-truth for the database schema.
- `docs/`: Architectural guides, playbooks, and specifications.
