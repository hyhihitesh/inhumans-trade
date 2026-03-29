# Inhumans.io - Detailed Roadmap & Technical Spec

## 1. Technical Strategy & MCP Tooling

To ensure "Undeniable" quality and up-to-date best practices, the following MCP servers are integrated into our workflow:

- **Research & Docs (`context7`)**: Used for every technical decision, API integration (Zerodha/Dhan), and framework setup (Next.js 14, Supabase). **No guessing.**
- **UI Components (`shadcn`, `lucide`)**: Used to build the "Premium Dark Mode" interface. We will use `shadcn` for structural components (Modals, Tables, Inputs) and `lucide` for consistent iconography. schadcn mcp avilabe

- **Web Research (`search_web`)**: Used to supplement `context7` for the latest market trends in fintech UI/UX and edge cases in broker webhooks.
- **Database/Auth (`supabase`)**: Use the dedicated Supabase MCP for schema migrations, RLS policy generation, and Auth configuration.

---

## 2. Sprint-Wise Story Spec

### Sprint 1: Foundation (Week 1)

- **Story 1.1: Project Setup**: Next.js 14 initialization + Tailwind configuration with the custom "Inhumans" color palette (`#0a0a09` bg, `#2dd4bf` primary).
- **Story 1.2: Design System**: Implement `globals.css` with `Cabinet Grotesk` (Display) and `Satoshi` (Body). Build the `PnLNumber` component using `JetBrains Mono`.
- **Story 1.3: Auth & Profiles**: Supabase Auth (Google/Email). User can claim `@handle`.

### Sprint 2: The Trust Engine (Week 2)

- **Story 2.1: Zerodha/Dhan OAuth**: Secure connection flow. Tokens stored in Supabase Vault.
- **Story 2.2: Verified Feed**: `/api/trade-webhook` normalization. Realtime P&L updates on the `VerifiedTradeCard`.
- **Story 2.3: Freshness Logic**: Implement Hot (<5m), Warm (5-30m), and Cold (>30m) color-coded timestamps.

### Sprint 3: Monetization & Gating (Week 3)

- **Story 3.1: Razorpay Integration**: Subscription tiers (Free/Pro/Premium).
- **Story 3.2: Blurred History**: Implement the "Paywall with Dignity" blurred preview for past trades.

### Sprint 4: Community & Social (Week 4)

- **Story 4.1: Creator Feed**: Markdown-supported market commentary posts.
- **Story 4.2: Analytics Dashboard**: KPI cards for MRR, Win Rate, and the unique "Copy Rate".

### Sprint 5: Copy-Trading (Week 5)

- **Story 5.1: One-Tap Mirroring**: Follower-side broker connection and "Mirror Order" execution.
- **Story 5.2: Push Notifications**: Web Push alerts for new creator trades.

---

## 3. Immediate Task List (Priority 1)

- [ ] Initialize Next.js 14 in the root directory.
- [ ] Build the Theme/Tokens base in Tailwind.
- [ ] Create the layout shell for the Creator Dashboard.
- [ ] Implement the `VerifiedTradeCard` UI with mock data for verification.
