# FinTrack - 3D Animation Landing Page
## Product Requirements Document

---

## Original Problem Statement
CREATE A 3D ANIMATION LANDING PAGE DESIGN FOR A FINANCE TRACKING APP. FOR REFERENCE I HAVE GIVEN DESIGN TOO YOU. PLEASE STICK TO THE DESIGN I CHOOSE

**Reference Design Analysis:**
- METATOPIA metaverse landing page with 3D animated cityscape
- Vibrant purple, magenta, pink, blue color palette with neon accents
- Dynamic 3D elements: flying vehicles, animated billboards, particle effects
- Modular sections with parallax scrolling
- Modal pop-ups and interactive elements
- Hero section with immersive environment

**Adapted Solution:**
Created FinTrack landing page inspired by reference design's 3D animation style, but adapted for finance tracking app with professional blue/teal color scheme and dark amber/orange accent theme.

---

## User Personas

### Primary: Individual Finance Users
- Age: 25-45
- Goal: Track expenses, create budgets, save money
- Pain Point: Difficulty managing personal finances
- Tech Savviness: Medium to High

### Secondary: Small Business Owners
- Age: 30-55
- Goal: Track business expenses, tax preparation
- Pain Point: Need team collaboration for finance tracking
- Tech Savviness: Medium

---

## Core Requirements (Static)

### Design Requirements
1. **3D Animations**: Floating elements, blob animations, smooth transitions
2. **Color Scheme**: Professional blue/teal gradient (finance-appropriate)
3. **Interactive Elements**: Hover effects, scroll animations, parallax
4. **Responsive Design**: Mobile, tablet, desktop optimized
5. **Modern UI**: Shadcn UI components, clean layout

### Sections Required
1. Hero Section with 3D elements & cinematic video background
2. Features showcase (6 key features)
3. 3D Showcase Section (technology stats & interactive dashboard)
4. How It Works (4-step process)
5. Pricing (3 tiers with 14-day free trial)
6. Review / Community Feedback (user reviews with video background)
7. CTA Section (dark amber/orange theme)
8. Footer (global community hub, 12 social platforms, newsletter)

### Technical Stack
- Frontend: React, Tailwind CSS, Shadcn UI
- Animations: CSS keyframes, transforms
- Routing: React Router DOM

---

## What's Been Implemented ✅

### Date: February 2026

#### Frontend Components Created:
1. **Navbar.jsx**
   - Fixed navigation with glass-morphism effect on scroll (`#0A0A0B` background)
   - Logo image (brand identity)
   - Desktop & mobile responsive menu (5 links: Home, Features, How It Works, Pricing, FAQ)
   - Theme toggle (dark/light mode with Sun/Moon icon)
   - CTA buttons: "Log In" and "Get Started Free"

2. **HeroSection.jsx**
   - Cinematic looping video background (`hero_bg_new.mp4`)
   - ParticleSystem and WireframeMesh background effects
   - Floating 3D coin elements (yellow, emerald, blue) with rotation
   - 3D credit card with mouse-parallax (chip, card number, holder name, expiry)
   - Main headline: "Take Control of Your Finances" with gradient text (blue→teal→cyan)
   - Right-side dashboard mockup with floating stat cards (Total Savings $24,580, Monthly Budget $3,200)
   - User statistics (100K+ Active Users, $500M+ Money Tracked, 4.9/5 User Rating)
   - Dual CTA buttons: "Get Started Free" (blue-to-teal gradient) + "Watch Demo" (outline with Play icon)
   - Animated scroll indicator

3. **FeaturesSection.jsx**
   - 6 feature cards in responsive grid (3x2)
   - Gradient icon backgrounds for each feature:
     - Expense Tracking (Wallet, blue)
     - Budget Planning (Target, teal)
     - AI-Powered Insights (TrendingUp, cyan)
     - Reports & Analytics (PieChart, indigo)
     - Bill Reminders (Bell, emerald)
     - Financial Goals (Shield, violet)
   - 3D perspective tilt on hover with holographic overlay
   - Secondary feature highlight with Unsplash image and bullet list
   - Subtle blur blob background decorations

4. **Showcase3DSection.jsx**
   - Full-width dark section with cinematic video background (`showcase_bg.mp4`)
   - Animated grid background (blue lines, 50px spacing)
   - Mouse-parallax 3D floating dashboard mockup ("FinTrack PRO")
   - 4 technology stats: 2.5x Faster Budgeting, 100% Secure & Encrypted, <1s Real-time Sync, 150+ Countries
   - Inner dashboard with animated market performance chart bars
   - Holographic scanner sweep animation
   - Floating "Smart Alert" and "AI Insight" mini-modules

5. **HowItWorksSection.jsx**
   - 4-step process visualization with gradient connecting line (blue→teal→cyan)
   - Circular gradient icons for each step with 3D-style large step numbers
   - Arrow indicators between cards, hover lift + shadow
   - Background: `bg-gradient-to-br from-gray-50 to-blue-50`
   - Steps:
     1. Create Your Account
     2. Connect Your Accounts
     3. Track & Analyze
     4. Achieve Your Goals

6. **PricingSection.jsx**
   - 3 pricing tiers: Free ($0/mo), Pro ($9.99/mo), Business ($29.99/mo)
   - "Most Popular" badge on Pro plan
   - Detailed feature lists with checkmarks
   - Hover effects and scale transformation
   - 14-day free trial for paid plans (cancel anytime during trial, no charge; all payments are final and non-refundable)
   - "FAST-TRACK SYNC" secondary button: "Skip Trial & Pay Now"
   - Trust badges: "Secure payments by Stripe • Cancel during trial, no charge • All payments non-refundable • No hidden fees"

7. **FAQSection.jsx**
   - Shadcn Accordion component (Radix UI)
   - 16 frequently asked questions covering:
     - Account creation & sign-in troubleshooting
     - 2FA setup, QR scanning, authenticator apps, recovery
     - Password reset & security questions
     - Data safety, multi-device usage
     - Income/expense tracking, budgets, goal setting
     - Data export options
   - Smooth expand/collapse animations
   - Hover effects on accordion items
   - Contact support CTA at bottom (support@fintrack.com)

8. **ReviewSection.jsx**
   - Cinematic video background (`chip_01.mp4`) with dark overlays
   - Heading: "Community Feedback"
   - 3 initial reviews (5★ and 4★ ratings, verified badges)
   - User review submission form (username, email, star rating, text)
   - Reviews rendered in responsive grid with status badges (verified/pending)

9. **CTASection.jsx**
   - Dark amber/orange theme (background: `#0C0A07`)
   - Subtle mouse-tracking radial amber glow effect (18% + 14% opacity layers)
   - Badge: "Join 50,000+ smart savers"
   - Heading: "Stop Wondering. Start Growing." (gradient: amber→orange→red)
   - 4 feature pills: Bank-grade security, Smart insights, Real-time sync, AI-powered
   - Dual CTA buttons: "Get Started Free" (orange gradient) + "See how it works" (outline)
   - Avatar row + "50,000+ people already growing their wealth"
   - Bottom trust badges: "No credit card required", "Free forever plan", "14-day free trial — cancel anytime"

10. **Footer.jsx**
    - Dark amber/orange theme (background: `#0C0A07`, matching CTA)
    - Brand tagline: "Your money tells a story. FinTrack helps you write a better one…"
    - 4-column link structure:
      - Product (Features, Pricing, Security, Roadmap, Changelog)
      - Company (About Us, Careers, Press Kit, Contact)
      - Resources (Blog, Help Center, API Docs, Community)
      - Legal (Privacy Policy, Terms of Service, Cookie Policy, GDPR)
    - **Global Community Section**:
      - Badge: "Connected Everywhere" / Heading: "Join Our Global Community"
      - World map background image
      - 4 stats: 50K+ Members, 120+ Countries, 24/7 Active Chat, 99% Satisfaction
      - 12-platform social grid: WhatsApp, Telegram, Discord, YouTube, LinkedIn, Instagram, GitHub, X, Reddit, Threads, Facebook, Quora
      - Each platform card with brand gradient, member count, and action CTA
    - Newsletter subscription: "Stay in the Loop" with email input + Subscribe button
    - Bottom bar: © 2026 FinTrack + Bank-level Security + SOC 2 Compliant

#### Styling & Animations (App.css):
- Custom keyframe animations:
  - `float`: Vertical floating with rotation (6s duration)
  - `blob`: Organic blob movement (7s duration)
  - `fade-in`: Opacity transition
  - `slide-up`: Entry animation with translation
  - `pulse-glow`: Shadow pulsing effect
  - `aurora-shift`: Aurora color shifting (20s)
  - `coin-spin`: Y-axis coin rotation (3s)
  - `wave-path`: Horizontal wave motion (3s)
  - `rise`: Vertical rise with fade-in
  - `ticker-scroll`: Horizontal ticker scrolling
- Animation delay utilities (200ms to 4000ms)
- Custom scrollbar with gradient thumb
- Floating coin 3D effect with shine overlay
- Glass morphism utility class
- 3D card hover effects
- Smooth scroll behavior

#### Media Assets:
- Hero background video: `hero_bg_new.mp4`
- Showcase background video: `showcase_bg.mp4`
- Review section video: `chip_01.mp4`
- Brand logo: `ft_logo.png`
- World map: `world_map2.avif`
- Feature highlight: Unsplash finance image

---

## Current Status
✅ **Frontend Landing Page Complete** — All 10 sections with 3D animations, responsive design, cinematic video backgrounds.
✅ **16 Standalone Pages** — Privacy, Terms, Cookies, GDPR, About, Careers, Press, Contact, Blog, Help, API Docs, Community, Security, Roadmap, Changelog, FAQ.
✅ **Dashboard Fully Implemented** — `/dashboard` with 15 nested pages: Dashboard, Profile, Income, Expenses, Budgets, Goals, Transactions, Reports, Investments, Bills, Calculators, Categories, Settings, Help, ApiDocs. **Supabase is the single source of truth** — all financial data fetched via `SecureAPI → supabaseService → Supabase` (RLS-protected). No financial data stored in localStorage. All pages use dynamic currency and date format from user settings.
✅ **Recurring Transactions** — `transactions` table extended with `is_recurring`, `recurrence` (`daily/weekly/monthly/yearly`), and `next_occurrence` columns (migration `20250226_add_recurring_transactions.sql`).
✅ **Newsletter Security** — `newsletter_subscribers` Supabase table with email-format-validated RLS INSERT policy (regex + max 254 chars + known `source` allowlist). Anonymous SELECT replaced with authenticated-scoped SELECT.
✅ **Dynamic Currency System** — Default USD (`$`), user-selectable (USD/EUR/GBP/INR/JPY/CAD/AUD/SGD) in Settings. Selected currency propagates to all pages, charts, and calculators in real time. Stale INR/DD-MM-YYYY localStorage values auto-migrated to USD/MM-DD-YYYY on load.
✅ **Trial / Refund Policy** — 14-day free trial (cancel anytime, no charge); all payments non-refundable.

### Pages & Routes:
| Route | Component |
|---|---|
| `/` | Landing Page (10 sections) |
| `/dashboard/*` | DashboardApp (entry point) |
| `/dashboard` | Dashboard (overview) |
| `/dashboard/profile` | Profile |
| `/dashboard/income` | Income |
| `/dashboard/expenses` | Expenses |
| `/dashboard/budgets` | Budgets |
| `/dashboard/goals` | Goals |
| `/dashboard/transactions` | Transactions |
| `/dashboard/reports` | Reports |
| `/dashboard/investments` | Investments |
| `/dashboard/bills` | Bills |
| `/dashboard/calculators` | Calculators |
| `/dashboard/categories` | Categories |
| `/dashboard/settings` | Settings |
| `/dashboard/help` | Help |
| `/dashboard/api-docs` | ApiDocs |
| `/privacy` | PrivacyPolicy |
| `/terms` | TermsOfService |
| `/cookies` | CookiePolicy |
| `/gdpr` | GDPRCompliance |
| `/about` | AboutUs |
| `/careers` | Careers |
| `/press` | PressKit |
| `/contact` | Contact |
| `/blog` | Blog |
| `/help` | HelpCenter |
| `/api-docs` | APIDocs |
| `/community` | Community |
| `/security` | SecurityPage |
| `/roadmap` | Roadmap |
| `/changelog` | Changelog |
| `/faq` | FAQ |

---

## Prioritized Backlog

### P1 - Future Enhancements
1. **Contact Form Integration**
   - ~~Newsletter subscription functionality (backend API)~~ — ✅ Done: `newsletter_subscribers` table in Supabase with email-regex RLS policy
   - Email capture with CRM (Mailchimp, SendGrid)

2. **Analytics Integration**
   - Google Analytics / Plausible
   - Track button clicks, scroll depth, conversion

3. **Performance Optimization**
   - Image lazy loading
   - ~~Code splitting per route~~ — ✅ Done: `React.lazy` + `Suspense` on all 17+ top-level routes
   - Bundle size optimization

### P2 - Nice to Have
1. **A/B Testing**
   - CTA button texts, pricing tier arrangements, hero variations

2. **Accessibility Improvements**
   - Enhanced ARIA labels, keyboard navigation, screen reader testing

3. **Blog/Content Section**
   - Financial tips, success stories, product updates

---

## Next Tasks

### Immediate Next Steps:
1. ✅ Landing page frontend complete (10 sections)
2. ✅ 16 standalone pages built
3. ✅ Dashboard fully implemented — 10 pages, FinanceContext, dynamic currency system
4. Deploy landing page for marketing
5. Backend API for newsletter & contact forms
6. Analytics integration

---

## Technical Notes

### Color Palette Used:
- Primary: Blue (from-blue-500 to-blue-600)
- Secondary: Teal (from-teal-500 to-teal-600)
- Accent: Cyan (from-cyan-500 to-cyan-600)
- Supporting: Indigo, Emerald, Violet for feature variety
- CTA / Footer theme: Dark amber/orange (`#0C0A07` bg, amber→orange→red gradients)
- Navbar dark: `#0A0A0B`
- No dark purple/pink gradients (per design guidelines)

### Animation Performance:
- CSS transforms (GPU-accelerated)
- Will-change properties where needed
- Reduced motion media query support available

### Accessibility:
- Semantic HTML structure
- Color contrast ratios meet WCAG AA
- Focus states on interactive elements
- Alt text on images

---

## Success Metrics (Future)
- Page load time < 2s
- Lighthouse score > 90
- Conversion rate tracking
- Bounce rate < 50%
- Mobile usability score > 95

---

**Last Updated:** March 1, 2026
**Status:** Landing Page + Dashboard Suite Complete ✅ — 10 sections, 16 pages, full dashboard (15 pages), Supabase data layer, recurring transactions, code-splitting, newsletter RLS fix.

---

## Update: February 2026 — Dynamic Currency System

### What Changed
The dashboard was upgraded from a scaffolded route to a fully operational finance management suite. The default currency was changed from INR (₹) to USD ($) globally, and a localStorage migration was added so existing users are automatically upgraded on next load.

### Implementation Summary

| Area | Change |
|------|--------|
| Default currency | `$` (USD), locale `en-US` |
| Default date format | `MM/DD/YYYY` |
| FinanceContext migration | Stale `₹` → `$`, `DD/MM/YYYY` → `MM/DD/YYYY` auto-applied on app load |
| Settings picker | USD first, INR kept as 4th option |
| All 10 dashboard pages | Use `const { currency } = useFinance()` → `formatCurrency(amount, currency)` |
| 4 chart components | Receive `currency` prop from parent page callers |
| Calculators.jsx | Now uses `useFinance()` — EMI, SIP, Compound Interest all show selected currency |

---

## Update: February 2026 - Enhanced 3D Effects

### New Components Added:

1. **ParticleSystem.jsx**
   - Canvas-based particle animation with connecting lines
   - 50 floating particles with random movement
   - Particle connection visualization (distance < 150px)
   - Blue color theme with opacity variations

2. **WireframeMesh.jsx**
   - SVG-based 3D wireframe meshes
   - Curved grid patterns with perspective transforms
   - Multiple color variants (blue, teal, cyan, green)
   - Positioned at corners with floating animation
   - Pulsing glow effects on nodes

3. **FloatingCards3D.jsx**
   - Animated 3D floating stat cards
   - Perspective transforms and rotations
   - Glass-morphism with backdrop blur
   - Cards: Investment Growth, Total Income, Credit Score, Savings Goal
   - Staggered animation delays

4. **DataStream.jsx**
   - Matrix-style falling data animation
   - Canvas-based with monospace font
   - Currency symbols ($, €, £, ¥, ₿) and numbers
   - Green/teal color matching finance theme
   - Positioned on sides of sections

5. **Showcase3DSection.jsx**
   - Full-width dark section (gray-900 to blue-900)
   - Animated grid background
   - 4 floating stat cards with 3D transforms
   - 3D dashboard preview with perspective
   - Animated chart bars
   - Data streams on left and right sides
   - Glowing particle effects

### Enhanced CSS Animations:

- `float-3d`: 8s 3D rotation and translation
- `float-slow`: 10s slow floating with rotation
- `rotate-3d`: 20s continuous 3D rotation
- `shimmer`: 3s linear shimmer effect
- `data-flow`: 3s vertical data flow
- `pulse-slow`: 4s opacity pulsing
- `holographic`: 8s gradient animation
- `wireframe-draw`: 4s stroke animation

### Enhanced Effects:

1. **Neon Glow**: Text shadow with multiple layers
2. **3D Text**: Layered shadow for depth
3. **Holographic**: Animated gradient backgrounds
4. **Card Perspective**: 3D tilt on hover with transforms
5. **Enhanced Shadows**: Multi-layer box shadows
6. **Floating Coins**: Improved with shine overlay

### Visual Enhancements:

- 3D credit card in hero section with chip and gradient
- Wireframe meshes in corners of hero section
- Particle connections throughout hero
- Enhanced feature cards with holographic overlay
- Perspective transforms on all interactive cards
- Glowing effects on icons and buttons
- Matrix-style data streams
- Dark showcase section with 3D stats

### Performance Considerations:

- Canvas elements for particle systems
- GPU-accelerated transforms (translateZ, rotateY, rotateX)
- RequestAnimationFrame for smooth animations
- Optimized particle count (50 particles)
- Efficient SVG wireframe rendering

---

**Status:** Phase 2 Complete — Advanced 3D Effects & Animations ✅

---

## Update: March 1, 2026 — Supabase Backend, Recurring Transactions & Security Hardening

### What Changed

#### 1. Data Layer Migration (localStorage → Supabase)
All financial data (transactions, budgets, goals, investments, bills, categories) is now fetched exclusively from Supabase via a secure API gateway. localStorage is reserved for non-sensitive UI preferences (currency, date format) only.

| Area | Old | New |
|------|-----|-----|
| Financial data storage | localStorage via FinanceContext | Supabase (RLS-protected PostgreSQL) |
| Data fetch | On mount from localStorage | `Promise.allSettled` via `SecureAPI` |
| Fallback | localStorage seed data | Empty arrays (no fake data) |
| Sync status | N/A | `idle / syncing / synced / offline` indicator |

#### 2. Dashboard Expanded to 15 Pages
Added 5 new pages to the dashboard (previously 10):
- **Profile** — user info, avatar, account settings
- **Categories** — custom income/expense category management
- **Help** — in-app help center
- **ApiDocs** — developer API documentation (Swagger UI)
- (Settings, Help, ApiDocs are protected routes; Categories integrated with FinanceContext/Supabase)

#### 3. Recurring Transactions
The `transactions` table now supports recurring entries:

| Column | Type | Values |
|--------|------|--------|
| `is_recurring` | BOOLEAN | `true / false` (default `false`) |
| `recurrence` | TEXT CHECK | `daily / weekly / monthly / yearly` |
| `next_occurrence` | DATE | Next scheduled date |

Migration file: `landing-page/supabase/migrations/20250226_add_recurring_transactions.sql`

#### 4. Newsletter RLS Security Fix
Replaced the overly permissive `WITH CHECK (true)` INSERT policy on `public.newsletter_subscribers` with a restrictive policy that validates:
- Email format (RFC 5321 regex)
- Email length ≤ 254 chars
- `source` must be one of: `footer`, `hero`, `cta`, `blog`

Also replaced open `Allow anon select` with `Allow authenticated select own row` (scoped to `email = auth.email()`).

Migration file: `landing-page/supabase/migrations/20260301_fix_newsletter_rls_policy.sql`

#### 5. Code Splitting
All 17+ top-level routes are now lazy-loaded via `React.lazy` + `Suspense` with a centralized spinner fallback, reducing initial JS bundle size.

#### 6. New Dashboard Infrastructure

**New Contexts (dashboard-scoped):**
- `NotificationContext.jsx` — toast notification queue
- `ThemeContext.jsx` — dashboard-level dark/light mode

**New Components:**
- `OnboardingWizard.jsx` — first-run setup flow
- `AdBanner.jsx` — in-app upgrade prompt banner
- `UpgradeModal.jsx` — Pro plan upgrade dialog

**New Utilities:**
- `exportService.js` — CSV & PDF export (jsPDF + PapaParse)
- `validators.js` — form-level validation schemas
- `config.js` — feature flags and environment config

**Security stack** (unchanged): `secureApi.js → supabaseService.js → Supabase`

---

**Status:** Phase 3 Complete — Supabase Backend + Security Hardening + Recurring Transactions ✅

---

### Phase 4 Updates — March 2, 2026

#### 1. CSP Hardening
- Removed `'unsafe-inline'` from `script-src` in `vercel.json` — CRA production build never uses inline scripts. `style-src 'unsafe-inline'` retained (needed by Tailwind/Radix/Framer Motion). Commit: `8b15006`.

#### 2. Auth Functions Implemented
- `updateProfile()` in `AuthContext.jsx` — now writes to `profiles` table in Supabase (`full_name`, `avatar_url`, `updated_at`). Previously was a stub.
- `changePassword()` in `AuthContext.jsx` — now calls `supabase.auth.updateUser({ password })`. Previously was a stub.

#### 3. Full RLS Audit
- All 11 tables verified via Supabase Management API. Every policy confirmed to use `auth.uid() = user_id` correctly (or `auth.uid() = id` for profiles). No always-true policies remain.
- 1 remaining Security Advisor warning: **Leaked Password Protection** — requires Supabase Pro plan (HaveIBeenPwned API). Not fixable on free tier.

#### 4. Stripe Key Preparation
- `REACT_APP_SUPABASE_PUBLISHABLE_KEY` in `.env.example` clarified via comment — reserved for future Stripe publishable key (`pk_live_...`) when payment integration is built.

**Status:** Phase 4 Complete — Security Hardening Round 2 ✅

---

## Future Roadmap

Prioritized by impact. Items marked 🔴 are highest value before any public launch or sale.

### 🔴 Tier 1 — Revenue & Critical

| # | Feature | Effort | Why It Matters |
|---|---------|--------|----------------|
| 1 | **Stripe Payment Integration** | 2–3 days | Connects Pro ($9.99/mo) + Business ($29.99/mo) tiers. Even $100 MRR transforms this from a code asset into a SaaS business. Use Stripe Checkout + webhook to update `profiles.is_pro` in Supabase. |
| 2 | **Feature Gating (Free vs Pro)** | 1 day | Free users: 50 transactions/month. Pro: unlimited. Gate export, recurring transactions, API docs behind Pro using `localIsPro` (already wired). |
| 3 | **Server-Side Rate Limiting** | 2–3 days | Move rate limiting from client-side `Map()` (resets on refresh) to Supabase Edge Functions. Requires **Supabase Pro plan**. Current client-side limiting is UX-only, not security enforcement. |
| 4 | **Leaked Password Protection** | 0 dev time | Enable in Supabase Auth settings. Requires **Supabase Pro plan**. Checks passwords against HaveIBeenPwned on signup/change. |

### 🟡 Tier 2 — User Value & Retention

| # | Feature | Effort | Why It Matters |
|---|---------|--------|----------------|
| 5 | **CSV / PDF Export** | 1 day | #1 most-requested feature in finance apps. `jsPDF` + `PapaParse` already in `package.json`. Gate full history behind Pro — free users get last 30 days only. |
| 6 | **Weekly Email Summary** | 1–2 days | Automated re-engagement: "You spent $X this week, saved $Y". Use Supabase `pg_cron` + Resend/SendGrid free tier. |
| 7 | **Google Analytics 4** | 2 hours | Add GA4 script to `index.html`. Track: page views, button clicks, signup conversions. Required to show engagement data to any potential buyer or investor. |
| 8 | **Working Newsletter Backend** | 3–4 hours | Footer subscribe form currently stores to `newsletter_subscribers` table (RLS is fixed). Wire up a confirmation email via Resend/SendGrid. |
| 9 | **First-Time Onboarding Flow** | 4–6 hours | `OnboardingWizard.jsx` already exists. Wire it to fire on first login: pick currency → add first transaction → set first budget. Reduces new-user drop-off. |
| 10 | **PWA Support** | 2–3 hours | Add `manifest.json` with icons + register a service worker. Users can "Add to Home Screen" on mobile. No app store submission needed. |

### 🟢 Tier 3 — Launch & Growth

| # | Feature | Effort | Why It Matters |
|---|---------|--------|----------------|
| 11 | **Automated Tests (Jest + Playwright)** | 2–3 days | 10–15 Jest unit tests for `FinanceContext` CRUD + 3–5 Playwright E2E tests for signup → add transaction → view dashboard. Signals code quality to buyers/investors. |
| 12 | **GitHub Actions CI/CD** | 1 day | Auto-run tests + lint on every push. Auto-deploy to Vercel on merge to `main`. |
| 13 | **Crisp Live Chat Widget** | 30 min | Single `<script>` tag in `index.html`. Free tier: 2 agents, unlimited conversations. Makes the product feel supported. |
| 14 | **Fix Social Proof Numbers** | 30 min | Landing page claims "100K+ Active Users" and "$500M+ Money Tracked" with zero real users. Replace with "Built for 100K+ users" or remove until real data exists. |
| 15 | **Mobile App — Google Play Publish** | 1 week | React Native/Expo app already in development. Publish to Google Play. Adds ~$2,000–$5,000 to valuation and opens a new user acquisition channel. |
| 16 | **Multi-currency Live FX Rates** | 2–3 days | Integrate a free FX API (ExchangeRate-API free tier) to auto-convert transaction amounts. Currently currency is a display-only setting. |
| 17 | **Bank Account Linking (Plaid/Finicity)** | 1–2 weeks | Auto-import transactions from real bank accounts. This is the single biggest technical moat in the fintech space. Requires Plaid API keys (~$500/mo at scale but free in development). |

### 🔵 Tier 4 — Pro Plan Upgrades (After Supabase Pro)

| # | Feature | Notes |
|---|---------|-------|
| 18 | Server-side rate limiting via Edge Functions | Replaces `rateLimit.js` Map() |
| 19 | Leaked password protection (HaveIBeenPwned) | Enable in Supabase Auth settings |
| 20 | Regional data residency | Supabase Pro → choose data region for GDPR compliance |
| 21 | IP allowlisting | Restrict DB access to Vercel egress IPs only |
| 22 | Supabase `pg_cron` for recurring transactions | Auto-create scheduled transactions server-side |
