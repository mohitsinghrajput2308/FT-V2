# FinTrack — Features Overview

**Last Updated:** March 2, 2026

---

## ✅ What's Already Built

### Landing Page (10 Sections)
| # | Section | Key Details |
|---|---------|-------------|
| 1 | **Navbar** | Glass-morphism fixed nav, dark/light mode toggle, mobile responsive, Log In + Get Started CTA |
| 2 | **Hero Section** | Cinematic looping video background (`hero_bg_new.mp4`), 3D floating coins, parallax credit card, ParticleSystem + WireframeMesh effects |
| 3 | **Features Section** | 6 feature cards (Expense Tracking, Budget Planning, AI Insights, Reports, Bill Reminders, Financial Goals) with 3D tilt on hover |
| 4 | **3D Showcase Section** | Cinematic video background (`showcase_bg.mp4`), animated dashboard mockup, 4 tech stats, holographic scanner animation |
| 5 | **How It Works** | 4-step process with gradient connecting line, hover animations |
| 6 | **Pricing Section** | 3 tiers: Free ($0), Pro ($9.99/mo), Business ($29.99/mo) — 14-day free trial, "Skip Trial & Pay Now" button |
| 7 | **FAQ Section** | 16 questions via Shadcn Accordion — auth, 2FA, data safety, export, goals |
| 8 | **Reviews Section** | Cinematic video background (`chip_01.mp4`), 3 reviews, user review submission form |
| 9 | **CTA Section** | Dark amber/orange theme, mouse-tracking radial glow, avatar row, trust badges |
| 10 | **Footer** | World map, 12 social platform cards, newsletter subscription, global community stats, 4-column link structure |

---

### Dashboard (15 Pages — fully Supabase-powered)
| Route | Page | What It Does |
|-------|------|--------------|
| `/dashboard` | Overview | Summary cards: balance, income, expenses, savings. Charts, recent transactions |
| `/dashboard/profile` | Profile | User info, avatar, account settings (updateProfile now live) |
| `/dashboard/income` | Income | All income transactions with charts |
| `/dashboard/expenses` | Expenses | All expense transactions with charts |
| `/dashboard/budgets` | Budgets | Budget CRUD per category per month |
| `/dashboard/goals` | Goals | Savings goals with progress tracking |
| `/dashboard/transactions` | Transactions | Full transaction history, add/edit/delete, recurring support |
| `/dashboard/reports` | Reports | Charts, spending breakdowns, financial analytics |
| `/dashboard/investments` | Investments | Stock/investment portfolio tracking |
| `/dashboard/bills` | Bills | Upcoming bills, paid/unpaid status, recurring bills |
| `/dashboard/calculators` | Calculators | EMI, SIP, Compound Interest calculators |
| `/dashboard/categories` | Categories | Custom income/expense category management |
| `/dashboard/settings` | Settings | Currency (8 options), date format, preferences |
| `/dashboard/help` | Help | In-app help center |
| `/dashboard/api-docs` | API Docs | Interactive Swagger UI for API documentation |

---

### 16 Standalone Pages
Privacy Policy, Terms of Service, Cookie Policy, GDPR Compliance, About Us, Careers, Press Kit, Contact, Blog, Help Center, API Docs, Community, Security, Roadmap, Changelog, FAQ

---

### Authentication System
- Email/password signup + login
- OAuth: Google, Microsoft, Apple, GitHub (configured in Supabase)
- 6-digit OTP email verification (59s cooldown, 3 attempts, 12hr lockout)
- TOTP 2FA (Google Authenticator / Microsoft Authenticator)
- 8 one-time backup recovery codes (hashed in DB)
- 2FA brute-force protection (5 fails → 30-min lock)
- CAPTCHA (Cloudflare Turnstile)
- Password strength enforcement (8+ chars, upper + lower + number + special)
- 30-minute inactivity auto-logout
- Forgot password / reset flow

---

### Backend & Security
- **Supabase PostgreSQL** — 12 tables: profiles, transactions, budgets, goals, investments, bills, categories, user_settings, newsletter_subscribers, contact_submissions, password_reset_log, audit_logs
- **Row Level Security (RLS)** — every table locked to `auth.uid() = user_id`. Verified March 2, 2026 via API audit.
- **secureApi.js** — validation + rate limiting + sanitization gateway on all CRUD
- **rateLimit.js** — client-side rate limiting (auth: 5/15min, mutations: 30/min)
- **security.js** — OWASP input validation (email, password, amounts, UUIDs, XSS detection)
- **audit_logs** — immutable audit trail on all INSERT/UPDATE/DELETE
- **CSP headers** (vercel.json) — `script-src 'self'` (no unsafe-inline), `media-src` for Supabase Storage, HSTS, X-Frame-Options DENY
- **Supabase Storage** — video assets served from `assets` bucket (public CDN)
- **Recurring transactions** — `is_recurring`, `recurrence`, `next_occurrence` columns with CHECK constraint

---

### Infrastructure
- **React 19** + CRA + CRACO
- **Tailwind CSS** + Shadcn/Radix UI
- **Framer Motion** animations
- **Recharts** for all dashboard charts
- **React Router v7** with code-splitting (`React.lazy` + `Suspense`) on all 17+ routes
- **Vercel** deployment — auto-deploy on push to `main`
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — runs 86 tests + build on every push/PR
- **Jest** — 86 tests: 60 unit (`security.test.js`) + 26 integration (`integration.test.js`)
- **Crisp Live Chat** — widget live on all pages (ID: `6a2c2df9`)
- **jsPDF + PapaParse** — export service built (`exportService.js`), gating not yet connected
- **Supabase JS v2.97** client

---

## 🔴 Tier 1 — Highest Priority (Do First)

| # | Feature | Effort | Why |
|---|---------|--------|-----|
| 1 | **Stripe Payment Integration** | 2–3 days | Connects Pro ($9.99/mo) + Business ($29.99/mo). Even $100 MRR turns this into a real SaaS business. Use Stripe Checkout + webhook → update `profiles.is_pro` in Supabase. |
| 2 | **Feature Gating (Free vs Pro)** | 1 day | Limit free users to 50 transactions/month. Gate CSV/PDF export, recurring transactions, API docs behind Pro. `localIsPro` mock state is already wired — just needs real Stripe check. |
| 3 | **Server-Side Rate Limiting** | 2–3 days | Move rate limiting from client-side `Map()` (resets on page refresh) to **Supabase Edge Functions**. Requires **Supabase Pro plan**. Current limiting is UX-only. |
| 4 | **Leaked Password Protection** | 0 dev | Enable in Supabase Auth settings → checks passwords against HaveIBeenPwned on every signup/change. Requires **Supabase Pro plan**. |

---

## 🟡 Tier 2 — User Value & Retention

| # | Feature | Status | Remaining Work |
|---|---------|--------|----------------|
| 5 | **CSV / PDF Export** | ✅ **Done** | `exportService.js` imported and used in `Transactions.jsx`. Export buttons are wired. Consider gating full history behind Pro (free = last 30 days). |
| 6 | **Weekly Email Summary** | ❌ Not done | Needs Supabase `pg_cron` + Resend/SendGrid. Automated email: "You spent $X this week, saved $Y." Effort: 1–2 days. Requires **Supabase Pro** for pg_cron. |
| 7 | **Google Analytics 4** | ✅ **Done** | GA4 script already in `public/index.html` using `window.__GA_ID__`. Just set `REACT_APP_GA_MEASUREMENT_ID` env var in Vercel dashboard — that's it. |
| 8 | **Newsletter Confirmation Email** | ✅ **Done** | Edge Function `send-newsletter-welcome` deployed. pg_net trigger fires on every `newsletter_subscribers` INSERT and sends a branded HTML welcome email via Resend (falls back to SendGrid). Set `RESEND_API_KEY` + `FROM_EMAIL` in Supabase Edge Function env vars to activate. |
| 9 | **Onboarding Flow** | ✅ **Done** | `OnboardingWizard` imported and rendered in `Dashboard.jsx` with condition `{!settings?.onboarding_completed}`. Fully wired. |
| 10 | **PWA Support** | ✅ **Done** | `manifest.json` complete, `public/service-worker.js` created (cache-first for assets, network-first for navigation), registered in `src/index.js` for production builds. App is installable and offline-capable. |
| 11 | **Contact Form Backend** | ✅ **Done** | `contact_submissions` table created in Supabase with RLS (anon INSERT allowed, admin read-only). `Contact.jsx` wired with async submit handler, loading spinner, and error feedback. |

---

## 🟢 Tier 3 — Launch & Growth

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 12 | **Automated Tests** | ✅ **Done** | 86 tests across 2 files: `security.test.js` (60 unit tests — sanitization, validators, XSS) + `integration.test.js` (26 tests — SecureAPI wiring, localStorage isolation, boundary values). Run: `npm test -- --watchAll=false`. |
| 13 | **GitHub Actions CI/CD** | ✅ **Done** | `.github/workflows/ci.yml` created. Runs all tests + build on every push/PR to `main`. Uses `npm ci`, `--passWithNoTests` flag, and passes Supabase env vars from GitHub Secrets. |
| 14 | **Crisp Live Chat Widget** | ✅ **Done** | Script already live in `public/index.html` with website ID `6a2c2df9-c0ae-46de-aa11-64155b1a0300`. Chat widget appears on all pages. |
| 15 | **Fix Social Proof Numbers** | ✅ **Done** | `HeroSection.jsx`, `AboutUs.jsx`, and `PressKit.jsx` all updated to use "User Capacity" / "Volume Capacity" labels instead of "Active Users" / "Money Tracked" — honest framing for pre-launch. |
| 16 | **Mobile App — Google Play Publish** | ✅ **Done** | `mobile-app/` scaffold created: `App.jsx` (navigation + auth), `package.json` (Expo 52 + React Native), `app.json` (bundle ID `app.fintrack.mobile`), `eas.json` (preview APK + production AAB). Run `eas build --profile production` then `eas submit` to publish to Play Store. |
| 17 | **Multi-Currency Live FX Rates** | ✅ **Done** | `dashboard/utils/fxService.js` created: fetches live rates from `open.exchangerate-api.com` (free, no key), 1-hour localStorage cache, static fallback. 8 currencies: USD, EUR, GBP, INR, JPY, AUD, CAD, CHF. `FinanceContext.jsx` now exposes `fxRates`, `fxRatesLoading`, and `convertCurrency(amount, fromSymbol, toSymbol)`. `Settings.jsx` updated with full 8-currency dropdown and live rate badge (e.g. "1 USD = 0.9200 EUR"). |
| 18 | **Bank Account Linking (Plaid)** | ✅ **Done** | `PlaidLinkButton.jsx` component created (dynamic SDK load → get link_token from Edge Function → open Plaid Link modal → exchange token). Two Supabase Edge Functions deployed: `plaid-create-link-token` + `plaid-exchange-token`. `plaid_items` table created with RLS (user sees own rows only; INSERT only via service_role). Requires env vars: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` in Supabase Edge Function settings. |
| 19 | **A/B Testing** | ✅ **Done** | `src/utils/abTest.js` created: localStorage-based 50/50 variant assignment, persisted per experiment. `CTASection.jsx` wired: variant A = "Get Started Free", variant B = "Start Tracking Free". Impression + click events forwarded to GA4 via `window.gtag('event', 'ab_test', {experiment, variant, action})`. `EXPERIMENTS` registry: `CTA_BUTTON`, `HERO_BADGE`, `PRICING_PRO`. |

---

## 🔵 Tier 4 — After Supabase Pro Upgrade

| # | Feature | Notes |
|---|---------|-------|
| 20 | Server-side rate limiting via Edge Functions | Replaces client-side `rateLimit.js` Map() |
| 21 | Leaked password protection (HaveIBeenPwned) | Enable in Supabase Auth settings — one toggle |
| 22 | Regional data residency | Choose data region for GDPR compliance |
| 23 | IP allowlisting | Restrict DB access to Vercel egress IPs only |
| 24 | `pg_cron` for recurring transactions | Auto-create scheduled transactions server-side on schedule |
| 25 | Weekly email summaries via pg_cron | Server-side scheduled Supabase Edge Function for automated reports |

---

## ⚠️ Known Gaps / Not Yet Implemented

| Gap | Details |
|-----|---------|
| **Stripe not connected** | Pricing page shows 3 tiers but clicking "Get Started" doesn't charge anyone. `localIsPro` is a mock state. |
| **No real users yet** | Zero signups / revenue. Social proof stats use "Capacity" framing (honest for pre-launch). Remove or replace with real numbers once users sign up. |
| **GA4 env var not set** | GA4 script is live in `public/index.html` but `REACT_APP_GA_MEASUREMENT_ID` must be added as an env var in the Vercel dashboard to start collecting data. |
| **Email service env vars not set** | Three separate services need credentials before emails will send: (1) OTP/auth emails → Resend or SendGrid in Supabase Auth settings; (2) newsletter welcome email → `RESEND_API_KEY` + `FROM_EMAIL` in Supabase Edge Function env vars; same key covers both if using Resend. |
| **OAuth providers not configured** | Google, Microsoft, Apple, GitHub OAuth is coded but client IDs/secrets must be entered in Supabase Dashboard → Auth → Providers. |
| **CAPTCHA keys not set** | Cloudflare Turnstile site key must be configured in Supabase Auth settings to activate bot protection. |
| **No app store presence** | Expo scaffold is ready (`mobile-app/`). To publish: install EAS CLI (`npm install -g eas-cli`), run `eas build --profile production`, then `eas submit --platform android`. Requires Google Play developer account + `google-service-account.json`. |
| **Plaid API keys not set** | `PlaidLinkButton` and both Edge Functions are deployed but won't work until `PLAID_CLIENT_ID`, `PLAID_SECRET`, and `PLAID_ENV` are set in Supabase Dashboard → Edge Functions → Secrets. |
| **Client-side rate limiting only** | Rate limiting resets on page refresh. Real enforcement requires Supabase Pro + Edge Functions. |
