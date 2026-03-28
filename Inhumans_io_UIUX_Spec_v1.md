# Inhumans.io — UX/UI Design Specification

### Product Design Document · Version 1.0 · March 2026

---

> **Design Philosophy:** Inhumans.io is not a social network with a trading skin. It is a **trust infrastructure** for trading creators. Every UX decision must answer one question: *does this make the creator more credible and the follower more confident?* If it doesn't, it doesn't ship.

---

## Table of Contents

1. [Art Direction & Brand Tone](#1-art-direction--brand-tone)
2. [Design System Tokens](#2-design-system-tokens)
3. [Information Architecture](#3-information-architecture)
4. [Creator Side — All Screens & Flows](#4-creator-side--all-screens--flows)
5. [Follower Side — All Screens & Flows](#5-follower-side--all-screens--flows)
6. [Shared Components Library](#6-shared-components-library)
7. [Motion & Interaction Principles](#7-motion--interaction-principles)
8. [Mobile-First Rules](#8-mobile-first-rules)
9. [Unique UX Decisions](#9-unique-ux-decisions-that-make-this-not-generic)
10. [Screen Wireframes (ASCII)](#10-screen-wireframes-ascii)

---

## 1. Art Direction & Brand Tone

### The One-Word Brand Feeling

**Undeniable.**
Not "transparent." Not "verified." Undeniable. A creator on Inhumans.io doesn't just claim to trade — their broker proves it, live, in front of everyone. That's undeniable. The product must feel like that word in every pixel.

### Aesthetic Reference Points

| Reference | What We Take |
|---|---|
| **Linear.app** | Precision engineering, dark-first, every pixel intentional |
| **Zerodha Kite** | Data density done right, traders are power users |
| **Robinhood (early)** | Making finance feel accessible, not intimidating |
| **Stripe Dashboard** | Trust through design quality — if it looks this good, it must be legit |

### What We Are NOT

- Not crypto-bro neon (no electric green, no purple gradients)
- Not a social media feed clone (no likes-first design)
- Not a learning platform (no course-catalog UX)
- Not a Bloomberg terminal (not intimidating to newcomers)

### Tone

- **Dark mode is default** — traders work in low-light environments, night sessions, early mornings
- **Dense but not crowded** — every pixel earns its space, but breathing room exists where it matters
- **Minimal color** — the only colors that appear are those that mean something: green = profit, red = loss, teal = verified/primary action
- **Monochrome base** — surfaces are near-black charcoals, text is warm off-white, one teal accent

### Color Palette (Custom — Not Default Nexus)

```
Background:       #0a0a09   (near-black, warm undertone)
Surface:          #111110   (cards, panels)
Surface-2:        #161614   (nested surfaces)
Surface-offset:   #1c1c1a   (hover states, inputs)
Border:           #252523   (subtle separation)
Divider:          #1e1e1c

Text:             #e8e7e4   (primary — warm off-white)
Text-muted:       #737270   (secondary)
Text-faint:       #3a3937   (tertiary, placeholders)

Primary (Teal):   #2dd4bf   (CTAs, verified badges, links)
Primary-hover:    #14b8a6
Primary-dim:      color-mix(in oklch, #2dd4bf 12%, #111110)

Profit (Green):   #22c55e   (positive P&L, BUY signals)
Loss (Red):       #ef4444   (negative P&L, SELL signals)
Warning:          #f59e0b   (pending, processing)

Verified Badge:   linear-gradient(135deg, #2dd4bf, #0ea5e9)
```

### Typography

```
Display Font:  'Cabinet Grotesk' (Fontshare) — weight 800
               Used for: hero numbers, P&L figures, page titles
               Feel: editorial precision, not corporate

Body Font:     'Satoshi' (Fontshare) — weight 400/500/600
               Used for: all body copy, labels, UI elements
               Feel: clean, modern, legible at 12px

Mono Font:     'JetBrains Mono' (Google) — weight 400/600
               Used for: prices, quantities, trade data, API keys
               Feel: terminal precision — numbers in mono = credibility
```

### Spacing Rhythm

- Base: 4px
- Compact mode (data-dense): 4/8/12/16
- Comfortable mode (reading/discovery): 8/16/24/32/48
- Creator profiles use comfortable. Trade data uses compact.

---

## 2. Design System Tokens

### Surface Hierarchy (Dark Mode Default)

```
Layer 0 — Page background    #0a0a09  ← where the app "lives"
Layer 1 — Cards/panels       #111110  ← content containers
Layer 2 — Nested surfaces    #161614  ← inputs, inner cards
Layer 3 — Hover/active       #1c1c1a  ← interactive states
Layer 4 — Borders             #252523  ← only 1px, alpha-blended
```

### Type Scale (Web App — Compact)

```
--text-xs:    12px  →  Timestamps, status chips, micro labels
--text-sm:    14px  →  Buttons, nav links, form labels
--text-base:  16px  →  Body copy, descriptions, card text
--text-lg:    20px  →  Section headings, card titles
--text-xl:    28px  →  Page titles (max for app UI)
--text-data:  24px mono  →  P&L numbers, trade prices (Cabinet Grotesk 800)
--text-hero-data: 40px mono  →  Creator's total P&L on profile header
```

### Semantic Color Usage

```
Green (#22c55e):  BUY trades, positive P&L, profit metrics, active/live status
Red (#ef4444):    SELL trades, negative P&L, loss metrics, error states
Teal (#2dd4bf):   Primary CTAs, verified badges, links, selected states
Amber (#f59e0b):  Pending orders, processing, warning states
White-dim:        Inactive, secondary, read-only data
```

### Radius System

```
--radius-sm:   4px   →  Badges, chips, tiny elements
--radius-md:   6px   →  Inputs, buttons
--radius-lg:   10px  →  Cards, panels
--radius-xl:   14px  →  Modal sheets, overlays
--radius-full: 999px →  Avatars, pill badges
```

---

## 3. Information Architecture

### Creator-Side IA

```
inhumans.io/dashboard
├── /feed           ← Live trade feed + post composer
├── /analytics      ← Subscriber growth, revenue, trade performance
├── /community      ← Posts, comments, Q&A from subscribers
├── /live           ← Start a live room session
├── /courses        ← Upload and manage course content
├── /subscribers    ← Manage subscriber tiers, view who's subscribed
└── /settings
    ├── /broker     ← Connect/disconnect broker, API status
    ├── /profile    ← Edit public profile
    ├── /pricing    ← Manage subscription tiers
    └── /payouts    ← Razorpay/UPI payout settings
```

### Follower-Side IA

```
inhumans.io/explore         ← Discover verified creators
inhumans.io/@[handle]       ← Creator's public profile page
inhumans.io/feed            ← Followed creators' trades (after login)
inhumans.io/portfolio       ← My copy trades, P&L tracking
inhumans.io/settings
├── /subscriptions          ← Manage active subscriptions
├── /broker                 ← Connect broker for copy trading
└── /alerts                 ← Push notification preferences
```

### Public Pages (No Login Required)

```
inhumans.io/@[handle]       ← Partial view: profile + recent trades (blurred for paid)
inhumans.io/explore         ← Leaderboard of verified creators
inhumans.io/                ← Landing page (not covered in this doc)
```

---

## 4. Creator Side — All Screens & Flows

---

### 4.1 Creator Dashboard — Main Feed

**Purpose:** The creator's command centre. The first thing they see every session.

**Layout:** Left sidebar (240px, collapsed to icons at <1024px) + Main content area + Right panel (320px, collapsible)

**Left Sidebar — Creator Nav:**

```
┌─────────────────┐
│  [Logo] Inhumans│
├─────────────────┤
│  ⚡ Feed         │  ← Active
│  📊 Analytics   │
│  💬 Community   │
│  🎥 Live Room   │
│  📚 Courses     │
│  👥 Subscribers │
├─────────────────┤
│  [avatar]       │
│  @handle        │
│  ○ Broker Live  │  ← Green dot if broker connected
└─────────────────┘
```

**Main Content — Feed Composer + Trade Timeline:**

The top of the feed is a **compact composer row** — not a full text editor. It has:

- A "Write a market thought..." input (expands on click)
- A "📊 Share a chart" button (opens TradingView chart embed picker)
- A "🔴 Go Live" button

Below the composer is the **Verified Trade Timeline** — a chronological feed of:

1. **Auto-posted broker trades** (appears automatically on order execution)
2. **Creator's manual posts** (market commentary, chart analysis)

**The Verified Trade Card** (the core component):

```
[BUY]  NIFTY 24500 CE  ·  ₹230.50  ·  50 qty
       Entry: ₹230.50  ·  Current: ₹247.80
       P&L: +₹865  (+7.5%)  ·  [live pulsing dot]
       ─────────────────────────────────────
       [Broker: Zerodha ✓]  12 copied  ·  3m ago
```

**Right Panel — "Your Stats Today":**
Collapsed by default on load, expandable. Shows:

- Today's P&L (big number, green/red)
- Trades placed today
- New subscribers today
- Live viewers (if streaming)

**UX Decisions for this screen:**

- The broker connection status must be visible at ALL times (sidebar dot + top bar chip). If disconnected, a persistent yellow banner appears.
- Trade cards auto-appear at the TOP of the feed when a new order executes (WebSocket push). A subtle "new trade" animation slides it in from the top.
- The creator does NOT have to do anything — trades post themselves. The feed is a passive proof, not active effort.
- Manual posts go through the composer. They appear differently than trade cards — slightly different card treatment so followers can distinguish between "trade" and "commentary."

---

### 4.2 Analytics Dashboard

**Purpose:** Give creators a clear picture of what's working — not vanity metrics.

**Layout:** Three-zone bento grid. Top row = KPIs. Middle = charts. Bottom = tables.

**Top KPI Row (4 cards):**

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Subscribers  │  Monthly Rev │  Copy Rate   │  Win Rate    │
│  1,240  ↑12% │  ₹62,400     │  34%         │  67%         │
│  +48 this wk │  ↑8% MoM     │  of trades   │  last 30d    │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Middle Charts Row:**

- Left (60%): Subscriber growth over time (line chart, 90d default, toggle to 30d/1y)
- Right (40%): Revenue breakdown donut (Free/Pro/Premium breakdown)

**Bottom Tables:**

- Tab 1: "Top Performing Trades" — table of all trades sorted by P&L%
- Tab 2: "Subscriber Activity" — new vs churned, tier breakdown
- Tab 3: "Copy Trade Log" — who copied what, when, at what price

**UX Decisions:**

- All numbers use monospace font (JetBrains Mono) — makes data feel precise
- P&L figures are ALWAYS colour-coded (green/red), never neutral grey
- The "Copy Rate" metric is unique to Inhumans — it shows what % of followers copied a trade. This becomes a creator's biggest flex. High copy rate = high trust.
- Charts default to 30-day view. The "all time" view is hidden behind a click to prevent discouragement for new creators.
- Empty states are designed: "No trades yet this month" shows a calendar illustration with a subtle "Place your first trade to see it here" message.

---

### 4.3 Broker Connect Screen (Settings → Broker)

**Purpose:** The trust foundation. Must feel secure, clear about permissions, and easy to troubleshoot.

**Layout:** Single-column, content-narrow (max 640px), centred.

**Sections:**

1. **Connection Status Card** — big, clear, green/yellow/red indicator
2. **Connected Broker Details** — broker name, connected date, last sync time, API key (masked)
3. **Permissions Granted** — explicit list of what access was granted:

   ```
   ✓  Read order history          (required)
   ✓  Stream order events         (required)
   ✓  Read positions & holdings   (required)
   ✗  Place orders on your behalf (NOT granted)
   ✗  Withdraw funds              (NOT granted)
   ```

4. **Reconnect / Disconnect** — ghost button for disconnect, hidden behind confirmation

**UX Decisions:**

- The permissions list is the most important element on this page. Traders are paranoid about API access. Showing what is NOT granted (in grey, with ✗) is as important as what IS granted.
- If the broker token expires (happens every 24h with Zerodha), a persistent red banner appears across the entire creator dashboard: "⚠️ Zerodha session expired — your trades aren't posting. Reconnect now →"
- Reconnect is one click (OAuth redirect) — not a form.
- Show the last trade that was successfully posted, with timestamp, as proof the connection is working.

---

### 4.4 Subscription Tier Manager (Settings → Pricing)

**Purpose:** Let creators set up their paid tiers without needing to understand payment infrastructure.

**Layout:** Three column cards (one per tier), each independently editable.

**Each Tier Card:**

```
┌─────────────────────────────────┐
│  FREE                           │
│  ─────────────────────────────  │
│  Price: ₹0/month                │
│  ─────────────────────────────  │
│  What subscribers get:          │
│  [+ Add feature]                │
│  • View last 3 trades (public)  │
│  • Basic profile access         │
│  ─────────────────────────────  │
│  [Delete tier]   [Edit]         │
└─────────────────────────────────┘
```

**UX Decisions:**

- Each tier has a "What subscribers get:" section — free-text list. Creator writes it like "24/7 Telegram-style alerts, live room access." This is their sales copy.
- The "Inhumans takes 15% — you keep 85%" line is always visible on this page. Transparency builds trust in the platform.
- Price input auto-formats: type "499" → shows "₹499/mo"
- A preview panel on the right shows how the tier cards will look on the public profile

---

### 4.5 Creator's Own Public Profile (Preview Mode)

**Purpose:** Let creators see exactly what followers see before sharing the link.

**Key UX:** A toggle at the top: "Viewing as: [Creator] / [Free follower] / [Pro subscriber] / [Premium subscriber]" — this lets creators see what's gated at each tier.

---

## 5. Follower Side — All Screens & Flows

---

### 5.1 Creator Public Profile Page

**This is the most important page on the entire platform.** It's the landing page, the sales page, and the trust proof — all in one.

**URL:** inhumans.io/@[handle]

**Layout:** No sidebar. Single-column with max-width 760px centred. Feels like reading a well-designed editorial page — not a dashboard.

**Section 1 — Profile Header:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Avatar 64px]  Arjun Sharma                        │
│                 @arjunsharma                        │
│                 F&O · Options · 5yr exp             │
│                 [Zerodha ✓ Verified] [• Live]       │
│                                                     │
│  ┌──────────┬──────────┬──────────┬──────────┐      │
│  │  347     │  68%     │  +₹4.2L  │  1,240   │      │
│  │  Trades  │  Win %   │  P&L     │  Subs    │      │
│  └──────────┴──────────┴──────────┴──────────┘      │
│                                                     │
│  [Subscribe →]                                      │
└─────────────────────────────────────────────────────┘
```

**The stats strip is the WOW moment.** The first time a follower sees a creator's verified P&L — total profit, win rate, number of trades — with a "Zerodha ✓ Verified" badge, the conversation changes. This is proof. Not a screenshot. Not a testimonial. Broker-verified proof.

**Section 2 — Subscription Tiers:**
Three tier cards, side by side on desktop, stacked on mobile. Clear, simple, priced. The "Subscribe" CTA is sticky-bottom on mobile.

**Section 3 — Live Trade Feed (the preview):**
Free users see the 3 most recent trades, full detail. Older trades are blurred with a "Subscribe to see full history →" overlay. The blurred content is still visible enough to tease the value — not a blank grey box.

**Section 4 — Trade Performance Chart:**
A 30-day cumulative P&L line chart. Green if positive, red if negative. Auto-generated from broker data. No creator effort required.

**Section 5 — About & Style:**
A short free-text section where the creator describes their approach. Max 200 characters. Shown only if the creator filled it in.

**UX Decisions for Profile Page:**

- The "Subscribe" button must be visible WITHOUT scrolling on desktop. It lives in the header section.
- On mobile, a sticky bar appears at the bottom after 300px scroll: "[Avatar] Arjun Sharma — [Subscribe ₹499/mo]"
- The Verified badge links to an explainer: "What does Zerodha Verified mean? →" — this educates new users without cluttering the profile.
- P&L is shown in absolute (₹) AND percentage terms. Both matter to different followers.
- The trade feed shows real instruments, real prices, real timestamps. Not "STOCK A" generic examples. The specificity IS the proof.

---

### 5.2 Follower Feed (Post-Login)

**Purpose:** A personalised timeline of trades and commentary from all followed creators.

**Layout:** Left nav (minimal, 5 items) + centre feed (max 680px) + right column (280px, "Who to follow" + market snapshot)

**Left Nav (Follower):**

```
┌─────────────┐
│ [Logo]      │
├─────────────┤
│ 🏠 Feed     │
│ 📈 Portfolio│
│ 🔍 Explore  │
│ 🔔 Alerts   │
│ ⚙ Settings │
└─────────────┘
```

**Centre Feed:**
A chronological feed of:

- **Trade alerts** from subscribed creators (same verified trade card)
- **Market commentary posts** from creators
- **System events** ("Arjun just started a live session")

Each trade card in the follower feed has an additional action:

```
[BUY]  NIFTY 24500 CE  ·  ₹230.50  ·  50 qty
       P&L: +₹865  (+7.5%)  ·  [● live]
       ─────────────────────────────────
       by Arjun Sharma  ·  3m ago
       [Copy Trade →]     [Save]     [•••]
```

The **"Copy Trade →"** button is the primary follower action. It opens a bottom sheet (not a modal — bottom sheet on mobile, right slide-in panel on desktop) with:

- Instrument details (pre-filled)
- Quantity input (default: auto-scaled to their capital settings)
- Risk confirmation checkbox
- "Execute Copy Trade" button

**UX Decisions:**

- Feed is filtered by default to show only TRADE CARDS (not commentary). A toggle at the top: "Trades only / All posts." Traders come for trade data first.
- Time-sensitivity is critical. A "3 minutes ago" trade is still actionable. A "3 hours ago" trade is history. Timestamps are shown in relative time AND a colour indicator: green = <5min (hot), amber = 5-30min (warm), grey = >30min (cold).
- Unread indicator: a subtle blue dot on the Feed nav item when new trades posted while user was away.
- Pull-to-refresh on mobile (standard behaviour, but implemented smoothly).

---

### 5.3 Portfolio Screen

**Purpose:** Show the follower what they've built by copy trading — their personalised P&L from the platform.

**Layout:** Single-column, data-dense but clear.

**Top Section — Portfolio Overview:**

```
┌──────────────────────────────────────────────┐
│  My Copy Trading Portfolio                   │
│                                              │
│  Total Invested: ₹1,24,000                   │
│  Current Value:  ₹1,38,400                   │
│  P&L:   +₹14,400  (+11.6%)   [chart sparkline]│
└──────────────────────────────────────────────┘
```

**Mid Section — By Creator:**
A breakdown of performance per followed creator. Shows which creator's signals have been most profitable for this specific user.

**Bottom Section — Trade Log:**
Full table of every copy trade the user has executed through the platform: date, instrument, creator, buy price, current/exit price, P&L.

---

### 5.4 Explore / Discovery Page

**Purpose:** Help new users find the right creator to follow.

**Layout:** Filter bar at top + card grid below.

**Filter Bar:**

```
[All Markets ▾]  [Win Rate ▾]  [Subscribers ▾]  [Asset Class ▾]  [🔍 Search]
```

**Creator Cards (in grid, 3-column desktop, 1-column mobile):**

```
┌────────────────────────────────┐
│ [Avatar]  Arjun Sharma         │
│           @arjunsharma         │
│           F&O · Options        │
│                                │
│  Win Rate: 68%  ·  Trades: 347 │
│  P&L: +₹4.2L  ·  1,240 subs   │
│  [Zerodha ✓ Verified]          │
│                                │
│  [View Profile]                │
└────────────────────────────────┘
```

**UX Decisions:**

- Default sort: "Win Rate" — not follower count. This immediately differentiates Inhumans from Instagram-style platforms where popularity wins over performance.
- An "Inhumans Picks" curated row at the top: 3-4 featured creators hand-picked by the team. This is the editorial layer that builds platform credibility.
- Filter by asset class: Equity / F&O / Crypto / Polymarket. Most followers have a preference.
- "Verified Only" toggle — ON by default. Unverified creators can exist but aren't shown by default.

---

## 6. Shared Components Library

### 6.1 Verified Trade Card

The most important component on the platform. It appears in:

- Creator's public feed
- Follower's home feed
- Creator's dashboard
- Analytics tables

**States:**

- `live` — trade is open, P&L updating in real-time (pulsing green dot)
- `closed-profit` — trade exited, green P&L locked in
- `closed-loss` — trade exited, red P&L
- `pending` — order placed, not yet filled (amber indicator)

**Variants:**

- `full` — complete card with all details (profile page, dashboard)
- `compact` — condensed for feed scroll (instrument + P&L + time only)
- `copy-action` — includes "Copy Trade" CTA (follower-only)

### 6.2 Creator Profile Badge

A small reusable component used anywhere a creator is referenced:

```
[Avatar] Arjun Sharma  [Zerodha ✓]  68% win
```

### 6.3 Broker Status Chip

Used in sidebar, creator profile header, settings:

```
● Zerodha Connected  ← green, live
● Reconnect required ← amber, warning
● Not Connected      ← grey, inactive
```

### 6.4 Subscription Tier Badge

Used on trade cards and profiles to show what tier a follower is on:

```
[FREE]  [PRO]  [PREMIUM]
```

Small pill chips. Teal for paid tiers, grey for free.

### 6.5 P&L Number Component

A specialised text component for displaying profit/loss:

- Always monospace font (JetBrains Mono)
- Always colour-coded (green/red)
- Animates when value changes (count-up effect)
- Shows absolute (₹) + percentage side by side
- Never shows ₹0 as neutral grey — shows in muted white

### 6.6 Live Indicator

A small animated component used when a creator is streaming:

```
● LIVE  ← pulsing red dot + "LIVE" in caps, white on red chip
```

### 6.7 Copy Trade Bottom Sheet (Mobile) / Slide Panel (Desktop)

**The most critical conversion component.** This appears when a follower taps "Copy Trade."

Structure:

```
Title: Copy Arjun's Trade

Instrument:  NIFTY 24500 CE   [read-only]
Direction:   BUY              [read-only]
Creator qty: 50 lots          [read-only]
─────────────────────────────
Your Quantity:  [  10  ] lots  ← editable
Estimated cost: ₹23,050
─────────────────────────────
⚠ This places a real order in your Zerodha account.
  Market orders execute at current price.

[Cancel]           [Execute Copy Trade →]
```

**UX Decision:** The warning is NOT a scary legal disclaimer. It's a single, clear sentence. Traders are adults. Respect their intelligence. Don't wrap it in 3 paragraphs of legalese.

---

## 7. Motion & Interaction Principles

### The Core Rule

**Every transition must feel like it has physical weight.** Nothing teleports. Nothing appears instantly.

### Easing Curve (Golden Standard)

```
cubic-bezier(0.16, 1, 0.3, 1)  ← Spring-like, fast entry, gentle settle
Duration: 160-220ms for micro-interactions
Duration: 280-400ms for page transitions
Duration: 0ms for data that MUST be instant (live P&L updates)
```

### Specific Animations

**New Trade Arriving (Live Feed):**

- Card slides in from top with `translateY(-20px)` → `translateY(0)` + fade in
- Duration: 240ms
- The entry animation is the ONLY theatrical animation on the platform. Everything else is functional.

**P&L Number Update:**

- Number counts up/down (counter animation) when value changes
- Green flash on increase, red flash on decrease (100ms background flash, then settles)
- No easing on the number itself — real data should feel real, not smooth

**Copy Trade Confirmation:**

- On "Execute" tap: button shows spinner (200ms)
- On success: button turns solid green, shows checkmark, then "Order Placed" text
- Bottom sheet dismisses after 1.2s automatically
- A toast appears: "✓ Copied NIFTY 24500 CE · ₹230.50"

**Subscription Subscribe Flow:**

- Button press → payment sheet slides up from bottom (Razorpay native sheet)
- On payment success → confetti (reserved for this ONE theatrical moment on the platform)
- Creator's subscriber count ticks up in real-time if they're viewing their analytics

**Hover States:**

- Cards: `box-shadow` deepens (no transform — transforms cause layout shift)
- Buttons: `background` lightens, no transform
- Trade cards: subtle background shift to Surface-3
- Profile links: underline slides in from left

### What We DO NOT Animate

- Page loads (no skeleton-to-content fade — just show the skeleton, then swap)
- P&L data (data must feel instantaneous — never delay real information with animation)
- Error states (errors need to be immediately visible, not animated in)
- Any loading state longer than 300ms gets a skeleton, not a spinner

---

## 8. Mobile-First Rules

### Navigation on Mobile

- **Creator:** Bottom tab bar with 5 items: Feed / Analytics / Community / Live / Profile
- **Follower:** Bottom tab bar with 5 items: Feed / Portfolio / Explore / Alerts / Profile
- No hamburger menus — all primary actions accessible in one tap

### Trade Card on Mobile (375px)

The trade card collapses gracefully:

- Full width, no side padding beyond 16px
- Instrument name + direction on one line
- P&L on the right of the same line
- Creator name + time below
- "Copy" button becomes a full-width sticky bar that appears when the card is in viewport

### Creator Profile on Mobile

- The stats strip (Trades / Win% / P&L / Subs) scrolls horizontally at 375px
- Subscription tiers stack vertically
- Trade feed is single column
- "Subscribe" button is sticky at the bottom of viewport

### Touch Targets

- Minimum 44x44px for ALL tappable elements — no exceptions
- Trade card "Copy" button minimum height: 48px
- Bottom nav items: 56px tall each

### Copy Trade Sheet on Mobile

- Full-screen bottom sheet (96vh)
- Large touch-friendly quantity input (48px height)
- "Execute" button: full width, 56px height, impossible to miss

---

## 9. Unique UX Decisions (That Make This Not Generic)

These are the design decisions that separate Inhumans from every other "trading social" platform.

### 9.1 Trade Cards are NOT Social Posts

On every other platform (Stocktwits, Twitter, Discord), trades are social posts — someone *claims* they bought something. On Inhumans, the trade card is a **broker receipt**, not a social post. The visual design must communicate this difference.

**How:** Trade cards have a different visual treatment than commentary posts:

- Trade cards have a monospace font for price data
- Trade cards have a "Zerodha ✓" stamp in the corner (like a bank statement stamp)
- Trade cards have a green/red left bar (the only acceptable use of a coloured side bar — because it carries semantic meaning: trade direction)
- Commentary posts have no such treatment — they look like notes

### 9.2 Win Rate is the Primary Discovery Metric

Every other creator platform sorts by popularity. We sort by **verified performance**.

The Explore page defaults to "Win Rate" not "Most Subscribers." This single decision signals to every user: *this platform is about results, not fame.*

### 9.3 The Blurred Feed Preview (Paywall with Dignity)

When a free user views a creator's profile, they see the last 3 trades in full. Older trades are visible but blurred — not hidden, not replaced by a grey box. The blur preserves the shape of the data while obscuring the specifics. This communicates: *the data exists, it's real, you're missing it.*

This is psychologically more effective than a blank wall because the user can see the rhythm of trading — 3 trades on Tuesday, 2 on Wednesday, etc. They see activity without seeing content.

### 9.4 Hot / Warm / Cold Trade Freshness Indicator

No other trading platform colour-codes trade age. Inhumans does:

- **Green timestamp** — trade posted < 5 minutes ago. Still potentially actionable.
- **Amber timestamp** — 5–30 minutes ago. Getting stale.
- **Grey timestamp** — >30 minutes. Historical only.

This prevents followers from FOMO-copying stale trades at bad prices. It protects them from themselves. That builds trust in the platform.

### 9.5 Creator Revenue is Visible to the Creator, Always

Revenue is the #1 motivation for creators. It should NEVER be buried. The creator's MRR is shown:

- In the sidebar as a small number under their avatar
- On the analytics page as the first KPI
- In a weekly "Your platform earnings" push notification

Most platforms hide revenue behind 3 clicks. We put it front-and-centre because creator success = platform success.

### 9.6 No "Likes" on Trade Cards

Trade cards don't have likes. They have:

- **Copy count** — how many followers copied this trade
- **Comment count** — discussion on the trade rationale
- **Save** — bookmark for later reference

Likes are vanity. Copy count is real signal — it shows whether the trade was good enough to act on.

### 9.7 Follower "Copy Rate" Score

Each follower has a visible "Copy Rate" on their portfolio — what % of alerts from a creator they've acted on. This gamifies engagement meaningfully: high copy rate = high conviction follower. Creators can see aggregate copy rates per trade, which tells them which call types their audience trusts most.

### 9.8 "Skipped" Trade Acknowledgement

When a follower doesn't copy a trade that then becomes profitable, the platform quietly shows:

```
You skipped this → +₹1,200  [Next time, copy it →]
```

This is a tasteful FOMO nudge that drives subscription upgrades and copy rate increase. It's shown only once per trade, never repeatedly.

---

## 10. Screen Wireframes (ASCII)

### 10.1 Creator Dashboard — Feed View

```
┌──────────────────────────────────────────────────────────────────────┐
│  ▐▌ inhumans.io           [● Zerodha Live]         [🔔] [@arjun ▾]  │
├──────────────────────────────────────────────────────────────────────┤
│                 │                                    │               │
│  ⚡ Feed  ←    │  ┌─────────────────────────────┐  │  Today        │
│  📊 Analytics  │  │  Write a market thought...  │  │  P&L: +₹4,200 │
│  💬 Community  │  │  [📊 Chart]  [🔴 Go Live]   │  │               │
│  🎥 Live Room  │  └─────────────────────────────┘  │  Trades: 3    │
│  📚 Courses    │                                    │  Subs today:+4│
│  👥 Subs       │  ── Latest Trade (auto-posted) ──  │               │
│                │                                    │  [▼ Collapse] │
│  ──────────   │  ┌─────────────────────────────┐  │               │
│  MRR: ₹62,400  │  │ ▐ BUY  NIFTY 24500 CE      │  │               │
│  [@arjun]      │  │   ₹230.50 · 50 qty          │  │               │
│  ● Live        │  │   P&L: +₹1,750 (+15.2%) ●  │  │               │
│                │  │   [Zerodha ✓]  34 copied    │  │               │
│                │  │   2 comments  ·  just now   │  │               │
│                │  └─────────────────────────────┘  │               │
│                │                                    │               │
│                │  ┌─────────────────────────────┐  │               │
│                │  │  [post] Market opening gap  │  │               │
│                │  │  "Watching 24400 support..." │  │               │
│                │  │  2 comments · 8m ago        │  │               │
│                │  └─────────────────────────────┘  │               │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.2 Creator Public Profile (Follower View, Desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ▐▌ inhumans.io                          [Login]  [Sign up free]    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│         ┌──────────────────────────────────────────────┐            │
│         │  [Avatar]  Arjun Sharma                      │            │
│         │            @arjunsharma                      │            │
│         │            F&O · Options · 5yr exp           │            │
│         │            [Zerodha ✓ Verified]  [● Live]    │            │
│         │                                              │            │
│         │  ┌────────┬────────┬──────────┬──────────┐  │            │
│         │  │  347   │  68%   │  +₹4.2L  │  1,240   │  │            │
│         │  │ trades │  win%  │   P&L    │   subs   │  │            │
│         │  └────────┴────────┴──────────┴──────────┘  │            │
│         │                                              │            │
│         │  ┌──────────────────┐  ┌─────────────────┐  │            │
│         │  │  FREE  ₹0        │  │  PRO  ₹499/mo   │  │            │
│         │  │  • Last 3 trades │  │  • All trades   │  │            │
│         │  │                  │  │  • Live alerts  │  │            │
│         │  │  [Current Plan]  │  │  [Subscribe →]  │  │            │
│         │  └──────────────────┘  └─────────────────┘  │            │
│         └──────────────────────────────────────────────┘            │
│                                                                      │
│         ── Trade History ──────────────────────────────             │
│         ┌────────────────────────────────────────────┐              │
│         │ ▐ BUY  NIFTY 24500 CE · ₹230.50  +₹1,750  │              │
│         │ [Zerodha ✓]  34 copied  ·  2m ago  ● hot   │              │
│         └────────────────────────────────────────────┘              │
│         ┌────────────────────────────────────────────┐              │
│         │ ▐░░░ [BLURRED — Subscribe to see] ░░░░░░░  │  ← blurred  │
│         └────────────────────────────────────────────┘              │
│         ┌────────────────────────────────────────────┐              │
│         │ ▐░░░ [BLURRED — Subscribe to see] ░░░░░░░  │  ← blurred  │
│         └────────────────────────────────────────────┘              │
│                   [Subscribe to unlock full history]                 │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.3 Follower Feed (Post-Login, Mobile 375px)

```
┌─────────────────────┐
│ ▐▌        [🔔] [👤] │
├─────────────────────┤
│ [Trades ●] [All]    │ ← filter toggle
├─────────────────────┤
│                     │
│ ┌─────────────────┐ │
│ │[av] Arjun · 2m  │ │  ← green dot (hot)
│ │ BUY NIFTY CE    │ │
│ │ ₹230.50 · 50 qt │ │
│ │ P&L: +₹1,750 ●  │ │
│ │ [Zerodha ✓]     │ │
│ └─────────────────┘ │
│ [─── Copy Trade ──] │  ← sticky bar
│                     │
│ ┌─────────────────┐ │
│ │[av] Ravi · 18m  │ │  ← amber (warm)
│ │ SELL BANKNIFTY  │ │
│ │ ₹48,200 · 2 qty │ │
│ │ P&L: -₹320      │ │
│ └─────────────────┘ │
│                     │
├─────────────────────┤
│ 🏠  📈  🔍  🔔  👤 │  ← bottom nav
└─────────────────────┘
```

### 10.4 Copy Trade Sheet (Mobile)

```
┌─────────────────────┐
│ ─                   │  ← drag handle
│ Copy Arjun's Trade  │
├─────────────────────┤
│ Instrument          │
│ NIFTY 24500 CE      │
│                     │
│ Direction  Price    │
│ BUY        ₹230.50  │
│                     │
│ Creator qty: 50 qty │
├─────────────────────┤
│ Your quantity       │
│ ┌─────────────────┐ │
│ │ [─] 10 lots [+] │ │  ← big, tappable
│ └─────────────────┘ │
│ Est. cost: ₹23,050  │
├─────────────────────┤
│ ⚠ Places real order │
│   in your Zerodha.  │
│   Market price.     │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ Execute Copy →  │ │  ← full width, 56px
│ └─────────────────┘ │
│ [Cancel]            │
└─────────────────────┘
```

---

## Appendix — Screen Inventory

### Creator Screens (11)

1. Creator Dashboard — Feed
2. Creator Dashboard — Analytics
3. Creator Dashboard — Community
4. Creator Dashboard — Live Room (pre/during/post)
5. Creator Dashboard — Courses
6. Creator Dashboard — Subscribers
7. Settings — Broker Connect
8. Settings — Profile Edit
9. Settings — Pricing Tiers
10. Settings — Payouts
11. Onboarding Flow (5 steps — see separate doc)

### Follower Screens (8)

1. Explore / Discovery
2. Creator Public Profile (Free view)
3. Creator Public Profile (Subscribed view)
4. Home Feed
5. Portfolio Dashboard
6. Settings — Subscriptions
7. Settings — Broker Connect (copy trading)
8. Settings — Alerts

### Shared Screens (4)

1. Login / Signup
2. Payment Flow (Razorpay sheet)
3. Notification Centre
4. 404 / Error states

---

*Document version 1.0 · Inhumans.io Product Design · March 2026*
*Owner: Founder · Next review: April 10, 2026*
