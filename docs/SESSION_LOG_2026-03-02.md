# FinTrack — Development Session Log

**Project:** FinTrack V1  
**Developer:** Mohit Singh Rajput  
**Session Date:** March 2, 2026  
**GitHub:** https://github.com/mohitsinghrajput2308/FT-V2  
**Live App:** Vercel (auto-deploys from `main`)  
**Supabase Project:** `eocagbloalvidegyxvpv`

---

## Session Summary

This session completed all **Tier 3 items (#12–19)** from the FEATURES.md roadmap, configured Plaid sandbox credentials, wrote a buyer transfer guide, and wired bank linking into the Settings page.

---

## Commits Made This Session

| Commit | Message |
|--------|---------|
| `c973aa4` | feat: implement Tier 2 items — PWA, contact form, newsletter email, AuthContext |
| `f0b5229` | feat: complete Tier 3 items — CI, Crisp chat, social proof, 86 tests |
| `416bfae` | feat: complete Tier 3 items #16-19 — mobile app, FX rates, Plaid, A/B testing |
| `595c901` | docs: add TRANSFER_GUIDE.md — step-by-step project sale handover guide |
| `8c3489e` | docs: Plaid sandbox credentials configured — bank linking live in sandbox |
| `3721059` | feat: wire PlaidLinkButton into Settings page — Connected Bank Accounts section |

---

## Files Created This Session

### New Feature Files
| File | Purpose |
|------|---------|
| `landing-page/src/dashboard/utils/fxService.js` | Live FX rates from open.exchangerate-api.com — 8 currencies, 1hr cache, static fallback |
| `landing-page/src/utils/abTest.js` | A/B testing — localStorage 50/50 variant assignment + GA4 event forwarding |
| `landing-page/src/dashboard/components/PlaidLink/PlaidLinkButton.jsx` | Bank linking UI — dynamic Plaid SDK load, link token fetch, token exchange |
| `landing-page/supabase/functions/plaid-create-link-token/index.ts` | Supabase Edge Function — calls Plaid API to get link_token (deployed) |
| `landing-page/supabase/functions/plaid-exchange-token/index.ts` | Supabase Edge Function — exchanges public_token, stores in plaid_items (deployed) |
| `landing-page/supabase/migrations/20260302_add_plaid_items.sql` | DB migration — plaid_items table with RLS (applied to live DB) |
| `mobile-app/App.jsx` | Expo React Native app — auth screen, bottom-tab nav, Supabase session management |
| `mobile-app/package.json` | Expo 52 dependencies — React Navigation, expo-secure-store, Supabase JS |
| `mobile-app/app.json` | Expo config — bundle ID `app.fintrack.mobile`, Play Store ready |
| `mobile-app/eas.json` | EAS Build config — preview APK + production AAB + Play Store submit |

### Documentation Files
| File | Purpose |
|------|---------|
| `docs/TRANSFER_GUIDE.md` | Full buyer handover guide — platform transfers, env vars, third-party setup, testing checklist |

---

## Files Modified This Session

| File | What Changed |
|------|-------------|
| `landing-page/src/dashboard/context/FinanceContext.jsx` | Added `fxRates`, `fxRatesLoading`, `convertCurrency()` from fxService; wired useEffect to fetch rates on currency change |
| `landing-page/src/dashboard/pages/Settings.jsx` | Currency dropdown now uses `SUPPORTED_CURRENCIES` (8 options); live rate badge; Connected Bank Accounts card with PlaidLinkButton |
| `landing-page/src/components/CTASection.jsx` | A/B test wired — variant A: "Get Started Free" / B: "Start Tracking Free"; impression + click events to GA4 |
| `docs/FEATURES.md` | All Tier 3 items #12–19 marked Done; Plaid gap updated to "sandbox active" |

---

## Infrastructure Changes This Session

### Supabase Edge Functions Deployed
- `plaid-create-link-token` — live at `https://eocagbloalvidegyxvpv.supabase.co/functions/v1/plaid-create-link-token`
- `plaid-exchange-token` — live at `https://eocagbloalvidegyxvpv.supabase.co/functions/v1/plaid-exchange-token`

### Supabase Secrets Set
| Secret | Value |
|--------|-------|
| `PLAID_ENV` | `sandbox` |
| `PLAID_CLIENT_ID` | `69a574ac1d036d000d3fe4cf` |
| `PLAID_SECRET` | `a75122cba90003150e669deca7b587` |

### Database Migration Applied
- `plaid_items` table created with RLS (SELECT own rows; INSERT only via service_role)
- Columns: `id`, `user_id`, `item_id`, `access_token_encrypted`, `institution_id`, `institution_name`, `linked_at`, `disconnected_at`, `last_sync_at`

---

## Key Technical Decisions Made

| Decision | Rationale |
|----------|-----------|
| Used `open.exchangerate-api.com` for FX rates | Free, no API key required, reliable |
| Plaid sandbox mode | Free, test with `user_good`/`pass_good`, no real bank needed |
| A/B testing via localStorage + GA4 | No third-party service needed; 50/50 split persisted per user |
| Expo for mobile app | Play Store ready via EAS Build, single codebase |
| PlaidLinkButton placed in Settings page | Logical home — users configure their account integrations here |
| Platform-level transfers for sale (not new accounts) | Preserves git history, DB data, existing deploy pipeline |

---

## Plaid Account Details

| Field | Value |
|-------|-------|
| Account | `mohit.singh.rajput.2308@gmail.com` |
| Company | FinTrack Inc. |
| Dashboard | https://dashboard.plaid.com |
| Environment | Sandbox |
| Status | Preview access (verify email for full access) |

**Sandbox Test Credentials (use inside Plaid Link modal):**
- Username: `user_good`
- Password: `pass_good`
- Works with: Plaid Test Bank, First Platypus Bank, and most sandbox institutions

---

## Pending Actions (Not Yet Done)

| Item | Details |
|------|---------|
| Verify Plaid email | Check `mohit.singh.rajput.2308@gmail.com` for Plaid verification email and click the link |
| Stripe integration | Tier 1 — `localIsPro` is still a mock. Needs Stripe Checkout + webhook → `profiles.is_pro` |
| Feature gating | After Stripe — gate export, recurring transactions, API docs behind `is_pro` |
| GA4 env var | Set `REACT_APP_GA_MEASUREMENT_ID` in Vercel dashboard env vars |
| Email service keys | Set `RESEND_API_KEY` + `FROM_EMAIL` in Supabase Edge Function secrets |
| Plaid production | After email verified + business questionnaire in Plaid dashboard |
| Mobile app publish | Run `eas build --profile production` then `eas submit` — needs Google Play dev account ($25) |

---

## Project Current State (End of Session)

### What's fully live and working
- ✅ Landing page (10 sections) + 16 standalone pages
- ✅ Dashboard (15 pages) — fully Supabase-powered
- ✅ Authentication — email/OTP/2FA/OAuth/CAPTCHA/recovery codes
- ✅ All CRUD — transactions, budgets, goals, investments, bills, categories
- ✅ CSV/PDF export
- ✅ PWA (installable, offline-capable)
- ✅ Newsletter backend (Edge Function + Resend, needs API key)
- ✅ Contact form backend (Supabase table)
- ✅ Onboarding wizard
- ✅ 86 automated tests (60 unit + 26 integration)
- ✅ GitHub Actions CI (runs on every push)
- ✅ Crisp live chat (ID: `6a2c2df9`)
- ✅ Multi-currency FX rates (8 currencies, live rates)
- ✅ A/B testing (CTASection wired, GA4 events)
- ✅ Bank linking — Plaid sandbox live in Settings page
- ✅ Mobile app scaffold (Expo, Play Store ready)

### What needs credentials/activation
- ⏳ Stripe (not connected — `localIsPro` is mock)
- ⏳ Resend email (`RESEND_API_KEY` not set in Supabase secrets)
- ⏳ GA4 (`REACT_APP_GA_MEASUREMENT_ID` not set in Vercel)
- ⏳ OAuth providers (Google/GitHub/Apple/Microsoft coded, client IDs not entered in Supabase)
- ⏳ Cloudflare Turnstile CAPTCHA (site key not configured in Supabase Auth)
- ⏳ Plaid Production (sandbox is live; production needs Plaid business verification)

---

## Useful Commands

```bash
# Run tests
cd landing-page && npm test -- --watchAll=false

# Build locally
cd landing-page && CI=false npm run build

# Deploy Edge Functions
$sb = "$env:TEMP\supabase.exe"
& $sb functions deploy plaid-create-link-token
& $sb functions deploy plaid-exchange-token

# Check git log
git log --oneline -10

# Mobile app (after npm install in mobile-app/)
cd mobile-app && npm run android
cd mobile-app && eas build --profile production
```

---

## Conversation Key Points

- **Selling the project:** Use platform-level ownership transfers (GitHub repo transfer, Supabase org member transfer, Vercel project transfer). Do NOT create a new account or migrate — everything transfers in minutes.
- **What buyer sets up themselves:** Stripe, Plaid, Resend, GA4, OAuth app credentials, Cloudflare Turnstile — all free-tier, all account-specific.
- **Plaid India note:** Plaid is primarily US/UK/CA/AU focused. Production access requires business verification. Sandbox works for testing regardless of location.
- **ExchangeRate-API:** Completely free, no API key, endpoint: `https://open.exchangerate-api.com/v6/latest/USD`

---

*Session Log — Generated March 2, 2026*
