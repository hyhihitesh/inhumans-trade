# Vercel Deployment Guide: Inhumans.io

This document summarizes the final configuration and validation steps required to successfully deploy the Inhumans.io project to Vercel.

## 1. Environment Variable Configuration
Add the following keys to your Vercel Project Settings for the **Production** environment. 

> [!CAUTION]
> Generate unique, cryptographically strong secrets for production. Do NOT reuse secrets from `.env.local`.

| Variable | Source / Recommended Value |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase Production Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | **(DANGER: SERVER-ONLY)** Production Service Role Key |
| `NEXT_PUBLIC_APP_URL` | `https://inhumans.io` |
| `ZERODHA_API_KEY` | Your Production Kite Connect Key |
| `ZERODHA_API_SECRET` | Your Production Kite Connect Secret |
| `ZERODHA_REDIRECT_URI` | `https://inhumans.io/api/brokers/zerodha/callback` |
| `BROKER_OAUTH_STATE_SECRET` | *New 64-char Hex String* |
| `BROKER_TOKEN_ENCRYPTION_KEY` | *New 64-char Hex String* |
| `BROKER_WEBHOOK_SECRET` | *Random high-entropy string* |
| `COPY_TRADE_WEBHOOK_SECRET` | *Random high-entropy string* |
| `RAZORPAY_KEY_ID` | Production Merchant ID |
| `RAZORPAY_KEY_SECRET` | Production Secret Key |
| `RAZORPAY_WEBHOOK_SECRET` | Production Webhook Secret |

## 2. Pre-Deployment Health Check
- [x] **New Next.js 16 Proxy Pattern**: Legacy `middleware.ts` removed. `src/proxy.ts` is the active entry point.
- [x] **SEO Readiness**: Root `robots.ts` and `sitemap.ts` are generating dynamically for `inhumans.io`.
- [x] **Branded 404**: `src/app/not-found.tsx` is ready with the Scandinavian Trust design.
- [x] **Canonical URL**: `metadataBase` in root layout set to `https://inhumans.io`.

## 3. Anti-Pattern Mitigation
- [x] **Explicit Environment Context**: Use `src/lib/supabase/env.ts` to ensure `NEXT_RUNTIME` and environment variables are validated at runtime.
- [x] **Build Optimization**: Project builds successfully in < 30 seconds using Turbopack locally (`npm run build`).

## 4. Deployment Steps
1. Push your latest changes to the main branch.
2. Link your GitHub repo to a new Vercel Project.
3. Paste the variables from `.env.production.example` (or the table above).
4. Click **Deploy**.
5. Once live, confirm the `ZERODHA_REDIRECT_URI` in your Kite Connect dashboard matches the Vercel production URL.
