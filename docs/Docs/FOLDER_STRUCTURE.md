# FinTrack — Folder Structure (Website-Only)

This document describes how the **Fintrack-V1** folder is organized. **Focus: website first** — mobile app removed.

---

## Root level (`Fintrack-V1/`)

| Item | Purpose |
|------|--------|
| **.cursorrules** | Cursor IDE rules for this project. |
| **.gitignore** | Git ignore patterns. |
| **vercel.json** | Vercel deployment config — CSP + security headers. |
| **scripts/** | Utility scripts (e.g. `validate-security.js` — run before release). |
| **supabase/** | **All Supabase SQL migrations** (canonical location). |
| **docs/** | **Documentation** (SECURITY, PRD, test_result, README). |

---

## Database — supabase/

| File | Purpose |
|------|--------|
| **supabase_schema.sql** | Base Supabase schema (profiles, transactions, budgets, investments). |
| **supabase_security_patch.sql** | Security patches (RLS, audit logging, input constraints). |
| **supabase_multitenant_migration.sql** | Multi-tenant migration (orgs, RBAC). |
| **supabase_auth_hardening.sql** | Auth hardening (OTP, CAPTCHA). |
| **supabase_2fa_migration.sql** | Two-factor auth (TOTP + backup codes). |
| **migration_002_goals_bills_categories_settings.sql** | Goals, bills, categories, user_settings tables + RLS + triggers. |
| **migration_003_server_side_validation.sql** | Server-side CHECK constraints for all financial tables. |

Apply these in order when setting up or updating the database.

---

## Documentation — docs/

| File | Purpose |
|------|--------|
| **docs/Docs/README.md** | Index of docs and run instructions. |
| **docs/Docs/SECURITY.md** | Security & compliance guide (v4.0). |
| **docs/Docs/SECURITY - Website Only.md** | Primary security doc (same as above). |
| **docs/Docs/PRD.md** | Product Requirements Document. |
| **docs/Docs/PRD - Website Only.md** | PRD for the landing page. |
| **docs/Docs/FOLDER_STRUCTURE.md** | This file. |
| **docs/Docs/test_result.md** | Testing protocol and test state. |

---

## Web app — landing-page/ (CRA + React) — Primary

| Path | Purpose |
|------|--------|
| **landing-page/** | Full **web app**: landing + dashboard, auth, budgets, etc. |
| **landing-page/package.json** | CRA + craco; run with `npm start` from inside `landing-page/`. |

### Source — landing-page/src/

| Path | Purpose |
|------|--------|
| **src/context/AuthContext.jsx** | Authentication state, session management, 30-min timeout. |
| **src/lib/supabase.js** | Supabase client initialization. |

### Dashboard — landing-page/src/dashboard/

| Path | Purpose |
|------|--------|
| **context/FinanceContext.jsx** | Financial data state — routes all CRUD through `secureApi.js`. |
| **utils/secureApi.js** | **Security gateway** — validation, rate limiting, sanitization for all data types. |
| **utils/security.js** | Input validators & sanitizers (email, password, amount, UUID, XSS). |
| **utils/rateLimit.js** | Client-side rate limiter (sliding window, per-user, per-endpoint). |
| **utils/config.js** | Environment variable handling (`REACT_APP_*`). |
| **services/supabaseService.js** | Supabase CRUD operations with camelCase ↔ snake_case field mapping. |
| **__tests__/security.test.js** | 60 unit tests for all security validators. |

### Key directories

| Path | Purpose |
|------|--------|
| **src/dashboard/components/** | Dashboard UI components (charts, forms, cards). |
| **src/dashboard/pages/** | Dashboard pages (Dashboard, Transactions, Budgets, etc.). |
| **src/components/** | Landing page sections (Hero, Features, FAQ, Footer). |
| **src/pages/** | Top-level pages (LandingPage, Login, Register). |

---

## Quick reference

- **Full web app (CRA)** → **landing-page/** — run `npm start` from inside
- **Run tests** → `cd landing-page && npx craco test --watchAll=false`
- **Database migrations** → **supabase/** folder (run in Supabase SQL Editor)
- **Docs & security** → **docs/**, **scripts/**
- **Deploy config** → **vercel.json** (security headers included)
