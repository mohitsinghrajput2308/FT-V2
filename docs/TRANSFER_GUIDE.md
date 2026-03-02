# FinTrack — Project Transfer Guide

> **For the Seller:** Share this document with your buyer on deal close.  
> **For the Buyer:** Follow each section in order. Estimated setup time: 2–3 hours.

---

## 1. What You Are Buying

| Asset | Description |
|-------|-------------|
| **Source Code** | Full React 19 SaaS application — landing page + dashboard (15 pages) |
| **GitHub Repository** | Complete git history, CI/CD workflows, all branches |
| **Supabase Project** | Live PostgreSQL database, 12 tables, all RLS policies, Edge Functions |
| **Vercel Deployment** | Live production URL, auto-deploy pipeline |
| **Documentation** | FEATURES.md, PRD.md, SECURITY.md, TROUBLESHOOTING.md |

**What is NOT included (you must create your own):**
- Stripe account / payment credentials
- Plaid account / bank linking credentials
- Resend email API key
- Google Analytics 4 property
- Cloudflare Turnstile CAPTCHA keys
- Google / GitHub / Apple / Microsoft OAuth app credentials
- Google Play developer account (for mobile app)

---

## 2. Platform Transfer Checklist

### ✅ Step 1 — GitHub Repository

1. Seller goes to: `github.com/<seller>/fintrack` → **Settings → Danger Zone → Transfer repository**
2. Enter buyer's GitHub username
3. Confirm transfer
4. Buyer accepts the invitation in their email
5. Update local clone: `git remote set-url origin https://github.com/<buyer>/fintrack`

> **Note:** All git history, branches, GitHub Actions workflows, and issues transfer automatically.

---

### ✅ Step 2 — Supabase Project

**Option A — Transfer Organization (recommended)**
1. Seller goes to: `supabase.com/dashboard/org/<org-slug>/settings/members`
2. Invite buyer's email as **Owner**
3. Once buyer accepts, seller removes themselves

**Option B — Transfer Project to Buyer's Org**
1. Seller goes to: `supabase.com/dashboard/project/eocagbloalvidegyxvpv/settings/general`
2. Scroll to **Transfer project**
3. Select buyer's organization (buyer must create a free Supabase account first)

> **What transfers:** Database, all tables, RLS policies, Edge Functions, Storage buckets (videos), all existing user accounts, auth configuration.

> **What does NOT transfer:** Supabase secrets/env vars (API keys). Buyer must re-enter their own keys — see Section 4.

---

### ✅ Step 3 — Vercel Deployment

1. Seller goes to: `vercel.com/dashboard` → select FinTrack project → **Settings → Transfer**
2. Enter buyer's Vercel account email
3. Buyer accepts transfer

**After transfer, buyer must update environment variables in Vercel:**
- Go to project **Settings → Environment Variables**
- Re-enter all `REACT_APP_*` variables (see Section 4)

> **Note:** The domain will transfer if it was added in Vercel. If using an external registrar (GoDaddy, Namecheap, etc.), update the nameservers/DNS separately to point to buyer's Vercel.

---

### ✅ Step 4 — Domain (if applicable)

If seller owns a custom domain:

| Option | Steps |
|--------|-------|
| **Transfer domain** | Unlock domain at registrar → get transfer auth code → buyer initiates transfer at their registrar (takes 5–7 days) |
| **Point DNS only** | Buyer adds domain in Vercel → seller updates DNS `A` / `CNAME` records at registrar to point to Vercel's IPs |

---

## 3. Environment Variables — Full List

These must be set in both **Vercel** (frontend) and **Supabase Edge Functions** (backend).

### Vercel Dashboard → Settings → Environment Variables

| Variable | Where to Get It | Required? |
|----------|----------------|-----------|
| `REACT_APP_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL | ✅ Yes |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon/public key | ✅ Yes |
| `REACT_APP_GA_MEASUREMENT_ID` | Google Analytics → Admin → Data Streams → Measurement ID (format: `G-XXXXXXXX`) | Optional |

### Supabase Dashboard → Edge Functions → Secrets

| Variable | Where to Get It | Required? |
|----------|----------------|-----------|
| `RESEND_API_KEY` | resend.com → API Keys → Create API Key (free tier: 100 emails/day) | For emails |
| `FROM_EMAIL` | Your verified sender address in Resend (e.g. `hello@yourdomain.com`) | For emails |
| `PLAID_CLIENT_ID` | plaid.com → Dashboard → Team Settings → Keys | For bank linking |
| `PLAID_SECRET` | plaid.com → Dashboard → Keys → Sandbox Secret | For bank linking |
| `PLAID_ENV` | `sandbox` (testing) or `production` (live) — already set to `sandbox` | For bank linking |

---

## 4. Third-Party Accounts — Setup Instructions

### 🔵 Resend (Email)
1. Go to [resend.com](https://resend.com) → Sign up (free)
2. Add and verify your sending domain (or use `onboarding@resend.dev` for testing)
3. Create an API key → copy it
4. Set `RESEND_API_KEY` + `FROM_EMAIL` in Supabase Edge Function secrets

### 🟢 Google Analytics 4
1. Go to [analytics.google.com](https://analytics.google.com) → Create account
2. Create a Property → Web stream → copy **Measurement ID** (`G-XXXXXXXX`)
3. Set `REACT_APP_GA_MEASUREMENT_ID` in Vercel environment variables
4. Redeploy Vercel for it to take effect

### 🟠 Stripe (Payments)
1. Go to [stripe.com](https://stripe.com) → Create account
2. Get **Publishable Key** and **Secret Key** from Dashboard → Developers → API Keys
3. Create products: "FinTrack Pro" ($9.99/mo) and "FinTrack Business" ($29.99/mo)
4. Set up webhook: Dashboard → Webhooks → Add endpoint → `https://yourdomain.com/api/stripe-webhook`
5. Add keys to Vercel env vars and Supabase Edge Function secrets
6. Wire `profiles.is_pro` update in Supabase on successful subscription webhook

> The pricing page UI is fully built. Stripe just needs to be connected to the existing `localIsPro` state.

### 🔴 Plaid (Bank Account Linking)
1. Go to [plaid.com](https://plaid.com) → Create free account
2. Dashboard → Team Settings → Keys → copy **Client ID** and **Sandbox Secret**
3. Set in Supabase Edge Function secrets: `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV=sandbox`
4. To go live: apply for Plaid Production access (requires business verification)

### 🟡 Cloudflare Turnstile (CAPTCHA)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Add Site
2. Enter your domain → get **Site Key** and **Secret Key**
3. Set in Supabase Auth → Settings → Enable CAPTCHA → paste keys

### 🔵 OAuth Providers (Google, GitHub, Apple, Microsoft)
All four are already coded. To activate each:

**Google:**
1. [console.cloud.google.com](https://console.cloud.google.com) → New Project → APIs → OAuth 2.0 → Web Application
2. Authorized redirect URI: `https://eocagbloalvidegyxvpv.supabase.co/auth/v1/callback`
3. Paste Client ID + Secret into Supabase Dashboard → Auth → Providers → Google

**GitHub:**
1. GitHub Settings → Developer Settings → OAuth Apps → New OAuth App
2. Callback URL: `https://eocagbloalvidegyxvpv.supabase.co/auth/v1/callback`
3. Paste into Supabase → Auth → Providers → GitHub

**Apple / Microsoft:** Follow the same pattern — Supabase Auth → Providers has step-by-step guides for each.

> **Important:** Update the Supabase project URL in all redirect URIs if the Supabase project is transferred/recreated.

---

## 5. Supabase Configuration Checklist

After taking ownership of the Supabase project, verify these settings:

- [ ] **Auth → URL Configuration** → Site URL matches your production domain (e.g. `https://fintrack.app`)
- [ ] **Auth → URL Configuration** → Redirect URLs includes `https://yourdomain.com/**`
- [ ] **Auth → Email Templates** → Confirm/reset email templates use your branding
- [ ] **Storage → Buckets → assets** → bucket is set to **Public** (required for video CDN)
- [ ] **Edge Functions** → all 3 functions show as **Active**: `send-newsletter-welcome`, `plaid-create-link-token`, `plaid-exchange-token`
- [ ] **Database → Tables** → all 12 tables exist and have RLS enabled
- [ ] **Settings → General** → update project name if desired

---

## 6. Vercel Configuration Checklist

- [ ] Connect the transferred GitHub repository under **Settings → Git**
- [ ] Set all `REACT_APP_*` environment variables (Section 3)
- [ ] Set **Root Directory** to `landing-page` (the React app lives here, not root)
- [ ] Set **Build Command**: `CI=false npm run build`
- [ ] Set **Output Directory**: `build`
- [ ] Add custom domain if applicable
- [ ] Trigger a manual redeploy after setting env vars

---

## 7. Post-Transfer Testing

Run through this checklist to confirm everything works after transfer:

| Test | Expected Result |
|------|----------------|
| Visit production URL | Landing page loads with video backgrounds |
| Click "Get Started Free" | Auth modal opens |
| Sign up with email | OTP email arrives, account created |
| Log in to dashboard | All 15 pages load, no console errors |
| Add a transaction | Saves to Supabase, appears in list |
| Change currency in Settings | Live FX rate badge appears |
| Subscribe in footer newsletter | Welcome email arrives (if Resend configured) |
| Submit contact form | Appears in `contact_submissions` table |
| Run test suite | `npm test -- --watchAll=false` → 86 tests pass |
| CI pipeline | Push a commit → GitHub Actions passes |

---

## 8. Codebase Quick Reference

```
landing-page/
  src/
    components/          ← Landing page sections (Navbar, Hero, CTA, etc.)
    dashboard/
      pages/             ← 15 dashboard pages
      context/           ← FinanceContext (data), AuthContext, ThemeContext
      utils/             ← secureApi.js, fxService.js, exportService.js
      components/        ← Shared UI (Card, Button, Modal, PlaidLinkButton)
    utils/
      abTest.js          ← A/B testing utility
    context/
      AuthContext.jsx    ← Auth state + Supabase session
  supabase/
    functions/           ← 3 Edge Functions (Deno/TypeScript)
    migrations/          ← All SQL migrations in order

mobile-app/              ← Expo React Native app (scaffold, ready to build)
docs/                    ← FEATURES.md, PRD.md, SECURITY.md, this file
scripts/                 ← validate-security.js
```

**Key files to know:**
| File | Purpose |
|------|---------|
| `landing-page/src/dashboard/context/FinanceContext.jsx` | All financial data state + Supabase CRUD |
| `landing-page/src/dashboard/utils/secureApi.js` | Security gateway — all DB access goes through here |
| `landing-page/src/context/AuthContext.jsx` | Auth state, login/logout/register |
| `landing-page/vercel.json` | CSP headers, rewrites, redirects |
| `landing-page/src/dashboard/utils/fxService.js` | Live FX rate fetching (8 currencies) |

---

## 9. Known Technical Debt

These are intentional shortcuts the seller made pre-launch. Not blockers, but worth addressing:

| Item | Details | Effort |
|------|---------|--------|
| Stripe not wired | `localIsPro` is a mock boolean. Wire to real Stripe subscription status. | 2–3 days |
| Client-side rate limiting | Resets on page refresh. Real enforcement needs Supabase Pro + Edge Functions. | 2 days |
| Weekly email summary | `pg_cron` job not set up. Requires Supabase Pro plan. | 1 day |
| Mobile app not published | Expo scaffold is ready. Need EAS CLI + Google Play dev account ($25 one-time fee). | 1 day |
| No E2E tests | Only unit + integration tests exist. Playwright E2E tests not written. | 2–3 days |

---

## 10. Where to Get Help

| Resource | Link |
|----------|------|
| Supabase Docs | [supabase.com/docs](https://supabase.com/docs) |
| Vercel Docs | [vercel.com/docs](https://vercel.com/docs) |
| Plaid Quickstart | [plaid.com/docs/quickstart](https://plaid.com/docs/quickstart) |
| Resend Docs | [resend.com/docs](https://resend.com/docs) |
| Expo/EAS Build | [docs.expo.dev/build](https://docs.expo.dev/build/introduction) |
| Stripe Checkout | [stripe.com/docs/checkout](https://stripe.com/docs/payments/checkout) |
| This project's docs | `/docs/` folder in the repository |

---

*Transfer Guide — FinTrack V1 — Generated March 2, 2026*
