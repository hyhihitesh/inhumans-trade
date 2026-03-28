# PRODUCT REQUIREMENTS DOCUMENT
## Inhumans.io — Verified Trading Creator Platform
**Version:** 2.0  
**Date:** March 27, 2026  
**Owner:** Founder  
**Stack:** Next.js 14 + Supabase  
**Status:** Active — Dev Ready

---

## 1. EXECUTIVE SUMMARY

Inhumans.io is a done-for-you creator platform built exclusively for Indian trading YouTubers, equity analysts, crypto traders, and Polymarket forecasters. It replaces the fragmented mess of Telegram + Discord + Gumroad + YouTube Live with one branded, verified, monetizable hub per creator.

The platform's core differentiator is the **Verified Live Trade Feed** — every trade a creator places is pulled directly from their broker account (Zerodha, Dhan, Angel One) and auto-posted to their page in real time. Followers see broker-verified trades, not screenshots. With one tap, they can mirror that trade into their own account.

---

## 2. PROBLEM STATEMENT

### Creator Side
- Managing 5+ disconnected tools (Telegram + Discord + Gumroad + YouTube + Linktree)
- No credibility layer — anyone can fake trade screenshots
- Revenue is fragmented across platforms, hard to track or scale
- No single owned community space

### Follower/Audience Side
- Cannot verify if a creator actually trades or just teaches
- Signal chasing across multiple Telegram groups with zero accountability
- Manual trade execution from signals — slow, error-prone
- Trust collapsed due to rampant fake gurus in Indian trading community

---

## 3. GOALS & SUCCESS METRICS

| Goal | Metric | Target (Month 3) | Target (Month 6) |
|---|---|---|---|
| Creator adoption | Verified creators live | 15 | 50 |
| Audience growth | Active followers | 5,000 | 25,000 |
| Revenue GMV | Creator subscription revenue | ₹10L/month | ₹50L/month |
| Engagement | DAU / MAU ratio | 30% | 40% |
| Trust signal | Broker-connected creators | 90% | 90% |

---

## 4. TARGET USERS

### Primary — Trading Creators
- Indian trading YouTubers (10K–2M subscribers)
- SEBI-registered research analysts
- Unregistered educators running Telegram signal channels
- Crypto traders and Polymarket analysts

### Secondary — Trader Audiences
- Retail traders aged 18–35 on Zerodha / Dhan / Angel One
- Followers of trading YouTube channels paying for signals
- New traders wanting to learn by watching verified trades

---

## 5. CORE FEATURES

### 5.1 Creator Hub (Done-For-You Profile)
- Branded page at inhumans.io/@username
- Profile: bio, asset focus tags (Equity / Crypto / F&O / Options / Polymarket)
- Subscription tiers: Free / Pro / Premium with custom pricing
- UPI + Razorpay payments built in
- Telegram audience migration tool (import subscribers via invite link)

### 5.2 ⭐ Verified Live Trade Feed (Core WOW Feature)
- Creator connects broker via OAuth (Zerodha Kite / Dhan HQ / Angel One SmartAPI / Fyers)
- Every executed order auto-posts to creator feed via broker webhook → Supabase insert
- Trade card shows: instrument, entry price, quantity, trade type (BUY/SELL), live P&L
- P&L updates live via Supabase Realtime WebSocket — no refresh needed
- Tamper-proof: data pulled from broker order stream, not manual entry
- Public trade history = verifiable track record for every creator

### 5.3 One-Tap Copy Trading
- Followers connect their broker account (OAuth)
- Instant push notification when followed creator places a trade
- One tap mirrors the exact trade into follower's broker account via API
- Risk controls: max capital per trade, max daily loss limit, auto stop-loss toggle
- Copy rate displayed on creator's public profile (social proof)

### 5.4 Community Feed
- Asset-class segmented threads: Equity / Crypto / F&O / Polymarket
- Creator posts: chart analysis, trade ideas, market commentary, polls
- Comments, reactions, saves, reshares
- Paid-tier gating: some posts visible to subscribers only
- Replaces Discord servers and Telegram group chats

### 5.5 Live Room (In-Platform Streaming)
- Live streaming inside the platform — no YouTube dependency
- No algorithm, no demonetization risk
- Tiered access: free preview (5 min) → paid full session
- TradingView chart embed during stream
- Session recording saved to creator's page

### 5.6 Course & Cohort Hosting
- Recorded course modules with video upload (Supabase Storage)
- Cohort scheduling with seat limits and waitlists
- Progress tracking and completion certificates
- Replaces Gumroad / Instamojo / Teachable for trading educators

### 5.7 Creator Analytics Dashboard
- Subscriber growth over time
- Revenue breakdown (subscriptions / courses / live rooms)
- Trade engagement: views per trade post, copy rate
- Top performing instruments and trade types
- Audience breakdown by broker and subscription tier

---

## 6. USER JOURNEYS

### Creator Onboarding (Target: Under 10 minutes)
1. Sign up with Google / email via Supabase Auth
2. Choose username → profile auto-created at inhumans.io/@handle
3. Connect broker via OAuth (Zerodha / Dhan / Angel One)
4. Set subscription tiers and pricing via Razorpay dashboard
5. Import Telegram channel followers via invite link migration tool
6. First real trade executes → auto-posts to feed → share link to YouTube community

### Follower Journey
1. Clicks creator's link (from YouTube bio / Twitter / WhatsApp)
2. Lands on creator's public profile — sees verified trade history + P&L track record
3. Subscribes to paid tier via UPI in under 30 seconds
4. Optionally connects their broker for copy trading
5. Receives push notification on next trade → taps Copy → trade mirrored instantly

---

## 7. TECHNICAL ARCHITECTURE

### Stack Overview
```
Next.js 14 (App Router)   → Frontend UI + API Routes (no separate backend)
Supabase                  → Postgres DB + Realtime + Auth + Storage
Broker APIs               → Zerodha Kite, Dhan HQ, Angel SmartAPI, Fyers
Razorpay                  → Subscriptions + UPI payments
Vercel                    → Deployment (Edge Functions for low latency)
```

### Core Data Flow — Verified Trade
```
Creator places trade on broker app
        ↓
Broker fires webhook to /api/trade-webhook (Next.js API route)
        ↓
API route validates + inserts row into Supabase trades table
        ↓
Supabase Realtime broadcasts new row to all subscribed followers
        ↓
Follower's browser receives live trade card via WebSocket (no refresh)
        ↓
Follower taps Copy → /api/copy-trade → Broker API → Order placed
```

### Supabase Database Schema (Core Tables)

**users**
- id, email, username, role (creator/follower), created_at

**creator_profiles**
- id, user_id, broker_connected, broker_name, subscription_tiers (JSON), bio, tags

**trades**
- id, creator_id, instrument, trade_type, entry_price, quantity, status, pnl, broker_order_id, created_at

**subscriptions**
- id, follower_id, creator_id, tier, razorpay_subscription_id, status, created_at

**copy_trades**
- id, trade_id, follower_id, mirrored_order_id, status, created_at

**community_posts**
- id, creator_id, content, asset_class, tier_required, created_at

### Supabase Realtime Setup
- Enable Realtime on `trades` table
- Client subscribes to channel: `trades:creator_id=eq.{creatorId}`
- On INSERT event → render new trade card on follower feed
- On UPDATE event → update live P&L on existing trade card

### Broker Integration
- OAuth flow for each broker (Zerodha Kite Connect, Dhan HQ API)
- Store encrypted access tokens in Supabase (vault/secrets)
- Webhook endpoints per broker → normalised into unified trade schema
- OpenAlgo open-source connectors as base abstraction layer

### Copy Trade Execution (Phase 2)
- Supabase Edge Function triggered on new trade INSERT
- Fetches all active copy subscribers for that creator
- Calls each follower's broker API in parallel (with rate limiting)
- Logs result to copy_trades table

---

## 8. MONETIZATION MODEL

| Revenue Stream | Model | Platform Cut | Est. Avg. Value |
|---|---|---|---|
| Creator subscriptions | Revenue share | 15% | ₹499–₹2,999/month per subscriber |
| Course sales | Revenue share | 10% | ₹2,000–₹15,000 per course |
| Copy trading | Per-trade micro fee | 100% | ₹2–₹5 per copy executed |
| Creator Pro Tools | SaaS subscription | 100% | ₹2,999/month per creator |
| Featured placement | Discovery ads | Fixed CPM | ₹5,000–₹20,000/month |

---

## 9. COMPLIANCE & RISK

- SEBI disclaimer on all trade posts: "Not SEBI registered investment advice"
- Creator T&C: acknowledge they are not providing regulated advisory services
- Copy trading positioned as "order mirroring" not "investment advisory"
- Creator KYC: Aadhaar + PAN verification before broker connect
- Follower risk acknowledgement before enabling copy trading
- Rate limiting on copy trade execution to prevent market impact
- Broker API tokens encrypted at rest in Supabase Vault

---

## 10. MVP SCOPE (5 WEEKS)

### Week 1–2: Foundation
- Next.js 14 project setup on Vercel
- Supabase project: users, creator_profiles, trades tables
- Supabase Auth (Google OAuth + email)
- Creator profile page (inhumans.io/@handle)

### Week 3: Core Feature
- Zerodha Kite API + Dhan API webhook integration
- /api/trade-webhook endpoint → Supabase insert
- Supabase Realtime → live trade card on creator feed
- Trade card UI (instrument, price, quantity, live P&L)

### Week 4: Monetization
- Subscription tier setup (Razorpay)
- UPI payment flow for followers
- Gated content (paid vs free posts)
- Creator earnings dashboard

### Week 5: Polish + Launch
- Push notifications (Supabase + web push)
- Telegram migration tool (invite link importer)
- Creator onboarding flow (under 10 min)
- Public profile with trade history + P&L track record
- Beta launch with 5 creators

### Post-MVP (Phase 2)
- One-tap copy trading (Supabase Edge Functions)
- Live room streaming
- Course hosting
- Mobile app (React Native / Expo)
- Angel One + Fyers broker expansion

---

## 11. GO-TO-MARKET PLAN

### Pre-Launch (Weeks 1–4 of build)
- Identify 20 Indian trading YouTubers (50K–500K subs)
- DM with waitlist invite + "your verified trade feed is ready"
- Target communities: Zerodha Varsity, r/IndiaInvestments, FinTwit India

### Beta Launch (Week 5)
- Onboard 5 creators white-glove (set up their entire hub manually)
- Each creator posts their verified trade feed link to their YouTube community tab
- Organic distribution via creator's existing audience

### Public Launch
- PR angle: "India's first fake-guru-proof trading platform"
- Target: Economic Times Markets, MoneyControl, Finshots newsletter
- Referral: creators earn higher rev share for bringing more creators

---

## 12. VERSION HISTORY

| Version | Date | Changes |
|---|---|---|
| 1.0 | March 27, 2026 | Initial PRD — original stack |
| 2.0 | March 27, 2026 | Updated to Next.js 14 + Supabase stack, full schema added |

**Approval Required:** Founder sign-off before dev kickoff  
**Next Review:** April 10, 2026  
**Contact:** inhumans.io Founder Team
