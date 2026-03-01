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
- **Supabase PostgreSQL** — 11 tables: profiles, transactions, budgets, goals, investments, bills, categories, user_settings, newsletter_subscribers, password_reset_log, audit_logs
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

| # | Feature | Effort | Why |
|---|---------|--------|-----|
| 5 | **CSV / PDF Export (activate)** | 1 day | `exportService.js` + `jsPDF` + `PapaParse` are already in the codebase. Just wire the export buttons and gate full history behind Pro (free = last 30 days). |
| 6 | **Weekly Email Summary** | 1–2 days | Automated email: "You spent $X this week, saved $Y, top category: Z." Use Supabase `pg_cron` + Resend or SendGrid free tier (100 emails/day free). |
| 7 | **Google Analytics 4** | 2 hours | Add GA4 script to `index.html`. Track page views, CTA clicks, signup conversions. Required to show any engagement data to investors or buyers. `REACT_APP_GA_MEASUREMENT_ID` is already in `.env.example`. |
| 8 | **Newsletter Confirmation Email** | 3–4 hours | RLS + DB storage is done. Wire up a confirmation email via Resend/SendGrid when a user subscribes from the footer. |
| 9 | **Onboarding Flow (first-time users)** | 4–6 hours | `OnboardingWizard.jsx` already exists in the codebase. Wire it to trigger on first login: pick currency → add first transaction → set first budget. Reduces new-user drop-off. |
| 10 | **PWA Support** | 2–3 hours | Add `manifest.json` with icons + register a service worker. Users can "Add to Home Screen" on mobile without app store submission. |
| 11 | **Contact Form Backend** | 2–3 hours | `/contact` page exists but the form has no backend. Wire to an email service (Resend/SendGrid) or Supabase table. |

---

## 🟢 Tier 3 — Launch & Growth

| # | Feature | Effort | Why |
|---|---------|--------|-----|
| 12 | **Automated Tests** | 2–3 days | 10–15 Jest unit tests for `FinanceContext` CRUD + 3–5 Playwright E2E tests (signup → add transaction → view dashboard). Signals code quality to buyers/investors. |
| 13 | **GitHub Actions CI/CD** | 1 day | Auto-run tests + lint on every push. Auto-deploy to Vercel on merge to `main`. |
| 14 | **Crisp Live Chat Widget** | 30 min | Single `<script>` tag in `index.html`. Free tier: 2 agents, unlimited conversations. Makes the product feel professionally supported. |
| 15 | **Fix Social Proof Numbers** | 30 min | Landing page currently claims "100K+ Active Users" and "$500M+ Money Tracked" with zero real users. Replace with "Built for 100K+ users" or remove until real data exists. |
| 16 | **Mobile App — Google Play Publish** | 1 week | React Native/Expo app is in development. Publish to Google Play Store to open a new user acquisition channel. |
| 17 | **Multi-Currency Live FX Rates** | 2–3 days | Integrate a free FX API (ExchangeRate-API free tier) to auto-convert transaction amounts at real-time rates. Currently currency is a display-only setting with hardcoded symbols. |
| 18 | **Bank Account Linking (Plaid)** | 1–2 weeks | Auto-import transactions from real bank accounts. Biggest technical moat in fintech. Plaid API is free in development mode. |
| 19 | **A/B Testing** | 2–3 days | Test CTA button text, pricing tier arrangements, hero headline variations. |

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
| **No real users or analytics** | No Google Analytics installed. No signup data. Social proof numbers on landing page are placeholders. |
| **No automated tests** | `package.json` has `"test": "craco test"` but no test files exist. |
| **No CI/CD pipeline** | No GitHub Actions — deploys are triggered manually by pushing to `main`. |
| **No app store presence** | Mobile app not published to Google Play or App Store yet. |
| **Export not active** | `exportService.js`, `jsPDF`, `PapaParse` are all in the codebase but export buttons are not wired to them yet. |
| **Newsletter email not sent** | Subscribers are stored in DB (RLS fixed) but no confirmation email is triggered. |
| **Contact form has no backend** | Form exists on `/contact` page but submissions are not sent anywhere. |
| **OAuth providers not configured** | Google, Microsoft, Apple, GitHub OAuth configured in code but OAuth credentials need to be entered in Supabase Dashboard. |
| **CAPTCHA keys not set** | Cloudflare Turnstile CAPTCHA is coded but site key needs to be configured in Supabase Auth settings. |
| **Email service not set up** | OTP emails require SendGrid/Resend credentials in Supabase Auth email settings. |
| **Client-side rate limiting only** | Rate limiting resets on page refresh. Real enforcement requires Supabase Pro + Edge Functions. |
