# Security & Compliance Guide — FinTrack

**Version**: 4.2  
**Last Updated**: March 1, 2026  

---

## 1. Security Checklist

Run before every release. Automated via `node scripts/validate-security.js`.

### Pre-Development (DONE ✅)
- [x] Credentials in `.env` file (not hardcoded in source)
- [x] `.env` added to `.gitignore`
- [x] Runtime validation if credentials missing (fast-fail)
- [x] RLS enabled on ALL tables (profiles, transactions, budgets, investments, audit_logs)
- [x] Rate limiting on auth endpoints (5/min, 5-min lockout)
- [x] Input validation on all auth fields (email, password, username)
- [x] Input sanitization constraints on all DB text fields
- [x] HTML/script injection blocked in description fields
- [x] Future-dated transactions prevented
- [x] Audit logging on all INSERT/UPDATE/DELETE
- [x] Audit logs are immutable (no UPDATE, no DELETE)
- [x] Soft delete for transactions (with 90-day retention)
- [x] No sensitive data in console.log
- [x] OAuth sign-in (Google, Microsoft, Apple, GitHub)
- [x] 6-digit OTP email verification (59s cooldown, 3 attempts, 12hr lockout)
- [x] CAPTCHA integration (Cloudflare Turnstile)
- [x] Password strength requirements (8+ chars, uppercase + lowercase + number)
- [x] OAuth users auto-verified (no OTP needed)
- [x] Temp/anonymous accounts blocked
- [x] TOTP 2FA (Google Authenticator, Microsoft Authenticator)
- [x] 8 one-time backup recovery codes (hashed in DB)
- [x] 2FA brute-force protection (5 fails → 30-min lock)

### Security Hardening Phase (DONE ✅) — v4.0
- [x] `secureApi.js` gateway for ALL financial CRUD (validation + rate limiting + sanitization)
- [x] Server-side CHECK constraints on all tables (migration_003)
- [x] Goals, bills, categories, user_settings tables with RLS (migration_002)
- [x] Session timeout — 30-min auto-logout on inactivity (`AuthContext.jsx`)
- [x] CSP + security headers via `vercel.json` (HSTS, X-Frame-Options, etc.) — includes `media-src` for Supabase Storage CDN
- [x] Automated security unit tests — 60/60 passing (`security.test.js`)
- [x] localStorage limited to UI preferences only (no financial data)
- [x] UUID validation on all record IDs
- [x] XSS detection and blocking on all text inputs
- [x] `updated_at` auto-timestamps via PostgreSQL triggers

### Newsletter Security Fix (DONE ✅) — v4.2 (March 1, 2026)
- [x] Replaced `newsletter_subscribers` permissive `WITH CHECK (true)` INSERT policy with email-format-validated policy
- [x] New policy enforces: RFC email regex, max 254 chars, `source` IN (`footer`, `hero`, `cta`, `blog`) allowlist
- [x] Replaced open `Allow anon select` with `Allow authenticated select own row` (scoped to `email = auth.email()`)
- [x] Resolves Supabase Security Advisor: "RLS Policy Always True" warning on `public.newsletter_subscribers`

### Pre-Launch (TODO)
- [ ] Supabase IP allowlisting enabled
- [ ] Supabase Pro with regional deployment for data residency
- [ ] Penetration testing completed
- [ ] Data residency compliance review (per buyer's jurisdiction)
- [ ] Key rotation procedure documented
- [ ] E2E tests for auth flows
- [ ] Configure OAuth providers in Supabase Dashboard (Google, Microsoft, Apple, GitHub)
- [ ] Configure Cloudflare Turnstile CAPTCHA keys in Supabase Auth settings
- [ ] Set up email service (SendGrid/Resend) for OTP delivery
- [ ] Test OTP lockout flow end-to-end

---

## 2. Credential Management

### Development
```
.env file (local, never committed):
  EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  EXPO_PUBLIC_CAPTCHA_SITE_KEY=0x4AAAA...  (Cloudflare Turnstile)
```

### Production (EAS Secrets)
```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJ..."
eas secret:create --name EXPO_PUBLIC_CAPTCHA_SITE_KEY --value "0x4AAAA..."
```

### Key Rotation
If a key is ever exposed:
1. Go to Supabase Dashboard → Settings → API
2. Regenerate the anon key
3. Update `.env` locally and EAS Secrets for production
4. Redeploy immediately
5. Check `audit_logs` for suspicious activity during exposure window

---

## 3. Database Security

### Row Level Security (RLS)
Every table has RLS enabled. Policies ensure users can only access their own data:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Own + org members | — (trigger) | Own only (admins: any in org) | — |
| transactions | Org-scoped (active) | Members+ | Own (managers+: any in org) | Own (admins+: any in org) |
| budgets | Org-scoped | Members+ | Own (managers+: any in org) | Own (admins+: any in org) |
| investments | Org-scoped | Members+ | Own (managers+: any in org) | Own (admins+: any in org) |
| **goals** | Own only | Own only | Own only | Own only |
| **bills** | Own only | Own only | Own only | Own only |
| **categories** | Own only | Own only | Own only | Own only |
| **user_settings** | Own only | Own only | Own only | — |
| audit_logs | Org-scoped | Own only | ❌ Blocked | ❌ Blocked |
| organizations | Own org | — (trigger) | Admins+ | — |
| branding_settings | Own org | — (trigger) | Admins+ | — |
| invitations | Admins+ (own org) | Admins+ | Admins+ | — |
| email_verifications | Own only | Own only | Own only | — |
| captcha_verifications | ❌ Service-role only | ❌ Service-role only | ❌ | ❌ |
| **newsletter_subscribers** | Authenticated (own row) | Anon (valid email + known source) | ❌ | ❌ |
| **newsletter_subscribers** | Authenticated (own row) | Anon (valid email + known source) | ❌ | ❌ |

### Input Validation (DB-level)
All text fields have length limits and pattern matching:

| Field | Max Length | Pattern | Extra |
|-------|-----------|---------|-------|
| category | 50 | `^[a-zA-Z0-9\s\-&']+$` | — |
| description | 500 | — | No `<>{}` chars |
| stock_symbol | 20 | `^[A-Z0-9\.\-]+$` | — |
| username | 50 | `^[a-zA-Z0-9_\-\s]+$` | — |
| amount | — | — | `> 0`, `<= 999,999,999.99` |
| transaction_date | — | — | `<= CURRENT_DATE + 1` |

### Audit Logging
All changes to transactions, budgets, and investments are automatically logged with:
- `old_data` (previous state, JSONB)
- `new_data` (new state, JSONB)
- `table_name`, `record_id`, `user_id`, timestamp

Audit logs are **immutable** — no user can UPDATE or DELETE them.

---

## 4. Client-Side Security

### Security Gateway (`secureApi.js`)
All financial CRUD operations are routed through `secureApi.js`, which enforces:
- **Input validation** — amount ranges, string lengths, XSS detection, UUID format
- **Rate limiting** — per-user, per-endpoint sliding window (via `rateLimit.js`)
- **Data sanitization** — HTML entity encoding, null byte removal, field whitelisting
- **Error handling** — structured error responses, no sensitive data in error messages

```
FinanceContext → secureApi.js → supabaseService.js → Supabase
                 ├─ validate     ├─ field mapping
                 ├─ sanitize     └─ CRUD operations
                 └─ rate limit
```

Supported data types: transactions, budgets, goals, investments, bills, categories, settings.

### Rate Limiting (`rateLimit.js`)
| Endpoint Type | Max Requests | Window | Lockout |
|---------------|-------------|--------|--------|
| Auth (signIn/signUp) | 5 | 60s | 5 min |
| API (CRUD) | 30 | 60s | — |
| Mutations (create/update/delete) | 10 | 60s | — |

### Input Validation (`security.js`)
- Email: format check, max 254 chars, trimmed + lowercased
- Password: min 8 chars, max 128 chars, must contain uppercase + lowercase + number
- Amounts: min $0.01, max $999,999,999.99, rounded to 2 decimals
- Descriptions: max 500 chars, XSS blacklist (`<script`, `javascript:`, `on*=`)
- Categories: max 50 chars, alphanumeric + spaces only
- Stock symbols: max 10 chars, uppercase letters only
- UUIDs: strict v4 format validation
- All text fields: null byte removal, HTML entity encoding

### Session Timeout (`AuthContext.jsx`)
| Parameter | Value |
|-----------|-------|
| Inactivity timeout | 30 minutes |
| Tracked events | click, keypress, scroll, touchstart |
| Action on timeout | Auto sign-out via `supabase.auth.signOut()` |

### Secure Storage
- **localStorage**: Used **only** for UI preferences (currency, theme, date format). **No financial data** is stored client-side.
- **JWT tokens**: Managed entirely by Supabase Auth SDK (not manually stored).
- **CSRF Protection**: Native to Supabase Auth.

---

## 4a. Authentication Hardening

### OAuth Providers
Only authenticated accounts from trusted providers are accepted:
- **Google** — primary sign-in method
- **Microsoft (Azure)** — enterprise/B2B clients
- **GitHub** — developer-focused markets

OAuth users are **auto-verified** (no OTP required).

### Email Verification (6-Digit OTP)
| Parameter | Value |
|-----------|-------|
| Code length | 6 digits (cryptographically random) |
| Cooldown between requests | 59 seconds |
| Max verification attempts | 3 per OTP |
| Code expiry | 10 minutes |
| Lockout on failure | 12 hours |
| User feedback | Real-time (attempts remaining shown) |

**Flow:** Sign up → OTP sent → User enters code → 3 tries → Lock if all fail → Unlock after 12hrs

### CAPTCHA (Cloudflare Turnstile)
- **Required on:** Sign Up, Sign In, Password Reset
- **Not required on:** OTP verification (already rate-limited)
- **Provider:** Cloudflare Turnstile (free, privacy-first, Supabase-native)
- **Invisible mode:** No user friction — challenge runs in background

### Password Requirements
| Rule | Value |
|------|-------|
| Minimum length | 8 characters |
| Maximum length | 128 characters |
| Uppercase | At least 1 required |
| Lowercase | At least 1 required |
| Number | At least 1 required |

### Blocked Account Types
- ❌ Anonymous/temporary accounts
- ❌ Disposable email addresses (enforced at provider level)
- ❌ Unverified email accounts (blocked from app access)
- ✅ Only OAuth-verified or OTP-verified accounts can access data

---

## 4b. Two-Factor Authentication (2FA/TOTP)

### Overview
Users can optionally enable TOTP-based 2FA for an extra layer of protection. This is recommended for all users handling financial data.

### TOTP Configuration
| Parameter | Value |
|-----------|-------|
| Algorithm | SHA1 (compatible with all authenticator apps) |
| Digits | 6 |
| Period | 30 seconds |
| QR Code | `otpauth://` URI, scannable by any authenticator app |
| Backup codes | 8 per user (XXXX-XXXX format, SHA-256 hashed) |

### Supported Authenticator Apps
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any TOTP-compatible app

### 2FA Login Flow
```
User enters password → ✅ Password correct
    ↓
Is 2FA enabled? → NO → Access granted
    ↓ YES
Show 2FA prompt → Enter 6-digit TOTP code
    ↓
✅ Code correct → Access granted
❌ Code wrong → Retry (5 attempts in 10 min)
    ↓ 5 failures
🔒 Locked for 30 minutes

Alternative: "Use backup code" → One-time code consumed
```

### Brute-Force Protection
| Trigger | Action |
|---------|--------|
| 5 failed TOTP attempts in 10 min | 2FA locked for 30 minutes |
| 5 failed backup code attempts in 10 min | 2FA locked for 30 minutes |
| All 8 backup codes used | User must regenerate (requires re-setup) |

### Disabling 2FA
- Requires re-authentication with password
- Deletes TOTP secret and all backup codes
- Profile updated to `tfa_enabled = false`

### Database Tables (2FA)
| Table | Purpose | RLS |
|-------|---------|-----|
| `totp_secrets` | Stores TOTP secret (encrypted), per user | Own only |
| `backup_codes` | 8 hashed recovery codes, one-time use | Own only |
| `tfa_attempts` | Audit log of 2FA verification attempts | Own only |

---

## 5. Compliance

### Data Residency
| Requirement | Current Status | Action Needed |
|-------------|---------------|---------------|
| Deploy in buyer's region | ✅ Supabase supports 12+ regions | Choose region during project setup |
| Right to be forgotten | ✅ Soft delete + purge | 90-day retention, then permanent deletion |
| Reasonable security | ✅ RLS + RBAC + rate limiting + encryption | Passes baseline |
| Breach notification | 📋 Planned | Implement per jurisdiction (e.g., 72h GDPR) |
| Multi-tenant isolation | ✅ organization_id scoping + RLS | Data fully isolated between orgs |

### Data Classification
| Level | Data | Handling |
|-------|------|---------|
| **Sensitive** | Transaction amounts, investment values | DB-level constraints, org-scoped, audit logged |
| **Personal** | Email, username, IP addresses | RLS + RBAC protected, not shared across orgs |
| **Organization** | Branding, feature flags, team settings | Admin-only access via RBAC |
| **Public** | Category names, app metadata | No restrictions |

---

## 6. Incident Response Plan

### If Credentials Are Exposed
1. **Detect**: Check Git history, APK decompilation reports, audit logs
2. **Contain**: Rotate Supabase API keys immediately (Dashboard → Settings → API)
3. **Assess**: Query `audit_logs` for unauthorized actions during exposure window
4. **Notify**: Alert affected users per applicable regulations (GDPR: 72h, etc.)
5. **Recover**: Update EAS Secrets, redeploy, patch vulnerability

### If Suspicious Activity Detected
1. Check `audit_logs` for unusual patterns (bulk deletes, rapid creates)
2. Temporarily disable the affected user's JWT (Supabase Dashboard → Auth)
3. Investigate and document findings
4. Enable additional monitoring

---

## 7. Validation

### Security Unit Tests
Run the 60-test security suite:
```bash
cd landing-page
npx craco test --watchAll=false
```

Tests cover:
- String sanitization (null bytes, HTML entities, XSS)
- Email/password validation
- Amount validation (boundaries, clamping, NaN)
- Transaction/budget/goal/bill/investment/category validation
- UUID validation (format, injection attempts)
- XSS detection (`<script>`, `javascript:`, event handlers)
- HTML escaping

**All 60 tests must pass before release.**

### Security Script
Run before every release:
```bash
node scripts/validate-security.js
```

This checks:
- No hardcoded Supabase URLs in source
- No hardcoded API keys (JWT patterns)
- `.env` file exists with required variables
- `.env` is in `.gitignore`
- No `console.log` of sensitive data
- RLS enabled on all tables
- Security patch SQL has all required components
- Rate limiting present in auth hook
- Input validation present in auth hook
- Auth hardening migration SQL exists (OTP + CAPTCHA)
- 2FA migration SQL exists (TOTP + backup codes)

---

*This document should be reviewed and updated before every major release.*
